import SwiftUI

@main
struct PitCrewControlApp: App {
    init() {
        // Set demo mode by default on first launch
        if UserDefaults.standard.object(forKey: "useDemoMode") == nil {
            UserDefaults.standard.set(true, forKey: "useDemoMode")
        }
    }

    var body: some Scene {
        WindowGroup {
            HomeView()
        }
    }
}
