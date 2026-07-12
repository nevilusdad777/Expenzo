import { createBalanceHistoryEntry, getLatestBalanceHistoryEntry } from '../repositories/health.repository';

export function getHealthStatus() {
  return {
    status: 'ok' as const,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };
}

export async function verifyDatabasePipeline() {
  await createBalanceHistoryEntry();
  const latest = await getLatestBalanceHistoryEntry();
  return latest;
}