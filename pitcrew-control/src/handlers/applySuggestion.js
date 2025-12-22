import api, { route } from '@forge/api';
import { getTelemetry } from '../storage';
import { identifyTopRisk } from '../utils/riskScoring';

/**
 * Apply Suggestion - automated action execution
 * Applies the Pit Engineer's recommendation to Jira
 *
 * Safe actions:
 * - Add escalation comment
 * - Add tracking label (pitcrew-escalate, pitcrew-blocker, sla-watch)
 * - Optionally assign to configured user
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

    const topRisk = identifyTopRisk(snapshot);

    if (!topRisk.issue) {
      return {
        success: false,
        error: 'No actionable issue identified',
        message: 'Current risk does not map to a specific Jira issue. Manual intervention recommended.',
      };
    }

    // Apply automation based on risk type
    const result = await applyAutomation(topRisk, snapshot);

    return {
      success: true,
      appliedTo: topRisk.issue,
      riskType: topRisk.type,
      actions: result.actions,
      message: result.message,
    };
  } catch (error) {
    console.error('Apply suggestion error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Apply automation based on risk type
 */
async function applyAutomation(risk, snapshot) {
  const actions = [];

  switch (risk.type) {
    case 'sla':
      return await applySLAEscalation(risk, snapshot, actions);
    case 'blocker':
      return await applyBlockerAction(risk, snapshot, actions);
    default:
      return {
        actions: ['no-action'],
        message: 'Risk identified but no automated action configured for this type.',
      };
  }
}

/**
 * Apply SLA escalation automation
 */
async function applySLAEscalation(risk, snapshot, actions) {
  const issueKey = risk.issue;

  // Add escalation comment
  const commentBody = {
    body: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '🏁 ',
              marks: [],
            },
            {
              type: 'text',
              text: 'PitCrew Control: SLA Escalation',
              marks: [{ type: 'strong' }],
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: `SLA Risk Level: ${risk.severity}`,
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: snapshot.slaRisk.breachEtaMinutes
                ? `Estimated time to breach: ${snapshot.slaRisk.breachEtaMinutes} minutes`
                : 'SLA monitoring active',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Action Required: Immediate review and prioritization recommended.',
              marks: [{ type: 'em' }],
            },
          ],
        },
      ],
    },
  };

  const commentResponse = await api.asApp().requestJira(
    route`/rest/api/3/issue/${issueKey}/comment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentBody),
    }
  );

  if (commentResponse.status === 201) {
    actions.push('added-escalation-comment');
  }

  // Add label
  const labelBody = {
    update: {
      labels: [{ add: 'pitcrew-escalate' }],
    },
  };

  const labelResponse = await api.asApp().requestJira(
    route`/rest/api/3/issue/${issueKey}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(labelBody),
    }
  );

  if (labelResponse.status === 204) {
    actions.push('added-label-pitcrew-escalate');
  }

  return {
    actions,
    message: `Applied SLA escalation to ${issueKey}: added comment and label 'pitcrew-escalate'`,
  };
}

/**
 * Apply blocker action automation
 */
async function applyBlockerAction(risk, snapshot, actions) {
  const issueKey = risk.issue;

  // Add blocker comment
  const commentBody = {
    body: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '🏁 ',
              marks: [],
            },
            {
              type: 'text',
              text: 'PitCrew Control: Blocker Identified',
              marks: [{ type: 'strong' }],
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: `Total blockers detected: ${snapshot.blockers.count}`,
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'This issue has been identified as a high-priority blocker affecting sprint progress.',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Recommended Actions:',
              marks: [{ type: 'strong' }],
            },
          ],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Review in next standup',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Consider swarming if unresolved within 24h',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Document blockers and dependencies',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  };

  const commentResponse = await api.asApp().requestJira(
    route`/rest/api/3/issue/${issueKey}/comment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentBody),
    }
  );

  if (commentResponse.status === 201) {
    actions.push('added-blocker-comment');
  }

  // Add label
  const labelBody = {
    update: {
      labels: [{ add: 'pitcrew-blocker' }],
    },
  };

  const labelResponse = await api.asApp().requestJira(
    route`/rest/api/3/issue/${issueKey}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(labelBody),
    }
  );

  if (labelResponse.status === 204) {
    actions.push('added-label-pitcrew-blocker');
  }

  return {
    actions,
    message: `Applied blocker action to ${issueKey}: added comment and label 'pitcrew-blocker'`,
  };
}
