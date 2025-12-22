import api, { storage } from '@forge/api';

const TELEMETRY_KEY = 'pitcrew:telemetry:latest';
const CONFIG_KEY = 'pitcrew:config';

/**
 * Get the latest telemetry snapshot
 */
export async function getTelemetry() {
  try {
    const data = await storage.get(TELEMETRY_KEY);
    return data || null;
  } catch (error) {
    console.error('Error reading telemetry:', error);
    return null;
  }
}

/**
 * Store telemetry snapshot
 */
export async function setTelemetry(snapshot) {
  try {
    await storage.set(TELEMETRY_KEY, snapshot);
    return true;
  } catch (error) {
    console.error('Error storing telemetry:', error);
    return false;
  }
}

/**
 * Get app configuration
 */
export async function getConfig() {
  try {
    const data = await storage.get(CONFIG_KEY);
    return data || {
      automationEnabled: true,
      escalationUserId: null,
      sprintBaseline: 40,
    };
  } catch (error) {
    console.error('Error reading config:', error);
    return {
      automationEnabled: true,
      escalationUserId: null,
      sprintBaseline: 40,
    };
  }
}

/**
 * Update app configuration
 */
export async function setConfig(config) {
  try {
    await storage.set(CONFIG_KEY, config);
    return true;
  } catch (error) {
    console.error('Error storing config:', error);
    return false;
  }
}
