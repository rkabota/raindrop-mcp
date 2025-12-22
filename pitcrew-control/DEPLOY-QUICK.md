# 🚀 Quick Deploy Commands

**Fastest path to deployment**

---

## Forge App (5 minutes)

```bash
# 1. Install Forge CLI
npm install -g @forge/cli

# 2. Login
forge login

# 3. Navigate to project
cd /home/user/raindrop-mcp/pitcrew-control

# 4. Install dependencies
npm install

# 5. Register app (first time only)
forge register
# Copy the App ID it gives you

# 6. Update manifest.yml
# Edit line 16: Replace YOUR_APP_ID with the App ID from step 5

# 7. Deploy
forge deploy

# 8. Install to Jira
forge install
# Select your Jira site and project

# 9. Access app
# Jira → Your Project → Project Pages → PitCrew Control™
```

**Done! ✅ App is live on Atlassian**

---

## iOS App (Simulator - Free)

```bash
# Requirements: macOS + Xcode 15+

# 1. Open Xcode
# 2. File → New → Project → iOS App → SwiftUI
# 3. Name: "PitCrew Control", Save

# 4. Copy files
cd /home/user/raindrop-mcp/PitCrewControl-iOS
# Copy all .swift files to Xcode project (maintain folder structure)

# 5. Run
# Cmd+R in Xcode
```

**Done! ✅ App running in simulator**

---

## iOS App (TestFlight - $99/year)

```bash
# Requirements: Apple Developer Account + Xcode

# 1. Complete "iOS App (Simulator)" steps above

# 2. Configure signing
# Xcode → Project → Signing & Capabilities
# Team: Select your Apple Developer account

# 3. Archive
# Product → Archive (in Xcode)

# 4. Upload
# Organizer → Distribute App → App Store Connect → Upload

# 5. Add testers
# App Store Connect → TestFlight → Add Internal Testers
```

**Done! ✅ Testers can install from TestFlight**

---

## Verify Deployments

### Test Forge App

```bash
# In Jira:
1. Navigate to project
2. Project Pages → PitCrew Control™
3. Should see yellow flag with telemetry
4. Click "Ask Pit Engineer" → Get recommendation
5. Click "Apply Suggestion" → See success message
```

### Test iOS App

```bash
# In simulator or TestFlight:
1. Launch app
2. Should see yellow flag with 4 metric cards
3. Tap "Ask Pit Engineer" → Get AI analysis
4. Tap "Apply Suggestion" → See success confirmation
5. Settings → Toggle demo mode ON/OFF
```

---

## Update After Changes

### Update Forge App

```bash
cd /home/user/raindrop-mcp/pitcrew-control
# Make code changes
forge deploy
# Updates automatically for all users
```

### Update iOS App

```bash
# In Xcode:
# Make code changes
# Increment version: Target → General → Version
# Product → Archive → Distribute
# Users update via TestFlight/App Store
```

---

## Troubleshooting

**Forge: "forge command not found"**
```bash
npm install -g @forge/cli
```

**Forge: "Not logged in"**
```bash
forge login
```

**Forge: "Build failed"**
```bash
rm -rf node_modules
npm install
forge deploy
```

**iOS: "Code signing error"**
```
Xcode → Preferences → Accounts → Add Apple ID
```

**iOS: "Archive failed"**
```
Product → Clean Build Folder
Restart Xcode
```

---

## Full Documentation

- **Forge App:** See `DEPLOYMENT.md` for complete guide
- **iOS App:** See `PitCrewControl-iOS/SETUP.md`

---

🏁 **Deploy in 5 minutes!** 🏁
