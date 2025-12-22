# 🚀 PitCrew Control - Deployment Guide

**Complete deployment instructions for Forge app and iOS app**

---

## 📋 Overview

You have two apps to deploy:

1. **PitCrew Control Forge App** (Backend) - Deploy to Atlassian
2. **PitCrew Control iOS App** (Frontend) - Deploy to App Store/TestFlight

---

## 🏗️ Part 1: Deploy Forge App (Backend)

### Prerequisites

- Node.js 18+ installed
- Atlassian account with Jira access
- Admin permissions on Jira site

### Step 1: Install Forge CLI

```bash
npm install -g @forge/cli
```

**Verify installation:**
```bash
forge --version
# Should show: @forge/cli/6.x.x or higher
```

### Step 2: Login to Atlassian

```bash
forge login
```

- Opens browser for authentication
- Login with Atlassian account
- Grant permissions when prompted

**Verify login:**
```bash
forge whoami
# Should show your Atlassian email
```

### Step 3: Navigate to Project

```bash
cd /home/user/raindrop-mcp/pitcrew-control
```

### Step 4: Install Dependencies

```bash
npm install
```

**Expected output:**
```
added 45 packages in 3s
```

### Step 5: Register App (First Time Only)

```bash
forge register
```

**Prompts:**
```
? Enter a name for your app: pitcrew-control
```

**Output:**
```
✔ App created successfully!
App ID: ari:cloud:ecosystem::app/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

**IMPORTANT:** Copy the App ID!

### Step 6: Update Manifest with App ID

Edit `manifest.yml`:

```yaml
app:
  id: ari:cloud:ecosystem::app/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX  # Replace with your App ID
```

### Step 7: Deploy to Atlassian

```bash
forge deploy
```

**Expected output:**
```
Deploying your app...
✔ App deployed successfully!
Build: 1
```

**Deployment time:** ~2-3 minutes

### Step 8: Install to Jira Site

```bash
forge install
```

**Prompts:**
```
? Select a product: Jira
? Enter the site URL: your-site.atlassian.net
? Select a project: (Choose your project)
```

**Expected output:**
```
✔ App installed successfully!
Your app is available at:
https://your-site.atlassian.net/jira/projects/PROJECT/apps
```

### Step 9: Access Dashboard

1. Navigate to your Jira project
2. Click **"Project pages"** in left sidebar
3. Select **"PitCrew Control™"**

**You should see:**
- Race status banner
- Telemetry panels
- Ask Pit Engineer button

---

## ✅ Verify Forge Deployment

### Test Checklist

- [ ] Dashboard loads without errors
- [ ] Race status shows (GREEN/YELLOW/RED)
- [ ] Telemetry panels display data
- [ ] "Ask Pit Engineer" returns recommendation
- [ ] "Apply Suggestion" creates Jira comment/label
- [ ] "Refresh Telemetry" updates timestamp

### Common Issues

**Issue: "App not found"**
```bash
# Solution: Re-register
forge register
# Update manifest.yml with new App ID
forge deploy
```

**Issue: "Permission denied"**
```bash
# Solution: Check manifest.yml scopes
permissions:
  scopes:
    - storage:app
    - read:jira-work
    - write:jira-work
    - read:jira-user
```

**Issue: "Build failed"**
```bash
# Solution: Clean and rebuild
rm -rf node_modules
npm install
forge deploy
```

### Enable Real Jira Data

By default, the app uses seeded demo data. To use real Jira:

Edit `src/handlers/telemetryUpdater.js`:

```javascript
// Line 9: Change from
const useSeededData = event.useSeededData !== false; // Default: true

// To:
const useSeededData = false; // Use real Jira data
```

Then redeploy:
```bash
forge deploy
```

---

## 📱 Part 2: Deploy iOS App (Optional)

### Prerequisites

- macOS 13.0+ (Ventura or later)
- Xcode 15.0+
- Apple Developer Account ($99/year)
- Physical iPhone or Simulator

### Option A: Local Testing (Free)

**No Apple Developer Account needed!**

1. **Open Xcode**
2. **Create Project** (see `PitCrewControl-iOS/SETUP.md`)
3. **Copy Swift files**
4. **Run on Simulator** (Cmd+R)

**Perfect for:**
- Testing the app
- Demo purposes
- Development

### Option B: TestFlight (Requires Developer Account)

**For beta testing with real users**

#### Step 1: Prepare Project

```bash
cd /home/user/raindrop-mcp/PitCrewControl-iOS
```

Open in Xcode, then:

1. **Select project** in sidebar
2. **Signing & Capabilities** tab
3. **Team:** Select your Apple Developer account
4. **Bundle Identifier:** `com.yourcompany.pitcrewcontrol`

#### Step 2: Archive Build

1. **Product → Archive**
2. Wait for build (~2 minutes)
3. **Organizer** window opens

#### Step 3: Upload to App Store Connect

1. **Select archive**
2. **Distribute App**
3. **App Store Connect**
4. **Upload**

**Processing time:** 5-10 minutes

#### Step 4: Create TestFlight Build

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. **My Apps → PitCrew Control**
3. **TestFlight** tab
4. **Select build** (after processing completes)
5. **Add Internal Testers**
   - Enter email addresses
   - Send invites

**Testers receive:**
- Email with TestFlight link
- Install TestFlight app
- Install PitCrew Control

### Option C: App Store Release (Public)

**For production release**

#### Prerequisites

- Completed TestFlight testing
- App screenshots (required)
- App description
- Privacy policy URL
- Marketing materials

#### Step 1: Prepare Assets

**App Icon:**
- 1024x1024 PNG
- No transparency
- No rounded corners

**Screenshots:** (Required sizes)
- iPhone 6.7" (1290 x 2796)
- iPhone 5.5" (1242 x 2208)

**Demo video:** (Optional)
- 30 seconds max
- .mov or .mp4

#### Step 2: Create App Listing

1. **App Store Connect → My Apps**
2. **Click "+"** → New App
3. **Fill in:**
   ```
   Name: PitCrew Control
   Primary Language: English
   Bundle ID: com.yourcompany.pitcrewcontrol
   SKU: pitcrew-control-001
   ```

#### Step 3: Configure Metadata

**App Information:**
```
Name: PitCrew Control
Subtitle: F1-Inspired Team Execution
Category: Productivity
```

**Description:**
```
Transform your Atlassian team into a high-performance racing crew.

PitCrew Control monitors your sprint health, detects risks, and delivers
AI-powered execution guidance—just like a Formula 1 pit engineer.

FEATURES:
• Real-time telemetry dashboard
• AI Pit Engineer recommendations
• One-tap automation
• Race status flags (GREEN/YELLOW/RED)
• Sprint velocity tracking
• Blocker detection
• SLA risk prediction

Perfect for teams using Jira, JSM, and Confluence.

Built for Codegeist 2025 (Williams Racing Edition).
```

**Keywords:**
```
jira, atlassian, productivity, automation, ai, sprint, agile, scrum
```

**Support URL:**
```
https://github.com/rkabota/raindrop-mcp
```

**Privacy Policy URL:**
```
https://your-site.com/privacy
```

#### Step 4: Upload Screenshots

- Drag and drop screenshots
- Add captions (optional)
- Preview in App Store Connect

#### Step 5: Submit for Review

1. **App Store** tab
2. **Add for Review**
3. **Submit**

**Review time:** 1-3 days

**Approval:**
- App goes live automatically
- Or: Manual release after approval

---

## 🔄 Update/Redeploy

### Update Forge App

```bash
cd /home/user/raindrop-mcp/pitcrew-control

# Make code changes
# Edit src/ files

# Deploy update
forge deploy

# App updates automatically for all users
# No reinstall needed
```

### Update iOS App

```bash
cd /home/user/raindrop-mcp/PitCrewControl-iOS

# Make code changes
# Edit .swift files

# Increment version
# In Xcode: Target → General → Version (e.g., 1.0.0 → 1.0.1)

# Archive and upload
# Product → Archive → Distribute
```

---

## 🌐 Production Checklist

### Forge App Production Readiness

- [ ] App ID in manifest.yml
- [ ] All handlers tested (telemetry, pit engineer, apply suggestion)
- [ ] Real Jira data enabled (or demo mode documented)
- [ ] Error handling for all API calls
- [ ] Permissions configured correctly
- [ ] Storage keys documented

### iOS App Production Readiness

- [ ] Demo mode toggle works
- [ ] API configuration in settings
- [ ] All screens tested (Home, Pit Engineer, Settings)
- [ ] Pull-to-refresh works
- [ ] Error messages user-friendly
- [ ] App icon added (1024x1024)
- [ ] Launch screen configured

---

## 📊 Monitoring

### Forge App Monitoring

**View Logs:**
```bash
forge logs
```

**View Invocations:**
```bash
forge webtrigger
```

**Check Storage:**
```javascript
// In Jira, check storage via browser console
// (Advanced: requires Forge Storage API access)
```

### iOS App Monitoring

**TestFlight Analytics:**
- App Store Connect → TestFlight → Crashes
- View crash reports
- View adoption metrics

**App Store Analytics:**
- App Store Connect → Analytics
- Downloads, sessions, crashes
- User retention

---

## 🆘 Troubleshooting

### Forge Deployment Issues

**"Command not found: forge"**
```bash
npm install -g @forge/cli
```

**"Not logged in"**
```bash
forge login
```

**"App ID mismatch"**
```bash
# Get current App ID
forge install --list

# Update manifest.yml with correct ID
forge deploy
```

**"Build failed"**
```bash
# View detailed logs
forge deploy --verbose

# Common fix: reinstall dependencies
rm -rf node_modules
npm install
forge deploy
```

### iOS Deployment Issues

**"Code signing error"**
```
1. Xcode → Preferences → Accounts
2. Add Apple ID
3. Download certificates
4. Select team in project settings
```

**"Archive failed"**
```
1. Product → Clean Build Folder
2. Restart Xcode
3. Try again
```

**"Upload failed"**
```
1. Check bundle ID is unique
2. Increment version number
3. Ensure all required fields filled
```

---

## 🎯 Next Steps After Deployment

### For Forge App

1. **Test with real users**
   - Invite team members to Jira project
   - Gather feedback on telemetry accuracy

2. **Integrate Rovo** (when available)
   - See `INTEGRATION.md`
   - Swap deterministic stub for Rovo AI

3. **Add more automation playbooks**
   - Blocker swarming
   - Sprint health checks
   - Deployment recovery

4. **Monitor usage**
   - Check logs for errors
   - Track which features are used most

### For iOS App

1. **Gather TestFlight feedback**
   - Internal testing (1-2 weeks)
   - Fix critical bugs
   - External testing (2-4 weeks)

2. **Prepare marketing**
   - App Store screenshots
   - Promotional video
   - Press kit

3. **Plan updates**
   - Charts (v1.1)
   - Notifications (v1.2)
   - Widgets (v1.3)

4. **Build community**
   - GitHub repository
   - User documentation
   - Support channels

---

## 📞 Support

**Forge App Issues:**
- [Atlassian Forge Documentation](https://developer.atlassian.com/platform/forge/)
- [Forge Community](https://community.developer.atlassian.com/c/forge)

**iOS App Issues:**
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)

**Project Issues:**
- GitHub: https://github.com/rkabota/raindrop-mcp
- Email: [Your support email]

---

## ✅ Deployment Complete!

Once both apps are deployed:

✅ **Forge App:** Live on Atlassian (https://your-site.atlassian.net)
✅ **iOS App:** Available on TestFlight or App Store

**Users can:**
1. Access dashboard in Jira Project Pages
2. Download iOS app from TestFlight/App Store
3. Connect iOS app to Forge backend
4. Monitor telemetry and apply AI recommendations

---

🏁 **Ready to race!** 🏁
