import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Race Status Banner
                    if let telemetry = viewModel.telemetry {
                        RaceStatusBanner(
                            status: telemetry.raceStatus,
                            reason: telemetry.raceReason
                        )
                    }

                    // Telemetry Cards
                    if let telemetry = viewModel.telemetry {
                        TelemetryCardsGrid(telemetry: telemetry)
                    }

                    // Ask Pit Engineer Button
                    NavigationLink(destination: PitEngineerView()) {
                        HStack {
                            Image(systemName: "person.fill.questionmark")
                            Text("Ask Pit Engineer")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }
                    .padding(.horizontal)

                    // Settings Link
                    NavigationLink(destination: SettingsView()) {
                        HStack {
                            Image(systemName: "gear")
                            Text("Settings")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.gray.opacity(0.2))
                        .foregroundColor(.primary)
                        .cornerRadius(12)
                    }
                    .padding(.horizontal)

                    // Last Updated
                    if let telemetry = viewModel.telemetry {
                        Text("Last updated: \(formatDate(telemetry.updatedAt))")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("🏁 PitCrew Control")
            .refreshable {
                await viewModel.refresh()
            }
            .task {
                await viewModel.loadTelemetry()
            }
            .alert("Error", isPresented: $viewModel.showError) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(viewModel.errorMessage ?? "Unknown error")
            }
            .overlay {
                if viewModel.isLoading && viewModel.telemetry == nil {
                    ProgressView("Loading...")
                        .padding()
                        .background(Color(.systemBackground))
                        .cornerRadius(12)
                        .shadow(radius: 10)
                }
            }
        }
    }

    private func formatDate(_ isoString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: isoString) else {
            return isoString
        }
        let displayFormatter = DateFormatter()
        displayFormatter.dateStyle = .short
        displayFormatter.timeStyle = .short
        return displayFormatter.string(from: date)
    }
}

// MARK: - Race Status Banner

struct RaceStatusBanner: View {
    let status: TelemetrySnapshot.RaceStatus
    let reason: String

    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Image(systemName: status.icon)
                    .font(.title)
                Text(status.rawValue)
                    .font(.title2)
                    .fontWeight(.bold)
            }
            .foregroundColor(.white)

            Text(reason)
                .font(.subheadline)
                .foregroundColor(.white.opacity(0.9))
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(status.color.gradient)
        .cornerRadius(16)
        .padding(.horizontal)
        .shadow(color: status.color.opacity(0.3), radius: 8, x: 0, y: 4)
    }
}

// MARK: - Telemetry Cards Grid

struct TelemetryCardsGrid: View {
    let telemetry: TelemetrySnapshot

    var body: some View {
        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible())
        ], spacing: 16) {
            VelocityCard(velocity: telemetry.sprint.velocity)
            BlockersCard(blockers: telemetry.blockers)
            SLACard(slaRisk: telemetry.slaRisk)
            DeployCard(deploy: telemetry.deploy)
        }
        .padding(.horizontal)
    }
}

// MARK: - Metric Cards

struct VelocityCard: View {
    let velocity: SprintData.VelocityData

    var body: some View {
        MetricCard(
            title: "Sprint Velocity",
            icon: "chart.bar.fill",
            value: "\(velocity.current)/\(velocity.baseline)",
            subtitle: "\(Int(velocity.percentage * 100))%",
            color: velocity.percentage >= 0.8 ? .green : velocity.percentage >= 0.6 ? .yellow : .red
        )
    }
}

struct BlockersCard: View {
    let blockers: BlockerData

    var body: some View {
        NavigationLink(destination: BlockersDetailView(blockers: blockers)) {
            MetricCard(
                title: "Blockers",
                icon: "exclamationmark.triangle.fill",
                value: "\(blockers.count)",
                subtitle: blockers.count > 0 ? "issues" : "none",
                color: blockers.count == 0 ? .green : blockers.count < 3 ? .yellow : .red
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct SLACard: View {
    let slaRisk: SLARiskData

    var body: some View {
        MetricCard(
            title: "SLA Risk",
            icon: "clock.fill",
            value: slaRisk.level.rawValue,
            subtitle: slaRisk.breachEtaMinutes.map { "\($0) min" } ?? "—",
            color: slaRisk.level.color
        )
    }
}

struct DeployCard: View {
    let deploy: DeployData

    var body: some View {
        MetricCard(
            title: "Deployment",
            icon: "arrow.up.circle.fill",
            value: deploy.ready ? "READY" : "NOT READY",
            subtitle: deploy.failingPipelines.isEmpty ? "All clear" : "\(deploy.failingPipelines.count) failing",
            color: deploy.ready ? .green : .red
        )
    }
}

struct MetricCard: View {
    let title: String
    let icon: String
    let value: String
    let subtitle: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                    .font(.title3)
                Spacer()
            }

            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)

            Text(value)
                .font(.title3)
                .fontWeight(.bold)
                .lineLimit(1)
                .minimumScaleFactor(0.5)

            Text(subtitle)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

// MARK: - Blockers Detail View

struct BlockersDetailView: View {
    let blockers: BlockerData

    var body: some View {
        List {
            Section {
                HStack {
                    Text("Total Blockers")
                        .fontWeight(.semibold)
                    Spacer()
                    Text("\(blockers.count)")
                        .foregroundColor(.secondary)
                }
            }

            if !blockers.top.isEmpty {
                Section("Top Blockers") {
                    ForEach(blockers.top) { blocker in
                        VStack(alignment: .leading, spacing: 4) {
                            Text(blocker.key)
                                .font(.caption)
                                .foregroundColor(.blue)
                            Text(blocker.summary)
                                .font(.body)
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
        }
        .navigationTitle("Blockers")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - View Model

@MainActor
class HomeViewModel: ObservableObject {
    @Published var telemetry: TelemetrySnapshot?
    @Published var isLoading = false
    @Published var showError = false
    @Published var errorMessage: String?

    private let networkService = NetworkService.shared

    func loadTelemetry() async {
        isLoading = true
        defer { isLoading = false }

        let useDemoMode = UserDefaults.standard.bool(forKey: "useDemoMode")

        do {
            telemetry = try await networkService.fetchTelemetry(useSeededData: useDemoMode)
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }

    func refresh() async {
        await loadTelemetry()
    }
}

struct HomeView_Previews: PreviewProvider {
    static var previews: some View {
        HomeView()
    }
}
