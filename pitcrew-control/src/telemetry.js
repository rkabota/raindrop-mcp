import api, { route } from '@forge/api';
import { calculateRaceStatus } from './utils/riskScoring';

/**
 * Build telemetry snapshot from Jira project data
 */
export async function buildTelemetrySnapshot(projectKey, useSeededData = false) {
  if (useSeededData) {
    return buildSeededTelemetry();
  }

  try {
    const [sprintData, blockerData, slaData] = await Promise.all([
      getSprintVelocity(projectKey),
      getBlockers(projectKey),
      getSLARisk(projectKey),
    ]);

    const snapshot = {
      sprint: sprintData,
      blockers: blockerData,
      slaRisk: slaData,
      deploy: {
        ready: true, // Placeholder - would integrate with Bitbucket Pipelines
        failingPipelines: [],
      },
      updatedAt: new Date().toISOString(),
    };

    // Calculate race status
    const raceStatus = calculateRaceStatus(snapshot);
    snapshot.raceStatus = raceStatus.status;
    snapshot.raceReason = raceStatus.reason;

    return snapshot;
  } catch (error) {
    console.error('Error building telemetry:', error);
    // Fallback to seeded data on error
    return buildSeededTelemetry();
  }
}

/**
 * Get sprint velocity from Jira
 */
async function getSprintVelocity(projectKey) {
  try {
    // JQL to get issues completed in current sprint
    const jql = `project = ${projectKey} AND sprint in openSprints() AND status = Done`;
    const response = await api.asApp().requestJira(route`/rest/api/3/search?jql=${jql}&maxResults=100`);
    const data = await response.json();

    const completedPoints = data.issues.reduce((sum, issue) => {
      const storyPoints = issue.fields.customfield_10016 || 0; // Story points field
      return sum + storyPoints;
    }, 0);

    return {
      velocity: {
        current: completedPoints,
        baseline: 40, // Would be calculated from historical data
      },
    };
  } catch (error) {
    console.error('Error getting sprint velocity:', error);
    return {
      velocity: {
        current: 32,
        baseline: 40,
      },
    };
  }
}

/**
 * Get blocker issues from Jira
 */
async function getBlockers(projectKey) {
  try {
    const jql = `project = ${projectKey} AND priority = Highest AND status != Done AND status != Closed`;
    const response = await api.asApp().requestJira(route`/rest/api/3/search?jql=${jql}&fields=summary&maxResults=5`);
    const data = await response.json();

    return {
      count: data.total,
      top: data.issues.slice(0, 3).map(issue => ({
        key: issue.key,
        summary: issue.fields.summary,
      })),
    };
  } catch (error) {
    console.error('Error getting blockers:', error);
    return {
      count: 0,
      top: [],
    };
  }
}

/**
 * Get SLA risk from Jira Service Management (or estimate from Jira)
 */
async function getSLARisk(projectKey) {
  try {
    // Look for high-priority unresolved issues
    const jql = `project = ${projectKey} AND priority = Highest AND resolution = Unresolved ORDER BY created ASC`;
    const response = await api.asApp().requestJira(route`/rest/api/3/search?jql=${jql}&maxResults=1`);
    const data = await response.json();

    if (data.total > 0) {
      const oldestIssue = data.issues[0];
      const createdDate = new Date(oldestIssue.fields.created);
      const ageHours = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);

      let level = 'LOW';
      let breachEtaMinutes = null;

      if (ageHours > 24) {
        level = 'HIGH';
        breachEtaMinutes = 30;
      } else if (ageHours > 12) {
        level = 'MEDIUM';
        breachEtaMinutes = 120;
      }

      return {
        level,
        breachEtaMinutes,
        incidentKey: oldestIssue.key,
      };
    }

    return {
      level: 'LOW',
      breachEtaMinutes: null,
      incidentKey: null,
    };
  } catch (error) {
    console.error('Error getting SLA risk:', error);
    return {
      level: 'LOW',
      breachEtaMinutes: null,
      incidentKey: null,
    };
  }
}

/**
 * Build seeded telemetry for reliable demo
 */
function buildSeededTelemetry() {
  const snapshot = {
    sprint: {
      velocity: {
        current: 28,
        baseline: 40,
      },
    },
    blockers: {
      count: 3,
      top: [
        { key: 'DEMO-123', summary: 'API gateway configuration blocking deployment' },
        { key: 'DEMO-124', summary: 'Database migration script failing in staging' },
        { key: 'DEMO-125', summary: 'Third-party service integration timeout' },
      ],
    },
    slaRisk: {
      level: 'MEDIUM',
      breachEtaMinutes: 90,
      incidentKey: 'DEMO-123',
    },
    deploy: {
      ready: false,
      failingPipelines: ['build-pipeline', 'integration-tests'],
    },
    updatedAt: new Date().toISOString(),
  };

  const raceStatus = calculateRaceStatus(snapshot);
  snapshot.raceStatus = raceStatus.status;
  snapshot.raceReason = raceStatus.reason;

  return snapshot;
}
