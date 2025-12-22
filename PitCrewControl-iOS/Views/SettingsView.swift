import SwiftUI

struct SettingsView: View {
    @AppStorage("useDemoMode") private var useDemoMode = true
    @AppStorage("apiBaseURL") private var apiBaseURL = "https://your-forge-app.atlassian.net"
    @AppStorage("apiToken") private var apiToken = ""

    @State private var showResetAlert = false

    var body: some View {
        Form {
            Section {
                Toggle("Demo Mode", isOn: $useDemoMode)
                Text("Use seeded data instead of live API calls")
                    .font(.caption)
                    .foregroundColor(.secondary)
            } header: {
                Text("Mode")
            } footer: {
                Text("Demo mode uses pre-configured telemetry data for reliable testing without API setup.")
            }

            Section {
                TextField("API Base URL", text: $apiBaseURL)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .keyboardType(.URL)

                SecureField("API Token", text: $apiToken)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
            } header: {
                Text("API Configuration")
            } footer: {
                Text("Configure your Forge app endpoint and authentication token. Only required when Demo Mode is off.")
            }
            .disabled(useDemoMode)

            Section {
                HStack {
                    Text("Version")
                    Spacer()
                    Text("1.0.0")
                        .foregroundColor(.secondary)
                }

                HStack {
                    Text("Build")
                    Spacer()
                    Text("1")
                        .foregroundColor(.secondary)
                }

                Link(destination: URL(string: "https://github.com/rkabota/raindrop-mcp")!) {
                    HStack {
                        Text("GitHub Repository")
                        Spacer()
                        Image(systemName: "arrow.up.right.square")
                            .foregroundColor(.blue)
                    }
                }
            } header: {
                Text("About")
            }

            Section {
                Button(role: .destructive, action: {
                    showResetAlert = true
                }) {
                    HStack {
                        Spacer()
                        Text("Reset to Defaults")
                        Spacer()
                    }
                }
            }
        }
        .navigationTitle("Settings")
        .navigationBarTitleDisplayMode(.inline)
        .alert("Reset Settings", isPresented: $showResetAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Reset", role: .destructive) {
                resetToDefaults()
            }
        } message: {
            Text("This will reset all settings to their default values.")
        }
    }

    private func resetToDefaults() {
        useDemoMode = true
        apiBaseURL = "https://your-forge-app.atlassian.net"
        apiToken = ""
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            SettingsView()
        }
    }
}
