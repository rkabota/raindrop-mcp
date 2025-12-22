import Foundation

class NetworkService: ObservableObject {
    static let shared = NetworkService()

    private let baseURL: String
    private var session: URLSession

    init() {
        // Read from UserDefaults or use default
        self.baseURL = UserDefaults.standard.string(forKey: "apiBaseURL")
            ?? "https://your-forge-app.atlassian.net"

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        self.session = URLSession(configuration: config)
    }

    // MARK: - Telemetry

    func fetchTelemetry(useSeededData: Bool = false) async throws -> TelemetrySnapshot {
        if useSeededData {
            return getSeededTelemetry()
        }

        let endpoint = "\(baseURL)/api/forge/invoke/telemetry-updater"
        let payload: [String: Any] = [
            "projectKey": "DEMO",
            "useSeededData": false
        ]

        let response: TelemetryResponse = try await post(endpoint: endpoint, payload: payload)
        guard response.success, let snapshot = response.snapshot else {
            throw NetworkError.apiError(response.error ?? "Failed to fetch telemetry")
        }
        return snapshot
    }

    // MARK: - Pit Engineer

    func askPitEngineer() async throws -> PitEngineerAnalysis {
        let endpoint = "\(baseURL)/api/forge/invoke/pit-engineer"
        let payload: [String: Any] = [:]

        let response: PitEngineerResponse = try await post(endpoint: endpoint, payload: payload)
        guard response.success, let analysis = response.analysis else {
            throw NetworkError.apiError(response.error ?? "Failed to get recommendation")
        }
        return analysis
    }

    // MARK: - Apply Suggestion

    func applySuggestion() async throws -> ApplySuggestionResponse {
        let endpoint = "\(baseURL)/api/forge/invoke/apply-suggestion"
        let payload: [String: Any] = [:]

        let response: ApplySuggestionResponse = try await post(endpoint: endpoint, payload: payload)
        return response
    }

    // MARK: - Generic POST

    private func post<T: Codable>(endpoint: String, payload: [String: Any]) async throws -> T {
        guard let url = URL(string: endpoint) else {
            throw NetworkError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Add authentication if needed
        if let apiToken = UserDefaults.standard.string(forKey: "apiToken") {
            request.setValue("Bearer \(apiToken)", forHTTPHeaderField: "Authorization")
        }

        request.httpBody = try JSONSerialization.data(withJSONObject: payload)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw NetworkError.httpError(httpResponse.statusCode)
        }

        let decoder = JSONDecoder()
        return try decoder.decode(T.self, from: data)
    }

    // MARK: - Seeded Data

    private func getSeededTelemetry() -> TelemetrySnapshot {
        return TelemetrySnapshot(
            raceStatus: .yellow,
            raceReason: "SLA at risk; 3 blockers",
            sprint: SprintData(
                velocity: SprintData.VelocityData(current: 28, baseline: 40)
            ),
            blockers: BlockerData(
                count: 3,
                top: [
                    BlockerData.BlockerIssue(
                        key: "DEMO-123",
                        summary: "API gateway configuration blocking deployment"
                    ),
                    BlockerData.BlockerIssue(
                        key: "DEMO-124",
                        summary: "Database migration script failing in staging"
                    ),
                    BlockerData.BlockerIssue(
                        key: "DEMO-125",
                        summary: "Third-party service integration timeout"
                    )
                ]
            ),
            slaRisk: SLARiskData(
                level: .medium,
                breachEtaMinutes: 90,
                incidentKey: "DEMO-123"
            ),
            deploy: DeployData(
                ready: false,
                failingPipelines: ["build-pipeline", "integration-tests"]
            ),
            updatedAt: ISO8601DateFormatter().string(from: Date())
        )
    }

    func getSeededPitEngineerAnalysis() -> PitEngineerAnalysis {
        return PitEngineerAnalysis(
            risk: .yellow,
            action: "Assign DEMO-123 to senior engineer and add tracking label 'sla-watch'",
            reason: "SLA at risk with 90 minutes remaining. Proactive assignment ensures timely resolution before escalation needed.",
            targetIssue: "DEMO-123"
        )
    }
}

// MARK: - Network Errors

enum NetworkError: LocalizedError {
    case invalidURL
    case invalidResponse
    case httpError(Int)
    case apiError(String)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid API endpoint"
        case .invalidResponse:
            return "Invalid server response"
        case .httpError(let code):
            return "HTTP error: \(code)"
        case .apiError(let message):
            return message
        }
    }
}
