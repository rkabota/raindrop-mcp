# 🏁 PitCrew Control™

**Turns Atlassian into a real-time race control system — detecting friction, guiding teams, and automating execution before problems slow you down.**

Built for **Codegeist 2025** (Atlassian Williams Racing Edition)

---

## Overview

PitCrew Control is an AI-orchestrated execution control center for Atlassian Forge that monitors team telemetry across Jira, predicts risk in real-time, and recommends one next-best action — with a one-click automation to apply it.

Just like a Formula 1 pit crew makes split-second decisions to keep the race on track, PitCrew Control empowers your team to:

- 📊 **Monitor** sprint health, blockers, SLA risk, and deployment readiness in a unified dashboard
- 🤖 **Predict** the highest risk to execution using AI-powered analysis (Rovo-ready architecture)
- ⚡ **Act** with one-click automation that applies recommendations directly to Jira issues

### Racing Theme Alignment

- **Race Status**: GREEN/YELLOW/RED flag system indicates team health
- **Pit Engineer**: AI agent that acts as your strategic advisor
- **Telemetry**: Real-time performance metrics across sprint velocity, blockers, SLA, and deployment
- **One-Click Pit Stop**: Automated actions to resolve detected risks

---

## What It Does

### 1. **Telemetry Dashboard** (Real-Time Race Control)

The dashboard provides a unified view of team execution health:

- **Race Status**: Visual flag (GREEN/YELLOW/RED) with reason
- **Sprint Velocity**: Current vs. baseline performance tracking
- **Blockers**: Count and top blocker issues with direct links
- **SLA Risk**: Breach prediction with ETA countdown
- **Deployment Readiness**: Pipeline status and failing builds

**Data Source**: Pulls real data from Jira APIs (with fallback to seeded telemetry for demo reliability)

### 2. **AI Pit Engineer** (Rovo-Backed Analysis)

The Pit Engineer analyzes telemetry and returns:

```json
{
  "risk": "YELLOW",
  "action": "Assign DEMO-123 to senior engineer and add tracking label 'sla-watch'",
  "reason": "SLA at risk with 90 minutes remaining. Proactive assignment ensures timely resolution before escalation needed."
}
```

**Architecture**:
- Current: Deterministic analysis stub (rule-based on telemetry signals)
- Rovo-Ready: Drop-in replacement interface for Atlassian Rovo AI integration (see `src/handlers/pitEngineer.js:9-21`)

**Decision Logic** (Priority Order):
1. SLA breaches → Immediate escalation
2. Blockers → Swarm/assign high-priority issues
3. Velocity issues → Sprint health check
4. Deploy readiness → Pipeline restoration

### 3. **One-Click Automation** (Closed-Loop Execution)

When the Pit Engineer identifies an actionable issue, the "Apply Suggestion" button executes safe, reversible actions:

**SLA Escalation Automation**:
- ✅ Adds escalation comment with SLA timeline
- ✅ Adds label `pitcrew-escalate`
- ✅ Returns confirmation with visible Jira change

**Blocker Automation**:
- ✅ Adds blocker comment with recommended actions
- ✅ Adds label `pitcrew-blocker`
- ✅ Returns confirmation with visible Jira change

**Observable Outcome**: Every automation produces a visible change in Jira that can be verified immediately.

---

## Architecture

### Event-Driven Forge Native

```
┌─────────────────────────────────────────────────────┐
│  Jira Project Page (UI Kit Dashboard)               │
│  └─ Telemetry Panels + Pit Engineer + Actions      │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│  Forge Resolver (Bridge Invocations)                │
│  └─ telemetry-updater                              │
│  └─ pit-engineer                                   │
│  └─ apply-suggestion                               │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│  Service Layer                                       │
│  ├─ Telemetry Builder (Jira API integration)       │
│  ├─ Risk Scoring Engine                            │
│  ├─ Pit Engineer AI (Rovo-ready interface)         │
│  └─ Automation Executor (Safe Jira mutations)      │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│  Forge Storage (Lightweight Telemetry Snapshots)    │
└─────────────────────────────────────────────────────┘
```

### Key Design Decisions

- **No Polling**: Event-driven architecture with on-demand telemetry refresh
- **Small Payloads**: Telemetry snapshots store only aggregated metrics, not full issue lists
- **Explainable AI**: Every recommendation includes risk level, action, and reasoning
- **Safe Automation**: All actions are reversible (comments and labels, no destructive edits)
- **Forge-Native**: 100% Forge APIs, no external services required

---

## Setup

### Prerequisites

- Atlassian account with Jira access
- Forge CLI installed (`npm install -g @forge/cli`)
- Node.js 18+ installed

### Installation Steps

1. **Clone and Navigate**
   ```bash
   cd pitcrew-control
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Authenticate with Forge**
   ```bash
   forge login
   ```

4. **Register the App**
   ```bash
   forge register
   ```
   - Choose app name: `pitcrew-control`
   - Note the generated App ID

5. **Update Manifest**
   - Edit `manifest.yml`
   - Replace `YOUR_APP_ID` with the generated App ID from step 4

6. **Deploy**
   ```bash
   forge deploy
   ```

7. **Install to Jira Site**
   ```bash
   forge install
   ```
   - Select your Jira site
   - Choose a project to install to

8. **Access Dashboard**
   - Navigate to your Jira project
   - Click "Project pages" in the left sidebar
   - Select "PitCrew Control™"

---

## 60-Second Demo Steps

### Quick Demo (Seeded Telemetry)

1. **Open Dashboard**
   - Navigate to Jira project → Project pages → PitCrew Control™

2. **View Race Status** (5 seconds)
   - Observe YELLOW flag with reason: "SLA at risk; 3 blockers"
   - Scan telemetry panels showing:
     - Sprint velocity at 70% of baseline
     - 3 blockers detected
     - SLA risk MEDIUM with 90 min ETA

3. **Ask Pit Engineer** (10 seconds)
   - Click "Ask Pit Engineer"
   - AI returns recommendation:
     - Risk: YELLOW
     - Action: "Assign DEMO-123 to senior engineer and add tracking label 'sla-watch'"
     - Reason: "SLA at risk with 90 minutes remaining..."

4. **Apply Suggestion** (10 seconds)
   - Click "Apply Suggestion"
   - Confirmation shows:
     - Applied to: DEMO-123
     - Actions: added-escalation-comment, added-label-pitcrew-escalate

5. **Verify in Jira** (15 seconds)
   - Navigate to DEMO-123 in Jira
   - See new comment: "🏁 PitCrew Control: SLA Escalation"
   - See new label: `pitcrew-escalate`

6. **Return to Dashboard** (10 seconds)
   - Click "Refresh Telemetry"
   - Observe updated timestamp
   - Explain: "In production, this would show live data from your Jira project"

**Total: 60 seconds**

---

## Fallback Demo Mode (Seeded Telemetry)

The app includes a **demo-ready seeded telemetry mode** for reliable demonstrations without live Jira data.

### Enable Seeded Data

**Option 1: Default Behavior**
- Seeded data is enabled by default in `src/handlers/telemetryUpdater.js:9`
- No configuration needed for demos

**Option 2: Toggle in Code**
```javascript
// src/handlers/telemetryUpdater.js
const useSeededData = event.useSeededData !== false; // Change to `false` for real data
```

**Option 3: UI Control (Future Enhancement)**
- Add toggle button in dashboard
- Store preference in Forge storage

### Seeded Data Snapshot

The seeded telemetry (defined in `src/telemetry.js:118-147`) provides:

- **Sprint Velocity**: 28/40 points (70% performance)
- **Blockers**: 3 issues with realistic summaries
- **SLA Risk**: MEDIUM with 90 min breach ETA
- **Deploy**: Not ready, 2 failing pipelines
- **Race Status**: YELLOW with multi-signal reason

This creates a **YELLOW flag scenario** that demonstrates:
- Risk detection across multiple signals
- Pit Engineer decision-making
- Actionable automation with visible outcome

---

## Switching to Real Data

To use live Jira data instead of seeded telemetry:

1. **Update Telemetry Handler**
   ```javascript
   // src/handlers/telemetryUpdater.js:9
   const useSeededData = false; // Enable real Jira API calls
   ```

2. **Verify Permissions**
   - Ensure `manifest.yml` includes:
     - `read:jira-work`
     - `write:jira-work`

3. **Deploy Changes**
   ```bash
   forge deploy
   ```

4. **Test with Real Project**
   - Dashboard will query Jira for:
     - Sprint issues and story points
     - High-priority unresolved issues
     - Age-based SLA risk calculation

---

## Integrating Atlassian Rovo

The Pit Engineer is architected for **drop-in Rovo integration** without changing the interface.

### Current: Deterministic Stub

```javascript
// src/handlers/pitEngineer.js:42-146
function generateDeterministicAnalysis(snapshot) {
  const topRisk = identifyTopRisk(snapshot);
  // Rule-based logic returns { risk, action, reason }
}
```

### Future: Rovo Integration

```javascript
// src/handlers/pitEngineer.js:12-21 (Integration Point)
import api from '@forge/api';

export async function handler(event, context) {
  const snapshot = await getTelemetry();

  // Replace deterministic logic with Rovo API call
  const rovoResponse = await api.asApp().requestRovo('/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemPrompt: SYSTEM_INSTRUCTION, // Defined at line 148
      telemetry: snapshot
    })
  });

  const analysis = await rovoResponse.json();

  return {
    success: true,
    analysis, // { risk, action, reason }
    telemetry: snapshot,
  };
}
```

### System Prompt for Rovo

The system instruction (lines 148-158) provides:
- Role definition: "You are the Pit Engineer for an Atlassian team"
- Input schema: telemetry snapshot object
- Output schema: `{ risk, action, reason }`
- Decision guidelines: prioritization order, preventative actions, conciseness

**Benefits of Rovo Integration**:
- More nuanced risk analysis
- Natural language explanations
- Adaptive recommendations based on historical patterns
- Multi-signal correlation beyond rule-based logic

---

## Devpost Submission Text

### 🎯 Inspiration

Formula 1 teams don't win by reacting to problems — they win through precision, coordination, and instant decision-making. Every second in the pit matters. Every call from the race engineer shapes the outcome.

We brought that discipline to software teams. Most tools tell you *what happened*. PitCrew Control tells you *what to do next* — and does it for you.

### 🏗️ What It Does

**PitCrew Control** is an AI-orchestrated execution control center for Atlassian Forge that:

1. **Monitors** team telemetry across Jira (sprint velocity, blockers, SLA risk, deployment readiness)
2. **Predicts** the highest risk to execution using an AI Pit Engineer (Rovo-ready architecture)
3. **Acts** with one-click automation that applies recommendations directly to Jira issues

**The Demo Flow (60 seconds)**:
- Dashboard shows YELLOW flag: "SLA at risk; 3 blockers"
- Click "Ask Pit Engineer" → AI recommends: "Assign DEMO-123 to senior engineer, add label 'sla-watch'"
- Click "Apply Suggestion" → Comment and label added to DEMO-123 in Jira
- Visible outcome in Jira within seconds

### 🔧 How We Built It

**Architecture**: Event-driven Atlassian Forge app with:
- **UI**: Forge UI Kit for zero-latency dashboard rendering
- **Telemetry Engine**: Real-time Jira API integration with fallback to seeded demo data
- **Risk Scoring**: Multi-signal analysis (SLA > Blockers > Velocity > Deploy)
- **AI Pit Engineer**: Deterministic stub with drop-in Rovo integration interface
- **Automation Layer**: Safe, reversible Jira mutations (comments + labels)
- **Storage**: Forge Storage for lightweight telemetry snapshots

**Tech Stack**:
- Forge API v3
- Forge UI Kit v1
- Jira REST API v3
- Node.js 18+

**Key Design Decisions**:
- No polling (event-driven only)
- Small storage payloads (aggregated metrics, not full issue lists)
- Explainable AI (every recommendation includes reasoning)
- Safe automation (no destructive operations, only comments and labels)

### 🚧 Challenges We Ran Into

1. **Compressing Signals into Actionable Insight**
   - Teams have hundreds of Jira issues, dozens of metrics, and competing priorities
   - Challenge: How do you identify the *one* action that reduces the most risk?
   - Solution: Priority-based risk scoring (SLA > Blockers > Velocity > Deploy) with single-action output

2. **Respecting Forge Limits**
   - Forge storage has payload size constraints
   - Challenge: Store telemetry snapshots without bloating storage
   - Solution: Aggregate metrics only (counts, top 3 issues) instead of full issue lists

3. **Demo Reliability Under Hackathon Conditions**
   - Real Jira data varies by project setup
   - Challenge: Ensure consistent demo experience without requiring live data
   - Solution: Seeded telemetry fallback with realistic scenario (YELLOW flag, 3 blockers, SLA risk)

4. **Making AI Decisions Explainable**
   - Black-box AI recommendations erode trust
   - Challenge: Ensure every action is traceable to a detected risk
   - Solution: Structured output schema with `{ risk, action, reason }` and detected risk type

### 🏆 Accomplishments We're Proud Of

- **An AI agent that guides execution, not just summaries**
  - Most AI tools generate text. PitCrew Control generates *actions* and applies them.

- **Closed-loop automation with visible outcomes**
  - Every "Apply Suggestion" click produces a verifiable change in Jira within seconds

- **Rovo-ready architecture**
  - Deterministic stub works today; Rovo integration is a 10-line code change

- **60-second demo capability**
  - Seeded telemetry ensures reliable demos without live project setup

- **Racing theme execution**
  - Not just terminology — the entire UX is race-control-inspired (flags, pit engineer, telemetry)

### 🚀 What's Next for PitCrew Control

**Phase 1: Deeper Integrations**
- Bitbucket Pipelines correlation for deploy readiness
- Jira Service Management SLA tracking with real breach predictions
- Confluence compliance timelines (audit-ready documentation)

**Phase 2: More Automation Playbooks**
- Sprint health check (scope adjustment recommendations)
- Blocker swarming (auto-assign multiple engineers)
- SLA escalation chains (multi-step workflows)
- Deployment pipeline recovery (retry failed builds)

**Phase 3: Rovo Production Integration**
- Replace deterministic logic with Atlassian Rovo AI
- Historical pattern learning (velocity trends, blocker patterns)
- Natural language chat interface ("What's blocking DEMO-123?")

**Phase 4: Marketplace Packaging**
- Enterprise configuration (custom risk weights, escalation paths)
- Multi-project dashboards (portfolio-level telemetry)
- Slack/Teams notifications (real-time alerts)
- Advanced analytics (team performance trends)

**Phase 5: Ecosystem Expansion**
- GitHub Actions integration (CI/CD telemetry)
- PagerDuty correlation (incident impact on sprint velocity)
- OKR tracking (execution alignment with goals)

---

**PitCrew Control™ — Because every team deserves a pit crew.**

---

## Project Structure

```
pitcrew-control/
├── manifest.yml              # Forge app configuration
├── package.json              # Node dependencies and scripts
├── README.md                 # This file
├── .gitignore                # Git exclusions
└── src/
    ├── index.js              # Main resolver (UI + function handlers)
    ├── storage.js            # Forge storage helpers
    ├── telemetry.js          # Telemetry snapshot builder
    ├── utils/
    │   └── riskScoring.js    # Risk calculation and identification
    ├── handlers/
    │   ├── telemetryUpdater.js  # Refresh telemetry handler
    │   ├── pitEngineer.js       # AI analysis handler (Rovo-ready)
    │   └── applySuggestion.js   # Automation executor
    └── frontend/
        └── Dashboard.jsx     # UI Kit dashboard component
```

---

## Contributing

This project was built for **Codegeist 2025** (Atlassian Williams Racing Edition).

For questions, feedback, or contributions, please open an issue or submit a pull request.

---

## License

MIT License - see LICENSE file for details

---

## Credits

Built with ❤️ and ☕ for Codegeist 2025

**Technologies**: Atlassian Forge, Jira REST API, Forge UI Kit, Node.js

**Inspiration**: Formula 1 pit crews, race control systems, and the relentless pursuit of execution excellence

---

🏁 **Race faster. Fail less. Win more.** 🏁
