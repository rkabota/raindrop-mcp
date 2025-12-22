import Foundation
import SwiftUI

// MARK: - Telemetry Models

struct TelemetrySnapshot: Codable {
    let raceStatus: RaceStatus
    let raceReason: String
    let sprint: SprintData
    let blockers: BlockerData
    let slaRisk: SLARiskData
    let deploy: DeployData
    let updatedAt: String

    enum RaceStatus: String, Codable {
        case green = "GREEN"
        case yellow = "YELLOW"
        case red = "RED"

        var color: Color {
            switch self {
            case .green: return .green
            case .yellow: return .yellow
            case .red: return .red
            }
        }

        var icon: String {
            switch self {
            case .green: return "checkmark.circle.fill"
            case .yellow: return "exclamationmark.triangle.fill"
            case .red: return "xmark.octagon.fill"
            }
        }
    }
}

struct SprintData: Codable {
    let velocity: VelocityData

    struct VelocityData: Codable {
        let current: Int
        let baseline: Int

        var percentage: Double {
            guard baseline > 0 else { return 0 }
            return Double(current) / Double(baseline)
        }
    }
}

struct BlockerData: Codable {
    let count: Int
    let top: [BlockerIssue]

    struct BlockerIssue: Codable, Identifiable {
        var id: String { key }
        let key: String
        let summary: String
    }
}

struct SLARiskData: Codable {
    let level: RiskLevel
    let breachEtaMinutes: Int?
    let incidentKey: String?

    enum RiskLevel: String, Codable {
        case low = "LOW"
        case medium = "MEDIUM"
        case high = "HIGH"

        var color: Color {
            switch self {
            case .low: return .green
            case .medium: return .yellow
            case .high: return .red
            }
        }
    }
}

struct DeployData: Codable {
    let ready: Bool
    let failingPipelines: [String]
}

// MARK: - Pit Engineer Models

struct PitEngineerResponse: Codable {
    let success: Bool
    let analysis: PitEngineerAnalysis?
    let error: String?
}

struct PitEngineerAnalysis: Codable {
    let risk: TelemetrySnapshot.RaceStatus
    let action: String
    let reason: String
    let targetIssue: String?
}

// MARK: - API Response Models

struct TelemetryResponse: Codable {
    let success: Bool
    let snapshot: TelemetrySnapshot?
    let error: String?
}

struct ApplySuggestionResponse: Codable {
    let success: Bool
    let appliedTo: String?
    let actions: [String]?
    let message: String
    let error: String?
}
