import { getTelemetry } from '../storage';
import { identifyTopRisk } from '../utils/riskScoring';

/**
 * Pit Engineer AI - analyzes telemetry and recommends actions
 *
 * INTEGRATION POINT: Replace deterministic logic with Rovo API call
 *
 * Expected Rovo integration:
 * const rovoResponse = await api.asApp().requestRovo('/ai/analyze', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     systemPrompt: SYSTEM_INSTRUCTION,
 *     telemetry: snapshot
 *   })
 * });
 */
export async function handler(event, context) {
  try {
    const snapshot = await getTelemetry();

    if (!snapshot) {
      return {
        success: false,
        error: 'No telemetry data available',
      };
    }

    // Deterministic stub - returns action based on top risk
    const analysis = generateDeterministicAnalysis(snapshot);

    return {
      success: true,
      analysis,
      telemetry: snapshot, // Include for context
    };
  } catch (error) {
    console.error('Pit Engineer error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Deterministic analysis stub
 * This can be swapped for Rovo AI in production
 */
function generateDeterministicAnalysis(snapshot) {
  const topRisk = identifyTopRisk(snapshot);

  const analyses = {
    sla: {
      HIGH: {
        risk: 'RED',
        action: `Escalate ${topRisk.issue} immediately to on-call team. Add priority comment with SLA breach timeline.`,
        reason: `Critical SLA breach imminent in ${snapshot.slaRisk.breachEtaMinutes} minutes. Immediate escalation prevents customer impact and maintains service commitments.`,
      },
      MEDIUM: {
        risk: 'YELLOW',
        action: `Assign ${topRisk.issue} to senior engineer and add tracking label 'sla-watch'.`,
        reason: `SLA at risk with ${snapshot.slaRisk.breachEtaMinutes} minutes remaining. Proactive assignment ensures timely resolution before escalation needed.`,
      },
    },
    blocker: {
      HIGH: {
        risk: 'RED',
        action: `Swarm on ${topRisk.issue}. Add escalation comment and assign to tech lead for immediate triage.`,
        reason: `${snapshot.blockers.count} blockers are stalling sprint progress. Swarming the top blocker unblocks downstream work and prevents cascade delays.`,
      },
      MEDIUM: {
        risk: 'YELLOW',
        action: `Review ${topRisk.issue} in next standup. Add label 'pitcrew-blocker' for visibility.`,
        reason: `${snapshot.blockers.count} blockers detected. Team visibility and collaborative problem-solving prevents escalation to critical status.`,
      },
    },
    velocity: {
      HIGH: {
        risk: 'RED',
        action: 'Call emergency sprint health check. Review scope and identify work to defer or split.',
        reason: `Velocity critically low at ${Math.round((snapshot.sprint.velocity.current / snapshot.sprint.velocity.baseline) * 100)}% of baseline. Sprint goals at severe risk without scope adjustment.`,
      },
      MEDIUM: {
        risk: 'YELLOW',
        action: 'Review work-in-progress limits and identify bottlenecks in next standup.',
        reason: `Velocity ${Math.round((snapshot.sprint.velocity.current / snapshot.sprint.velocity.baseline) * 100)}% of target. Early intervention prevents sprint goal miss and maintains team morale.`,
      },
    },
    deploy: {
      HIGH: {
        risk: 'RED',
        action: 'Halt feature work. All hands on pipeline restoration - assign pipeline owners.',
        reason: `${snapshot.deploy.failingPipelines.length} pipelines failing blocks deployment capability. Restore deployment pipeline before sprint-end crunch.`,
      },
      MEDIUM: {
        risk: 'YELLOW',
        action: 'Assign pipeline failures to DevOps team with P1 priority.',
        reason: `Pipeline issues detected. Fixing now prevents deployment blockers during release window.`,
      },
    },
    none: {
      LOW: {
        risk: 'GREEN',
        action: 'Continue current pace. Consider pulling in stretch goals from backlog.',
        reason: 'All systems running smoothly. Team has capacity for additional value delivery.',
      },
    },
  };

  const category = analyses[topRisk.type];
  const recommendation = category ? category[topRisk.severity] : analyses.none.LOW;

  return {
    risk: recommendation.risk,
    action: recommendation.action,
    reason: recommendation.reason,
    detectedRiskType: topRisk.type,
    targetIssue: topRisk.issue,
  };
}

// System instruction for future Rovo integration
const SYSTEM_INSTRUCTION = `You are the Pit Engineer for an Atlassian team. Analyze sprint health, blockers, incidents, SLA risk, and deployment readiness.

Identify the highest risk and recommend ONE clear next action that reduces the most risk. Explain reasoning concisely. Prefer preventative actions over reactive ones.

Output schema:
{
  "risk": "GREEN|YELLOW|RED",
  "action": "specific action with issue keys if applicable",
  "reason": "concise explanation under 100 words"
}

Prioritize: SLA breaches > Blockers > Velocity issues > Deploy readiness.`;
