import Resolver from '@forge/resolver';
import Dashboard from './frontend/Dashboard';

const resolver = new Resolver();

// Register UI resolver
resolver.define('main', (req) => {
  return Dashboard();
});

// Register function resolvers for bridge invocations
resolver.define('telemetry-updater', async (req) => {
  const { handler } = await import('./handlers/telemetryUpdater');
  return await handler(req.payload, req.context);
});

resolver.define('pit-engineer', async (req) => {
  const { handler } = await import('./handlers/pitEngineer');
  return await handler(req.payload, req.context);
});

resolver.define('apply-suggestion', async (req) => {
  const { handler } = await import('./handlers/applySuggestion');
  return await handler(req.payload, req.context);
});

export const handler = resolver.getDefinitions();
