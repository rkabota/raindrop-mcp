# 🏁 PitCrew Control - Quick Start Guide

Get PitCrew Control running in under 5 minutes.

## Prerequisites

✅ Atlassian account with Jira access
✅ Node.js 18+ installed (`node --version`)
✅ Forge CLI installed (`npm install -g @forge/cli`)

## Installation

### 1. Setup Forge CLI
```bash
# Install Forge CLI (if not already installed)
npm install -g @forge/cli

# Login to Atlassian
forge login
```

### 2. Clone and Install
```bash
# Navigate to project directory
cd pitcrew-control

# Install dependencies
npm install
```

### 3. Register App
```bash
# Register with Atlassian
forge register

# When prompted:
# - App name: pitcrew-control
# - Note the App ID that's generated
```

### 4. Update Manifest
```bash
# Edit manifest.yml
# Replace "YOUR_APP_ID" with the App ID from step 3
# Line 16: id: ari:cloud:ecosystem::app/YOUR_APP_ID
```

### 5. Deploy and Install
```bash
# Deploy to Atlassian
forge deploy

# Install to your Jira site
forge install
# Select your Jira site when prompted
# Choose a project to install to
```

### 6. Access Dashboard
1. Navigate to your Jira project
2. Click "Project pages" in the left sidebar
3. Select "PitCrew Control™"

## Quick Demo

Once the dashboard loads:

1. **View Race Status** - See the YELLOW flag and telemetry panels
2. **Click "Ask Pit Engineer"** - Get AI recommendation
3. **Click "Apply Suggestion"** - Apply automation to Jira
4. **Verify in Jira** - Check the issue for new comment and label

## Development Mode

For live development with hot reload:

```bash
# Start Forge tunnel (watches for code changes)
forge tunnel

# In another terminal, make changes to src/ files
# Changes will auto-deploy to your Jira instance
```

## Troubleshooting

### "Command not found: forge"
```bash
npm install -g @forge/cli
```

### "App ID not found"
- Make sure you ran `forge register` first
- Update `manifest.yml` with the generated App ID

### "Permission denied"
- Ensure you have admin access to the Jira site
- Check that `manifest.yml` includes required scopes:
  - `storage:app`
  - `read:jira-work`
  - `write:jira-work`

### "No telemetry data"
- Default mode uses seeded data (no setup needed)
- To use real data, edit `src/handlers/telemetryUpdater.js:9` and set `useSeededData = false`

## Next Steps

- **Read full README.md** for architecture details and Rovo integration
- **Explore code** in `src/` to understand the implementation
- **Customize telemetry** in `src/telemetry.js` for your team's metrics
- **Add automation playbooks** in `src/handlers/applySuggestion.js`

---

🏁 **Ready to race!** Visit the dashboard and click "Ask Pit Engineer" to get started.
