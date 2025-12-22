import { buildTelemetrySnapshot } from '../telemetry';
import { setTelemetry } from '../storage';

/**
 * Handler to update telemetry snapshot
 * Can be triggered via webtrigger or called internally
 */
export async function handler(event, context) {
  try {
    const projectKey = event.projectKey || 'DEMO';
    const useSeededData = event.useSeededData !== false; // Default to seeded for demo reliability

    console.log(`Updating telemetry for project: ${projectKey}, seeded: ${useSeededData}`);

    const snapshot = await buildTelemetrySnapshot(projectKey, useSeededData);
    await setTelemetry(snapshot);

    return {
      success: true,
      snapshot,
    };
  } catch (error) {
    console.error('Telemetry updater error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
