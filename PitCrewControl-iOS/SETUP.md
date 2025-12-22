# 🏁 PitCrew Control iOS - 5-Minute Setup

**Get the iOS app running in 5 minutes!**

---

## ✅ Prerequisites

- Mac with macOS 13.0+ (Ventura or later)
- Xcode 15.0+ ([Download here](https://apps.apple.com/us/app/xcode/id497799835))
- 15 minutes for first-time Xcode installation

---

## 🚀 Setup Steps

### Step 1: Create Xcode Project (2 minutes)

1. **Open Xcode**
   - Launch Xcode from Applications

2. **Create New Project**
   - Click "Create New Project"
   - OR: File → New → Project (Cmd+Shift+N)

3. **Choose Template**
   - Select "iOS" tab
   - Choose "App" template
   - Click "Next"

4. **Configure Project**
   ```
   Product Name: PitCrew Control
   Team: (Select your team or "None")
   Organization Identifier: com.yourname
   Interface: SwiftUI
   Language: Swift
   ☐ Use Core Data
   ☐ Include Tests
   ```
   - Click "Next"

5. **Save Project**
   - Choose location (e.g., Desktop)
   - Click "Create"

### Step 2: Add Source Files (2 minutes)

1. **Delete Default File**
   - In Xcode sidebar, right-click `ContentView.swift`
   - Select "Delete"
   - Choose "Move to Trash"

2. **Create Folder Structure**
   - Right-click project name in sidebar
   - Select "New Group"
   - Create these folders:
     - `Models`
     - `Services`
     - `Views`

3. **Add Files**

   **Method A: Drag & Drop (Easiest)**
   - Open Finder to this directory
   - Drag `PitCrewControlApp.swift` to project root in Xcode
   - Drag `Telemetry.swift` to `Models` folder
   - Drag `NetworkService.swift` to `Services` folder
   - Drag all `.swift` files from `Views/` to `Views` folder
   - When prompted, check "Copy items if needed"

   **Method B: Manual Copy (If drag doesn't work)**
   - Right-click `Models` folder → Add Files
   - Navigate to this directory
   - Select `Telemetry.swift`
   - Repeat for other files

### Step 3: Configure Project Settings (1 minute)

1. **Open Project Settings**
   - Click project name (blue icon) in sidebar
   - Select target under "Targets"

2. **Set Minimum iOS Version**
   - Under "Deployment Info"
   - Set "Minimum Deployments" to **iOS 16.0**

3. **Configure App Transport Security (Optional)**
   - Click "Info" tab
   - Hover over any row, click "+" button
   - Add key: `App Transport Security Settings`
   - Expand it, add child: `Allow Arbitrary Loads`
   - Set value to `YES`
   - ⚠️ Only needed if connecting to non-HTTPS servers

### Step 4: Build and Run (30 seconds)

1. **Select Simulator**
   - Top toolbar: Click simulator dropdown
   - Choose "iPhone 15 Pro" (or any iOS 16+ device)

2. **Build**
   - Press `Cmd+B` to build
   - Wait for "Build Succeeded" message

3. **Run**
   - Press `Cmd+R` to run
   - OR: Click ▶️ button in toolbar
   - Simulator launches in ~30 seconds

4. **Enjoy!**
   - App opens in Demo Mode
   - Yellow flag shows with telemetry
   - Tap "Ask Pit Engineer" to test AI

---

## 🎉 Success!

You should see:

```
┌─────────────────────────────────┐
│  🏁 PitCrew Control             │
├─────────────────────────────────┤
│  ⚠️ YELLOW                      │
│  SLA at risk; 3 blockers        │
├─────────────────────────────────┤
│  Sprint Velocity    Blockers    │
│  28/40 (70%)        3 issues    │
│                                 │
│  SLA Risk           Deployment  │
│  MEDIUM             NOT READY   │
├─────────────────────────────────┤
│  [Ask Pit Engineer]             │
│  [Settings]                     │
└─────────────────────────────────┘
```

---

## 🧪 Test Features

### Test 1: View Telemetry
- ✅ Home screen shows 4 metric cards
- ✅ Race status banner is YELLOW
- ✅ Pull down to refresh (simulates reload)

### Test 2: Ask Pit Engineer
- ✅ Tap "Ask Pit Engineer"
- ✅ New screen appears with loading indicator
- ✅ Analysis shows: Risk YELLOW, recommended action, reasoning
- ✅ "Apply Suggestion" button appears

### Test 3: Apply Automation
- ✅ Tap "Apply Suggestion"
- ✅ Success message appears: "Applied to DEMO-123"
- ✅ Actions listed: "added-escalation-comment", "added-label-pitcrew-escalate"

### Test 4: Settings
- ✅ Tap "Settings"
- ✅ Demo Mode toggle is ON
- ✅ Turn OFF demo mode (grays out API fields)
- ✅ Turn back ON

---

## 🐛 Troubleshooting

### Issue: Build Failed

**Error: "No such module 'SwiftUI'"**
```
Solution:
1. Click project name in sidebar
2. Select target
3. General tab → Deployment Info
4. Set iOS to 16.0 or higher
5. Clean build: Cmd+Shift+K
6. Rebuild: Cmd+B
```

**Error: "Cannot find 'TelemetrySnapshot' in scope"**
```
Solution:
1. Verify Telemetry.swift is in Models folder
2. Check it's part of target (Inspector → Target Membership)
3. Clean and rebuild
```

### Issue: Simulator Won't Launch

**Error: "No devices available"**
```
Solution:
1. Xcode → Settings → Platforms
2. Download iOS 17.0+ simulator
3. Restart Xcode
4. Select simulator again
```

**Error: "Unable to boot simulator"**
```
Solution:
1. Quit Simulator app
2. Xcode → Product → Clean Build Folder
3. Restart Mac
4. Try again
```

### Issue: White/Blank Screen

**App launches but shows nothing**
```
Solution:
1. Check console for errors (View → Debug Area → Show Debug Area)
2. Verify PitCrewControlApp.swift has @main attribute
3. Verify HomeView is returned in WindowGroup
4. Clean and rebuild
```

### Issue: Tap Buttons Don't Work

**Buttons are unresponsive**
```
Solution:
1. Check Demo Mode is ON in Settings
2. Restart simulator
3. Force quit app and relaunch
```

---

## 📱 Run on Physical iPhone

### Step 1: Connect Device
1. Connect iPhone to Mac via USB/Lightning
2. Unlock iPhone
3. Trust computer if prompted

### Step 2: Configure Signing
1. Select project in Xcode
2. Select target
3. Signing & Capabilities tab
4. Team: Select your Apple ID
5. Bundle Identifier: Change to unique ID (e.g., `com.yourname.pitcrewcontrol`)

### Step 3: Run on Device
1. Top toolbar: Select your iPhone
2. Press Cmd+R to run
3. On iPhone: Settings → General → Device Management
4. Trust your developer certificate
5. App launches on device!

---

## 🎨 Customize

### Change App Name
```
1. Click project in sidebar
2. Select target
3. General tab → Display Name
4. Change to "PitCrew" or "Race Control"
```

### Change App Icon
```
1. Click Assets in sidebar
2. Select AppIcon
3. Drag 1024x1024 PNG to "App Store iOS" slot
4. Rebuild
```

### Change Colors
```swift
// Edit Models/Telemetry.swift
var color: Color {
    switch self {
    case .green: return .mint  // Change here
    case .yellow: return .orange
    case .red: return .pink
    }
}
```

---

## 🔗 Next Steps

**Connect to Real API:**
- See README.md → "Connect to Real Forge Backend"
- Requires PitCrew Control Forge app running

**Add Features:**
- See README.md → "Roadmap" for ideas
- Charts, notifications, widgets

**Deploy to TestFlight:**
- See README.md → "Deployment" section

---

## 📚 Resources

**Learning SwiftUI:**
- [Apple SwiftUI Tutorials](https://developer.apple.com/tutorials/swiftui)
- [100 Days of SwiftUI](https://www.hackingwithswift.com/100/swiftui)

**Xcode Help:**
- [Xcode Documentation](https://developer.apple.com/documentation/xcode)
- [iOS Development Guide](https://developer.apple.com/ios/)

**Get Help:**
- [Stack Overflow - SwiftUI](https://stackoverflow.com/questions/tagged/swiftui)
- [Apple Developer Forums](https://developer.apple.com/forums/)

---

## ✅ Quick Reference

| Task | Command |
|------|---------|
| Build | Cmd+B |
| Run | Cmd+R |
| Clean Build | Cmd+Shift+K |
| Stop | Cmd+. |
| Show Console | Cmd+Shift+Y |
| Open Settings | Cmd+, |

---

🏁 **You're ready to race!** 🏁

If you run into issues, check the console output or refer to the troubleshooting section above.
