# PitCrew Control - Integration Guide

This guide explains how to integrate PitCrew Control with real Atlassian services.

## Table of Contents

1. [Real Jira Data Integration](#real-jira-data-integration)
2. [Rovo AI Integration](#rovo-ai-integration)
3. [Custom Automation Playbooks](#custom-automation-playbooks)
4. [Bitbucket Pipelines Integration](#bitbucket-pipelines-integration)
5. [Jira Service Management SLA](#jira-service-management-sla)

---

## Real Jira Data Integration

### Current State: Seeded Demo Data

By default, PitCrew Control uses seeded telemetry data for demo reliability.

**Location**: `src/handlers/telemetryUpdater.js:9`

```javascript
const useSeededData = event.useSeededData !== false; // Default: true
```

### Enable Real Jira API Calls

**Step 1**: Update telemetry handler

```javascript
// src/handlers/telemetryUpdater.js:9
const useSeededData = false; // Enable real Jira queries
```

**Step 2**: Verify permissions in `manifest.yml`

```yaml
permissions:
  scopes:
    - storage:app
    - read:jira-work
    - write:jira-work
    - read:jira-user
```

**Step 3**: Deploy changes

```bash
forge deploy
```

### How It Works

When `useSeededData = false`, the app queries:

**Sprint Velocity** (`src/telemetry.js:32-58`)
- JQL: `project = ${projectKey} AND sprint in openSprints() AND status = Done`
- Extracts: Story points from `customfield_10016`
- Compares: Current vs. baseline (from config)

**Blockers** (`src/telemetry.js:64-84`)
- JQL: `project = ${projectKey} AND priority = Highest AND status != Done`
- Returns: Top 3 blocker issues

**SLA Risk** (`src/telemetry.js:90-130`)
- JQL: `project = ${projectKey} AND priority = Highest AND resolution = Unresolved`
- Calculates: Age-based risk (> 24h = HIGH, > 12h = MEDIUM)

### Customizing Story Points Field

If your Jira uses a different custom field for story points:

```javascript
// src/telemetry.js:48
const storyPoints = issue.fields.customfield_XXXXX || 0; // Replace XXXXX
```

To find your story points field ID:
1. Go to Jira → Issue → View source
2. Search for "story points"
3. Note the `customfield_XXXXX` value

---

## Rovo AI Integration

### Architecture: Drop-In Replacement

The Pit Engineer is designed for **zero-interface-change Rovo integration**.

### Current: Deterministic Stub

**Location**: `src/handlers/pitEngineer.js:42-146`

```javascript
function generateDeterministicAnalysis(snapshot) {
  const topRisk = identifyTopRisk(snapshot);
  // Rule-based logic returns { risk, action, reason }
}
```

### Future: Rovo Integration

**Step 1**: Replace handler implementation

```javascript
// src/handlers/pitEngineer.js:12-30
import api from '@forge/api';

export async function handler(event, context) {
  const snapshot = await getTelemetry();

  if (!snapshot) {
    return { success: false, error: 'No telemetry data available' };
  }

  // Rovo AI API call
  const rovoResponse = await api.asApp().requestRovo('/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemPrompt: SYSTEM_INSTRUCTION,
      context: {
        telemetry: snapshot,
        projectKey: context.extension.project.key,
      },
    }),
  });

  const analysis = await rovoResponse.json();

  return {
    success: true,
    analysis, // { risk, action, reason }
    telemetry: snapshot,
  };
}
```

**Step 2**: Update permissions in `manifest.yml`

```yaml
permissions:
  scopes:
    - ai:read
    - ai:write
    # ... existing scopes
```

**Step 3**: Deploy changes

```bash
forge deploy
```

### System Prompt for Rovo

The system instruction is defined at `src/handlers/pitEngineer.js:148-158`:

```javascript
const SYSTEM_INSTRUCTION = `You are the Pit Engineer for an Atlassian team. Analyze sprint health, blockers, incidents, SLA risk, and deployment readiness.

Identify the highest risk and recommend ONE clear next action that reduces the most risk. Explain reasoning concisely. Prefer preventative actions over reactive ones.

Output schema:
{
  "risk": "GREEN|YELLOW|RED",
  "action": "specific action with issue keys if applicable",
  "reason": "concise explanation under 100 words"
}

Prioritize: SLA breaches > Blockers > Velocity issues > Deploy readiness.`;
```

### Expected Rovo Response Schema

```json
{
  "risk": "YELLOW",
  "action": "Assign DEMO-123 to senior engineer and add tracking label 'sla-watch'",
  "reason": "SLA at risk with 90 minutes remaining. Proactive assignment ensures timely resolution before escalation needed.",
  "targetIssue": "DEMO-123"  // Optional: can be extracted from action text
}
```

---

## Custom Automation Playbooks

### Current Playbooks

**SLA Escalation** (`src/handlers/applySuggestion.js:64-114`)
- Adds escalation comment with timeline
- Adds label `pitcrew-escalate`

**Blocker Action** (`src/handlers/applySuggestion.js:120-199`)
- Adds blocker comment with recommendations
- Adds label `pitcrew-blocker`

### Adding New Playbooks

**Example: Auto-Assign to On-Call User**

```javascript
// src/handlers/applySuggestion.js (add new function)

async function applyAutoAssign(risk, snapshot, actions) {
  const issueKey = risk.issue;
  const config = await getConfig(); // Get stored config

  if (!config.escalationUserId) {
    return {
      actions: ['no-assignee-configured'],
      message: 'Escalation user not configured',
    };
  }

  // Assign issue
  const assignBody = {
    fields: {
      assignee: {
        id: config.escalationUserId,
      },
    },
  };

  const assignResponse = await api.asApp().requestJira(
    route`/rest/api/3/issue/${issueKey}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignBody),
    }
  );

  if (assignResponse.status === 204) {
    actions.push('assigned-to-escalation-user');
  }

  return {
    actions,
    message: `Assigned ${issueKey} to escalation user`,
  };
}
```

**Step 2**: Call from automation router

```javascript
// src/handlers/applySuggestion.js:44-57
async function applyAutomation(risk, snapshot) {
  const actions = [];

  switch (risk.type) {
    case 'sla':
      return await applySLAEscalation(risk, snapshot, actions);
    case 'blocker':
      return await applyBlockerAction(risk, snapshot, actions);
    case 'critical-incident':
      return await applyAutoAssign(risk, snapshot, actions); // New playbook
    default:
      return { actions: ['no-action'], message: 'No automation configured' };
  }
}
```

---

## Bitbucket Pipelines Integration

### Goal: Real Deployment Readiness

Currently, deploy readiness is a placeholder. Integrate with Bitbucket Pipelines API:

**Step 1**: Add Bitbucket API client

```javascript
// src/services/bitbucket.js
import api, { route } from '@forge/api';

export async function getPipelineStatus(repoSlug, workspace) {
  try {
    const response = await api.asApp().requestBitbucket(
      route`/2.0/repositories/${workspace}/${repoSlug}/pipelines/?sort=-created_on&pagelen=5`
    );
    const data = await response.json();

    const failingPipelines = data.values
      .filter(p => p.state.result.name === 'FAILED')
      .map(p => p.target.ref_name);

    return {
      ready: failingPipelines.length === 0,
      failingPipelines,
    };
  } catch (error) {
    console.error('Error fetching pipelines:', error);
    return { ready: true, failingPipelines: [] };
  }
}
```

**Step 2**: Update telemetry builder

```javascript
// src/telemetry.js:23-25
import { getPipelineStatus } from './services/bitbucket';

const deployData = await getPipelineStatus('your-repo', 'your-workspace');
```

**Step 3**: Update permissions

```yaml
# manifest.yml
permissions:
  external:
    fetch:
      backend:
        - 'api.bitbucket.org'
```

---

## Jira Service Management SLA

### Goal: Real SLA Breach Prediction

**Step 1**: Query JSM SLA metrics

```javascript
// src/services/jsm.js
import api, { route } from '@forge/api';

export async function getSLAMetrics(projectKey) {
  try {
    const response = await api.asApp().requestJira(
      route`/rest/servicedeskapi/servicedesk/${projectKey}/queue/1/issue?start=0&limit=50`
    );
    const data = await response.json();

    const atRiskIssues = data.values.filter(issue => {
      const sla = issue.fields.sla;
      return sla && sla.ongoingCycle && sla.ongoingCycle.breachTime;
    });

    if (atRiskIssues.length > 0) {
      const topIssue = atRiskIssues[0];
      const breachTime = new Date(topIssue.fields.sla.ongoingCycle.breachTime.epochMillis);
      const breachEtaMinutes = Math.round((breachTime - Date.now()) / (1000 * 60));

      return {
        level: breachEtaMinutes < 60 ? 'HIGH' : 'MEDIUM',
        breachEtaMinutes,
        incidentKey: topIssue.key,
      };
    }

    return { level: 'LOW', breachEtaMinutes: null, incidentKey: null };
  } catch (error) {
    console.error('Error fetching JSM SLA:', error);
    return { level: 'LOW', breachEtaMinutes: null, incidentKey: null };
  }
}
```

**Step 2**: Update telemetry builder

```javascript
// src/telemetry.js:19
import { getSLAMetrics } from './services/jsm';

const slaData = await getSLAMetrics(projectKey);
```

---

## Configuration Storage

### Store User Preferences

```javascript
// src/storage.js (already implemented)
import { getConfig, setConfig } from './storage';

const config = await getConfig();
// {
//   automationEnabled: true,
//   escalationUserId: 'user-account-id',
//   sprintBaseline: 40,
// }

await setConfig({ ...config, sprintBaseline: 50 });
```

### Add Configuration UI

Add a settings panel to the dashboard:

```javascript
// src/frontend/Dashboard.jsx (add section)
const [config, setConfig] = useState(null);

const updateConfig = async (newConfig) => {
  await invoke('update-config', { config: newConfig });
  setConfig(newConfig);
};

// Render settings panel
<Heading size="medium">Settings</Heading>
<TextField
  label="Sprint Baseline (story points)"
  value={config.sprintBaseline}
  onChange={(value) => updateConfig({ ...config, sprintBaseline: value })}
/>
```

---

## Testing Integrations

### 1. Test Real Jira Data

```bash
# Enable real data mode
# Edit src/handlers/telemetryUpdater.js:9
# Set useSeededData = false

forge deploy
forge tunnel

# Refresh dashboard and verify real issues appear
```

### 2. Test Automation

```bash
# Create a test issue in Jira (e.g., TEST-123)
# Set priority to Highest

# Open dashboard
# Click "Ask Pit Engineer"
# Click "Apply Suggestion"

# Verify in Jira:
# - TEST-123 has new comment
# - TEST-123 has new label
```

### 3. Test Rovo (when available)

```bash
# Update src/handlers/pitEngineer.js with Rovo API call
# Update manifest.yml permissions

forge deploy

# Click "Ask Pit Engineer"
# Verify response has { risk, action, reason }
```

---

## Support

For integration questions or issues:
- Review code comments in `src/` files
- Check Forge documentation: https://developer.atlassian.com/platform/forge/
- Open an issue in the project repository

---

🏁 **Happy integrating!**
