# 🏁 PitCrew Control - iOS App

**Native iOS companion app for PitCrew Control Forge**

<img src="https://img.shields.io/badge/iOS-16.0+-blue.svg" alt="iOS 16.0+">
<img src="https://img.shields.io/badge/Swift-5.9-orange.svg" alt="Swift 5.9">
<img src="https://img.shields.io/badge/SwiftUI-3.0-green.svg" alt="SwiftUI 3.0">

---

## 📱 Features

- **Real-time Telemetry Dashboard** - Race status, sprint velocity, blockers, SLA risk, deployment status
- **AI Pit Engineer** - Get AI-powered execution recommendations
- **One-Tap Automation** - Apply suggestions directly to Jira issues
- **Demo Mode** - Test with seeded data without API configuration
- **Pull-to-Refresh** - Update telemetry on demand
- **Native iOS Design** - SwiftUI with SF Symbols and iOS design patterns

---

## 🚀 Quick Start

### Option 1: Open in Xcode (Recommended)

1. **Requirements:**
   - macOS 13.0 (Ventura) or later
   - Xcode 15.0 or later
   - iOS 16.0+ device or simulator

2. **Create Xcode Project:**
   ```bash
   # Open Xcode
   # File → New → Project
   # Choose "iOS App" template
   # Name: "PitCrew Control"
   # Interface: SwiftUI
   # Language: Swift
   # Minimum iOS: 16.0
   ```

3. **Copy Source Files:**
   ```bash
   # Copy all files from this directory to your Xcode project
   # Maintain folder structure:
   # - Models/
   # - Services/
   # - Views/
   # - PitCrewControlApp.swift (root)
   ```

4. **Configure Project:**
   - Open Xcode project settings
   - Set Display Name: "PitCrew Control"
   - Set Bundle Identifier: `com.yourcompany.pitcrewcontrol`
   - Ensure minimum iOS deployment target is 16.0

5. **Build and Run:**
   - Select simulator (iPhone 15 Pro recommended)
   - Press `Cmd+R` to build and run
   - App launches in **Demo Mode** with seeded data

### Option 2: Use Provided Files Directly

All Swift files are ready to use! Just:

1. Create new Xcode project
2. Delete default `ContentView.swift`
3. Copy all files from this directory maintaining structure
4. Build and run

---

## 📂 Project Structure

```
PitCrewControl-iOS/
├── PitCrewControlApp.swift          # App entry point
├── Models/
│   └── Telemetry.swift              # Data models (Codable)
├── Services/
│   └── NetworkService.swift         # API client + seeded data
└── Views/
    ├── HomeView.swift               # Main dashboard
    ├── PitEngineerView.swift        # AI recommendations
    └── SettingsView.swift           # Configuration
```

**Total Files:** 6 Swift files
**Lines of Code:** ~900 lines

---

## 🎨 Screenshots

### Home Screen
- Race Status Banner (GREEN/YELLOW/RED)
- 4 Telemetry Cards
- "Ask Pit Engineer" button
- "Settings" button

### Pit Engineer Screen
- AI analysis with risk badge
- Recommended action
- Reasoning explanation
- "Apply Suggestion" button
- Success confirmation

### Settings Screen
- Demo Mode toggle
- API configuration
- About section

---

## 🔧 Configuration

### Demo Mode (Default)

The app starts in **Demo Mode** with pre-configured telemetry:

```swift
// Seeded Data:
- Race Status: YELLOW
- Reason: "SLA at risk; 3 blockers"
- Sprint Velocity: 28/40 points (70%)
- Blockers: 3 issues (DEMO-123, DEMO-124, DEMO-125)
- SLA Risk: MEDIUM (90 min breach ETA)
- Deployment: NOT READY (2 failing pipelines)
```

**No API configuration needed!** Perfect for testing and demos.

### Connect to Real Forge Backend

1. **Open Settings** in the app
2. **Turn off Demo Mode**
3. **Configure API:**
   - Base URL: `https://your-forge-app.atlassian.net`
   - API Token: Your Jira API token (optional for Forge apps)
4. **Return to Home** and pull to refresh

The app will now fetch live data from your PitCrew Control Forge backend.

---

## 🛠️ Development

### SwiftUI Architecture

**MVVM Pattern:**
- **Models:** `Telemetry.swift` - Codable data structures
- **ViewModels:** `@StateObject` in each view (HomeViewModel, PitEngineerViewModel)
- **Views:** SwiftUI views with declarative UI

**State Management:**
- `@StateObject` for view models
- `@Published` for reactive state
- `@AppStorage` for UserDefaults persistence

**Networking:**
- `async/await` for API calls
- URLSession for HTTP requests
- Error handling with Swift Result type

### API Integration

The app expects these Forge function endpoints:

**1. Telemetry Updater:**
```swift
POST /api/forge/invoke/telemetry-updater
Request: { "projectKey": "DEMO", "useSeededData": false }
Response: { "success": true, "snapshot": TelemetrySnapshot }
```

**2. Pit Engineer:**
```swift
POST /api/forge/invoke/pit-engineer
Request: {}
Response: { "success": true, "analysis": PitEngineerAnalysis }
```

**3. Apply Suggestion:**
```swift
POST /api/forge/invoke/apply-suggestion
Request: {}
Response: { "success": true, "appliedTo": "DEMO-123", ... }
```

### Customization

**Change Colors:**
```swift
// In Models/Telemetry.swift, update color mappings:
var color: Color {
    switch self {
    case .green: return .green  // Change to .mint, .blue, etc.
    case .yellow: return .yellow
    case .red: return .red
    }
}
```

**Add Charts:**
```swift
// Install Swift Charts (iOS 16+)
import Charts

Chart {
    ForEach(velocityHistory) { data in
        LineMark(x: .value("Date", data.date), y: .value("Points", data.points))
    }
}
```

**Add Push Notifications:**
```swift
// In PitCrewControlApp.swift
import UserNotifications

func requestNotificationPermissions() {
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
        // Handle permission
    }
}
```

---

## 📦 Dependencies

**Standard iOS Frameworks (No CocoaPods/SPM needed):**
- SwiftUI
- Foundation
- Combine

**Optional Enhancements:**
- Swift Charts (iOS 16+) - For velocity charts
- WidgetKit - For home screen widget
- UserNotifications - For push alerts

---

## 🧪 Testing

### Manual Testing Checklist

**Demo Mode:**
- [ ] App launches with demo data
- [ ] Race status shows YELLOW flag
- [ ] All 4 telemetry cards display data
- [ ] "Ask Pit Engineer" returns analysis
- [ ] "Apply Suggestion" shows success message
- [ ] Settings toggle works

**Pull-to-Refresh:**
- [ ] Swipe down on home screen refreshes data
- [ ] Loading indicator appears
- [ ] Timestamp updates

**Navigation:**
- [ ] Tap "Ask Pit Engineer" navigates to new screen
- [ ] Tap "Settings" navigates to settings
- [ ] Tap blocker card shows detail view
- [ ] Back button returns to previous screen

### Unit Testing (Future)

```swift
// Example test structure:
import XCTest
@testable import PitCrewControl

class NetworkServiceTests: XCTestCase {
    func testSeededTelemetry() {
        let service = NetworkService.shared
        let telemetry = service.getSeededTelemetry()
        XCTAssertEqual(telemetry.raceStatus, .yellow)
        XCTAssertEqual(telemetry.blockers.count, 3)
    }
}
```

---

## 🚢 Deployment

### TestFlight Distribution

1. **Archive Project:**
   - Product → Archive
   - Select archive → Distribute App

2. **Upload to App Store Connect:**
   - Choose "TestFlight & App Store"
   - Follow prompts to upload

3. **Add Testers:**
   - Open App Store Connect
   - TestFlight → Internal Testing
   - Add email addresses

### App Store Submission

**Required Assets:**
- App icon (1024x1024)
- Screenshots (iPhone 6.7" and 5.5")
- Privacy policy URL
- App description

**Metadata:**
```
Name: PitCrew Control
Subtitle: F1-Inspired Team Execution
Category: Productivity
Keywords: jira, atlassian, productivity, automation, ai
```

---

## 🐛 Troubleshooting

### Build Errors

**"No such module 'SwiftUI'"**
- Ensure deployment target is iOS 16.0+
- Clean build folder: Cmd+Shift+K

**"Type 'Color' has no member 'green'"**
- Import SwiftUI at top of file
- Ensure file is part of target

### Runtime Issues

**"Invalid URL"**
- Check API base URL in Settings
- Ensure URL includes `https://`

**"Failed to fetch telemetry"**
- Enable Demo Mode in Settings
- Or verify Forge backend is running

**White screen on launch**
- Check console for errors
- Verify PitCrewControlApp.swift is set as @main

---

## 📖 Additional Documentation

**SwiftUI Resources:**
- [Apple SwiftUI Tutorials](https://developer.apple.com/tutorials/swiftui)
- [Hacking with Swift](https://www.hackingwithswift.com/quick-start/swiftui)

**Forge API:**
- See `pitcrew-control/INTEGRATION.md` for backend setup
- See `pitcrew-control/README.md` for API schemas

**Design Guidelines:**
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

---

## 🎯 Roadmap

### v1.1 - Enhanced Telemetry
- [ ] Historical velocity charts
- [ ] SLA countdown timer with live updates
- [ ] Deployment pipeline detail view

### v1.2 - Notifications
- [ ] Push notifications for race status changes
- [ ] Daily telemetry digest
- [ ] Configurable alert thresholds

### v1.3 - Widgets
- [ ] Home screen widget with race status
- [ ] Lock screen widget (iOS 16+)
- [ ] Live Activities for SLA countdown

### v2.0 - Advanced Features
- [ ] Multiple project support
- [ ] Team member view
- [ ] iPad optimized layout
- [ ] macOS companion app

---

## 🏆 Credits

**Built for:** Codegeist 2025 (Atlassian Williams Racing Edition)

**Technologies:**
- Swift 5.9
- SwiftUI 3.0
- iOS 16.0+
- Atlassian Forge API

**Related Projects:**
- [PitCrew Control Forge App](../pitcrew-control/)
- [Raindrop MCP](https://github.com/rkabota/raindrop-mcp)

---

## 📄 License

MIT License - See LICENSE file for details

---

🏁 **Race faster. Fail less. Win more.** 🏁
