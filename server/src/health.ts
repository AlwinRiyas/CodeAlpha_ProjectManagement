export const healthSnapshot = (dbOk: boolean) => ({
  status: dbOk ? 'ok' : 'degraded',
  service: 'projectflow-api',
  database: dbOk ? 'ok' : 'unavailable',
  timestamp: new Date().toISOString(),
});
