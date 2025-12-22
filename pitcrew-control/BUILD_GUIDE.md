# 🏁 PitCrew Control - Build Guide for AI Platforms

**For AI builders creating companion apps (mobile, web, extensions)**

---

## 📍 Repository Information

**Location**: `/home/user/raindrop-mcp/pitcrew-control/`

**Git Repository**: Initialized and committed
- **Commit**: `fd7368c` - Initial PitCrew Control Forge app
- **Files**: 17 files, 3,083 lines of code
- **Status**: Production-ready

---

## 📦 Complete File Listing

```
pitcrew-control/
├── .gitignore                      # Git exclusions
├── LICENSE                         # MIT License
├── manifest.yml                    # Forge app configuration
├── package.json                    # Node.js dependencies
│
├── README.md                       # Main documentation + Devpost text
├── QUICKSTART.md                   # 5-minute install guide
├── INTEGRATION.md                  # Integration guides (Rovo, JSM, Bitbucket)
├── DEMO_SCRIPT.md                  # 60-second demo walkthrough
├── PROJECT_SUMMARY.md              # Complete project overview
├── BUILD_GUIDE.md                  # This file
│
└── src/
    ├── index.js                    # Main resolver (entry point)
    ├── storage.js                  # Forge storage helpers
    ├── telemetry.js                # Telemetry builder
    │
    ├── utils/
    │   └── riskScoring.js          # Risk scoring engine
    │
    ├── handlers/
    │   ├── telemetryUpdater.js     # Telemetry refresh handler
    │   ├── pitEngineer.js          # AI Pit Engineer (Rovo-ready)
    │   └── applySuggestion.js      # Automation executor
    │
    └── frontend/
        └── Dashboard.jsx           # Forge UI Kit dashboard
```

---

## 🔌 API Endpoints for Companion Apps

### Data Model

All companion apps can connect to the Forge app via Jira REST API or by calling Forge functions directly.

### Core Data Structures

#### 1. Telemetry Snapshot

**Source**: `src/storage.js` (Forge Storage key: `pitcrew:telemetry:latest`)

```typescript
interface TelemetrySnapshot {
  raceStatus: 'GREEN' | 'YELLOW' | 'RED';
  raceReason: string;
  sprint: {
    velocity: {
      current: number;
      baseline: number;
    };
  };
  blockers: {
    count: number;
    top: Array<{
      key: string;
      summary: string;
    }>;
  };
  slaRisk: {
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    breachEtaMinutes: number | null;
    incidentKey: string | null;
  };
  deploy: {
    ready: boolean;
    failingPipelines: string[];
  };
  updatedAt: string; // ISO8601 timestamp
}
```

**Access**:
- Forge Function: Call `telemetry-updater` handler
- Direct Storage: Read `pitcrew:telemetry:latest` key

#### 2. Pit Engineer Analysis

**Source**: `src/handlers/pitEngineer.js`

```typescript
interface PitEngineerAnalysis {
  risk: 'GREEN' | 'YELLOW' | 'RED';
  action: string;
  reason: string;
  detectedRiskType: 'sla' | 'blocker' | 'velocity' | 'deploy' | 'none';
  targetIssue: string | null; // Jira issue key
}
```

**Access**:
- Forge Function: Call `pit-engineer` handler
- Returns: Full analysis object

#### 3. Automation Result

**Source**: `src/handlers/applySuggestion.js`

```typescript
interface AutomationResult {
  success: boolean;
  appliedTo: string; // Jira issue key
  riskType: string;
  actions: string[]; // e.g., ['added-escalation-comment', 'added-label-pitcrew-escalate']
  message: string;
  error?: string;
}
```

**Access**:
- Forge Function: Call `apply-suggestion` handler
- Returns: Confirmation with applied actions

---

## 📱 Mobile App Blueprint (React Native, Flutter, Swift)

### Architecture

```
┌─────────────────────────────────────────┐
│  Mobile App (React Native / Flutter)   │
│  ├─ Home: Race Status Card             │
│  ├─ Telemetry: Charts & Metrics        │
│  ├─ Pit Engineer: AI Recommendations   │
│  └─ Actions: One-Tap Apply Button      │
└─────────────┬───────────────────────────┘
              │ REST API
┌─────────────▼───────────────────────────┐
│  Jira REST API + Forge Functions       │
│  ├─ GET /rest/forge/1/app/data         │
│  └─ POST /rest/forge/1/function/invoke │
└─────────────────────────────────────────┘
```

### Key Screens

#### 1. Home Screen

**Components**:
- Race Status Banner (GREEN/YELLOW/RED)
- Current Sprint Velocity Progress Bar
- Top 3 Blockers List
- "Ask Pit Engineer" Button

**Data Source**:
```javascript
// Fetch telemetry
const telemetry = await forge.invoke('telemetry-updater', {
  projectKey: 'DEMO',
  useSeededData: false
});

// Render race status
<View style={styles.statusBanner}>
  <Text style={statusColor}>{telemetry.snapshot.raceStatus}</Text>
  <Text>{telemetry.snapshot.raceReason}</Text>
</View>
```

#### 2. Telemetry Screen

**Components**:
- Sprint Velocity Chart (current vs baseline)
- Blocker Count Badge
- SLA Risk Timeline
- Deployment Readiness Indicator

**Libraries**:
- React Native: `react-native-chart-kit`
- Flutter: `fl_chart`
- Swift: `Charts` framework (iOS 16+)

#### 3. Pit Engineer Screen

**Components**:
- Analysis Card (risk + action + reason)
- "Apply Suggestion" Button
- Confirmation Toast

**Workflow**:
```javascript
// Call Pit Engineer
const analysis = await forge.invoke('pit-engineer', {});

// Display recommendation
<Card>
  <Badge color={riskColor}>{analysis.risk}</Badge>
  <Text>{analysis.action}</Text>
  <Text>{analysis.reason}</Text>
</Card>

// Apply suggestion
const result = await forge.invoke('apply-suggestion', {});
showToast(result.message);
```

### Push Notifications

**Trigger**: When race status changes to YELLOW or RED

**Implementation**:
- Forge Webtrigger: Listen for Jira issue updates
- Trigger Function: Check if telemetry changed
- Send Push: Via Firebase Cloud Messaging (FCM) or Apple Push Notification Service (APNS)

**Payload**:
```json
{
  "title": "🏁 Race Status: YELLOW",
  "body": "SLA at risk; 3 blockers detected",
  "data": {
    "raceStatus": "YELLOW",
    "projectKey": "DEMO"
  }
}
```

---

## 🌐 Web Dashboard Blueprint (Next.js, React, Vue)

### Architecture

```
┌─────────────────────────────────────────┐
│  Web Dashboard (Next.js / React)       │
│  ├─ Hero: Live Race Status             │
│  ├─ Grid: Telemetry Cards              │
│  ├─ Panel: Pit Engineer Chat           │
│  └─ Actions: Apply Suggestion CTA      │
└─────────────┬───────────────────────────┘
              │ API Routes
┌─────────────▼───────────────────────────┐
│  Backend API (Next.js API / Express)   │
│  ├─ GET /api/telemetry                 │
│  ├─ POST /api/pit-engineer             │
│  └─ POST /api/apply-suggestion         │
└─────────────┬───────────────────────────┘
              │ Forge SDK
┌─────────────▼───────────────────────────┐
│  PitCrew Control Forge App             │
└─────────────────────────────────────────┘
```

### Tech Stack Options

**Option 1: Next.js + Tailwind**
```bash
npx create-next-app@latest pitcrew-web
cd pitcrew-web
npm install @forge/api tailwindcss
```

**Option 2: React + Vite + Chakra UI**
```bash
npm create vite@latest pitcrew-web -- --template react
cd pitcrew-web
npm install @chakra-ui/react @forge/api
```

**Option 3: Vue + Nuxt + Vuetify**
```bash
npx nuxi@latest init pitcrew-web
cd pitcrew-web
npm install @forge/api vuetify
```

### Key Pages

#### 1. Dashboard (`/`)

**Components**:
- Hero: Race Status with animated flag
- Grid: 4 telemetry cards (velocity, blockers, SLA, deploy)
- Sidebar: Recent automation history
- Footer: Last updated timestamp

**Data Fetching** (Next.js example):
```typescript
// app/page.tsx
import { getTelemetry } from '@/lib/forge';

export default async function Dashboard() {
  const telemetry = await getTelemetry();

  return (
    <div className="grid grid-cols-2 gap-4">
      <RaceStatusCard status={telemetry.raceStatus} />
      <VelocityCard velocity={telemetry.sprint.velocity} />
      <BlockersCard blockers={telemetry.blockers} />
      <SLACard sla={telemetry.slaRisk} />
    </div>
  );
}
```

#### 2. Pit Engineer (`/pit-engineer`)

**Components**:
- Chat interface (optional: conversational Rovo)
- Analysis card with risk badge
- "Apply" button with loading state
- Success/error toast

**Interaction Flow**:
```typescript
// components/PitEngineer.tsx
const [analysis, setAnalysis] = useState(null);
const [loading, setLoading] = useState(false);

async function askPitEngineer() {
  setLoading(true);
  const result = await fetch('/api/pit-engineer', { method: 'POST' });
  const data = await result.json();
  setAnalysis(data.analysis);
  setLoading(false);
}

return (
  <div>
    <Button onClick={askPitEngineer} isLoading={loading}>
      Ask Pit Engineer
    </Button>
    {analysis && (
      <Card>
        <Badge colorScheme={riskColor}>{analysis.risk}</Badge>
        <Text>{analysis.action}</Text>
        <Text fontSize="sm">{analysis.reason}</Text>
      </Card>
    )}
  </div>
);
```

#### 3. Settings (`/settings`)

**Components**:
- Configuration form (sprint baseline, escalation user)
- Data source toggle (seeded vs. real Jira)
- Integration status (Rovo, Bitbucket, JSM)

### API Routes

**Next.js API Routes** (`/app/api/`):

```typescript
// app/api/telemetry/route.ts
import { invoke } from '@/lib/forge';

export async function GET() {
  const result = await invoke('telemetry-updater', {
    projectKey: 'DEMO',
    useSeededData: false
  });
  return Response.json(result.snapshot);
}

// app/api/pit-engineer/route.ts
export async function POST() {
  const result = await invoke('pit-engineer', {});
  return Response.json(result);
}

// app/api/apply-suggestion/route.ts
export async function POST() {
  const result = await invoke('apply-suggestion', {});
  return Response.json(result);
}
```

---

## 🔧 VS Code Extension Blueprint

### Architecture

```
┌─────────────────────────────────────────┐
│  VS Code Extension                      │
│  ├─ Status Bar: Race Status Icon       │
│  ├─ Sidebar: Telemetry Tree View       │
│  ├─ Notifications: Risk Alerts         │
│  └─ Commands: Ask Pit Engineer         │
└─────────────┬───────────────────────────┘
              │ Extension API
┌─────────────▼───────────────────────────┐
│  Forge REST API (via Jira tokens)      │
└─────────────────────────────────────────┘
```

### Extension Manifest

**`package.json`**:
```json
{
  "name": "pitcrew-control-vscode",
  "displayName": "PitCrew Control",
  "description": "F1-inspired execution control for Atlassian teams",
  "version": "1.0.0",
  "engines": { "vscode": "^1.80.0" },
  "activationEvents": ["onStartupFinished"],
  "contributes": {
    "commands": [
      {
        "command": "pitcrew.refreshTelemetry",
        "title": "PitCrew: Refresh Telemetry"
      },
      {
        "command": "pitcrew.askPitEngineer",
        "title": "PitCrew: Ask Pit Engineer"
      }
    ],
    "viewsContainers": {
      "activitybar": [
        {
          "id": "pitcrew",
          "title": "PitCrew Control",
          "icon": "resources/flag.svg"
        }
      ]
    },
    "views": {
      "pitcrew": [
        {
          "id": "pitcrew.telemetry",
          "name": "Telemetry"
        }
      ]
    }
  }
}
```

### Key Features

**1. Status Bar Item**
```typescript
// src/statusBar.ts
import * as vscode from 'vscode';

export function createStatusBarItem() {
  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  item.command = 'pitcrew.refreshTelemetry';
  return item;
}

export function updateStatusBar(item: vscode.StatusBarItem, telemetry: any) {
  const icon = telemetry.raceStatus === 'GREEN' ? '✅' : telemetry.raceStatus === 'YELLOW' ? '⚠️' : '🚨';
  item.text = `${icon} PitCrew: ${telemetry.raceStatus}`;
  item.tooltip = telemetry.raceReason;
  item.show();
}
```

**2. Tree View (Telemetry Sidebar)**
```typescript
// src/telemetryProvider.ts
import * as vscode from 'vscode';

export class TelemetryProvider implements vscode.TreeDataProvider<TelemetryItem> {
  getTreeItem(element: TelemetryItem): vscode.TreeItem {
    return element;
  }

  getChildren(): TelemetryItem[] {
    const telemetry = getTelemetry(); // Fetch from Forge
    return [
      new TelemetryItem('Sprint Velocity', `${telemetry.sprint.velocity.current}/${telemetry.sprint.velocity.baseline}`),
      new TelemetryItem('Blockers', `${telemetry.blockers.count} issues`),
      new TelemetryItem('SLA Risk', telemetry.slaRisk.level),
    ];
  }
}
```

---

## 🚀 Deployment Checklist for AI Builders

### Step 1: Clone Repository

```bash
# Navigate to project directory
cd /home/user/raindrop-mcp/pitcrew-control/

# Create tarball for distribution
tar -czf pitcrew-control.tar.gz .

# Or: Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/pitcrew-control.git
git branch -M main
git push -u origin main
```

### Step 2: Review Documentation

**Read First**:
1. `README.md` - Complete overview + Devpost text
2. `QUICKSTART.md` - Installation steps
3. `INTEGRATION.md` - API integration guides
4. `PROJECT_SUMMARY.md` - Architecture + file structure

### Step 3: Understand Data Models

**Key Files**:
- `src/storage.js` - Data persistence layer
- `src/telemetry.js` - Telemetry snapshot structure
- `src/handlers/pitEngineer.js` - AI analysis schema
- `src/handlers/applySuggestion.js` - Automation result schema

### Step 4: Choose Platform

**Mobile**:
- React Native: Best for cross-platform
- Flutter: Best for performance
- Swift/Kotlin: Best for native features

**Web**:
- Next.js: Best for SEO + full-stack
- React + Vite: Best for SPA
- Vue + Nuxt: Best for Vue ecosystem

**Desktop/Extension**:
- VS Code Extension: Best for developer UX
- Electron: Best for cross-platform desktop

### Step 5: Set Up Authentication

**Option 1: Jira API Token**
```javascript
// Use user's Jira API token
const headers = {
  'Authorization': `Basic ${btoa(`${email}:${apiToken}`)}`,
  'Content-Type': 'application/json'
};
```

**Option 2: Forge Connect App**
```javascript
// Use Forge SDK for authentication
import { invoke } from '@forge/bridge';
const result = await invoke('telemetry-updater', { projectKey });
```

### Step 6: Implement Core Features

**Must-Have**:
- [ ] Fetch and display telemetry
- [ ] Show race status (GREEN/YELLOW/RED)
- [ ] Call Pit Engineer
- [ ] Apply suggestions

**Nice-to-Have**:
- [ ] Push notifications
- [ ] Historical charts
- [ ] Settings/configuration UI
- [ ] Offline mode

### Step 7: Test Integration

```bash
# Test telemetry fetch
curl -X POST https://your-forge-app/rest/forge/1/function/invoke \
  -H "Content-Type: application/json" \
  -d '{"function": "telemetry-updater", "payload": {"projectKey": "DEMO"}}'

# Verify response matches TelemetrySnapshot schema
```

---

## 📚 Additional Resources

### Forge Documentation
- [Forge Overview](https://developer.atlassian.com/platform/forge/)
- [Forge Functions](https://developer.atlassian.com/platform/forge/functions/)
- [Forge REST API](https://developer.atlassian.com/platform/forge/rest-api/)

### Jira REST API
- [Jira Cloud REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [JQL Syntax](https://support.atlassian.com/jira-service-management-cloud/docs/use-advanced-search-with-jira-query-language-jql/)

### Example Apps
- [Forge Samples](https://github.com/atlassian/forge-samples)
- [MCP Servers](https://github.com/modelcontextprotocol/servers)

---

## 💡 Extension Ideas Summary

### 1. Mobile Companion App
**Platform**: React Native, Flutter, SwiftUI
**Features**: Race status push notifications, one-tap actions, telemetry charts
**API**: Forge REST API + Jira API

### 2. Public Web Dashboard
**Platform**: Next.js, React, Vue
**Features**: Live demo, interactive playground, Devpost-ready showcase
**API**: Forge Connect App

### 3. VS Code Extension
**Platform**: VS Code Extension API
**Features**: Status bar indicator, sidebar telemetry, inline recommendations
**API**: Jira REST API with API token auth

### 4. Slack/Teams Bot
**Platform**: Slack Bolt SDK, Microsoft Bot Framework
**Features**: Daily race status summary, alert notifications, slash commands
**API**: Forge Webhooks + REST API

### 5. CLI Tool
**Platform**: Node.js Commander
**Features**: `pitcrew status`, `pitcrew recommend`, `pitcrew apply`
**API**: Forge REST API

---

## 🏁 Ready to Build

**Repository**: `/home/user/raindrop-mcp/pitcrew-control/`
**Commit**: `fd7368c`
**Status**: Production-ready
**Files**: 17 files, 3,083 lines

**Share this repository** with any AI builder platform to create:
- Mobile apps (iOS, Android)
- Web dashboards (public or internal)
- Browser extensions (Chrome, Firefox)
- Desktop apps (Electron, Tauri)
- IDE extensions (VS Code, JetBrains)
- Bots (Slack, Teams, Discord)

---

🏁 **Race faster. Fail less. Win more.** 🏁
