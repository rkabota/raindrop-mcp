import SwiftUI

struct PitEngineerView: View {
    @StateObject private var viewModel = PitEngineerViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 8) {
                    Image(systemName: "person.fill.checkmark")
                        .font(.system(size: 60))
                        .foregroundColor(.blue)

                    Text("Pit Engineer")
                        .font(.title)
                        .fontWeight(.bold)

                    Text("AI-powered execution guidance")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding(.top)

                // Ask Button
                if viewModel.analysis == nil {
                    Button(action: {
                        Task {
                            await viewModel.askPitEngineer()
                        }
                    }) {
                        HStack {
                            if viewModel.isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            } else {
                                Image(systemName: "sparkles")
                                Text("Analyze Situation")
                                    .fontWeight(.semibold)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }
                    .disabled(viewModel.isLoading)
                    .padding(.horizontal)
                }

                // Analysis Result
                if let analysis = viewModel.analysis {
                    AnalysisCard(analysis: analysis)

                    // Apply Button
                    if analysis.targetIssue != nil {
                        Button(action: {
                            Task {
                                await viewModel.applySuggestion()
                            }
                        }) {
                            HStack {
                                if viewModel.isApplying {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                } else {
                                    Image(systemName: "checkmark.circle.fill")
                                    Text("Apply Suggestion")
                                        .fontWeight(.semibold)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(viewModel.appliedSuccessfully ? Color.gray : Color.green)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }
                        .disabled(viewModel.isApplying || viewModel.appliedSuccessfully)
                        .padding(.horizontal)
                    }

                    // Success Message
                    if viewModel.appliedSuccessfully, let result = viewModel.applyResult {
                        SuccessCard(result: result)
                    }

                    // Reset Button
                    if viewModel.appliedSuccessfully {
                        Button(action: {
                            viewModel.reset()
                        }) {
                            HStack {
                                Image(systemName: "arrow.counterclockwise")
                                Text("Ask Again")
                                    .fontWeight(.semibold)
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue.opacity(0.2))
                            .foregroundColor(.blue)
                            .cornerRadius(12)
                        }
                        .padding(.horizontal)
                    }
                }
            }
            .padding(.vertical)
        }
        .navigationTitle("Pit Engineer")
        .navigationBarTitleDisplayMode(.inline)
        .alert("Error", isPresented: $viewModel.showError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(viewModel.errorMessage ?? "Unknown error")
        }
    }
}

struct AnalysisCard: View {
    let analysis: PitEngineerAnalysis

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Risk Badge
            HStack {
                Image(systemName: analysis.risk.icon)
                Text("Risk: \(analysis.risk.rawValue)")
                    .fontWeight(.semibold)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(analysis.risk.color.opacity(0.2))
            .foregroundColor(analysis.risk.color)
            .cornerRadius(8)

            // Action
            VStack(alignment: .leading, spacing: 4) {
                Text("Recommended Action")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .textCase(.uppercase)
                Text(analysis.action)
                    .font(.body)
                    .fontWeight(.medium)
            }

            Divider()

            // Reason
            VStack(alignment: .leading, spacing: 4) {
                Text("Reasoning")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .textCase(.uppercase)
                Text(analysis.reason)
                    .font(.body)
            }

            // Target Issue
            if let issue = analysis.targetIssue {
                Divider()
                HStack {
                    Image(systemName: "link")
                        .font(.caption)
                    Text("Target: \(issue)")
                        .font(.subheadline)
                        .foregroundColor(.blue)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
        .padding(.horizontal)
    }
}

struct SuccessCard: View {
    let result: ApplySuggestionResponse

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
                    .font(.title2)
                Text("Suggestion Applied")
                    .fontWeight(.semibold)
                    .font(.headline)
            }

            Text(result.message)
                .font(.subheadline)

            if let appliedTo = result.appliedTo {
                HStack {
                    Text("Applied to:")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(appliedTo)
                        .font(.caption)
                        .foregroundColor(.blue)
                }
            }

            if let actions = result.actions, !actions.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Actions:")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    ForEach(actions, id: \.self) { action in
                        HStack {
                            Image(systemName: "checkmark")
                                .font(.caption)
                                .foregroundColor(.green)
                            Text(action)
                                .font(.caption)
                        }
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.green.opacity(0.1))
        .cornerRadius(12)
        .padding(.horizontal)
    }
}

@MainActor
class PitEngineerViewModel: ObservableObject {
    @Published var analysis: PitEngineerAnalysis?
    @Published var applyResult: ApplySuggestionResponse?
    @Published var isLoading = false
    @Published var isApplying = false
    @Published var appliedSuccessfully = false
    @Published var showError = false
    @Published var errorMessage: String?

    private let networkService = NetworkService.shared

    func askPitEngineer() async {
        isLoading = true
        defer { isLoading = false }

        let useDemoMode = UserDefaults.standard.bool(forKey: "useDemoMode")

        do {
            if useDemoMode {
                // Use seeded analysis in demo mode
                try await Task.sleep(nanoseconds: 1_000_000_000) // Simulate network delay
                analysis = networkService.getSeededPitEngineerAnalysis()
            } else {
                analysis = try await networkService.askPitEngineer()
            }
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }

    func applySuggestion() async {
        isApplying = true
        defer { isApplying = false }

        let useDemoMode = UserDefaults.standard.bool(forKey: "useDemoMode")

        do {
            if useDemoMode {
                // Simulate success in demo mode
                try await Task.sleep(nanoseconds: 1_000_000_000) // Simulate network delay
                applyResult = ApplySuggestionResponse(
                    success: true,
                    appliedTo: "DEMO-123",
                    actions: ["added-escalation-comment", "added-label-pitcrew-escalate"],
                    message: "Applied SLA escalation to DEMO-123: added comment and label 'pitcrew-escalate'",
                    error: nil
                )
                appliedSuccessfully = true
            } else {
                applyResult = try await networkService.applySuggestion()
                if applyResult?.success == true {
                    appliedSuccessfully = true
                } else {
                    errorMessage = applyResult?.error ?? "Failed to apply suggestion"
                    showError = true
                }
            }
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }

    func reset() {
        analysis = nil
        applyResult = nil
        appliedSuccessfully = false
    }
}

struct PitEngineerView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            PitEngineerView()
        }
    }
}
