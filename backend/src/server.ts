import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { ensureDefaultAdmin } from './repositories/adminAccount.repository';

async function start() {
  // Ensure at least one admin exists in the database
  await ensureDefaultAdmin();

  const server = app.listen(env.PORT, '0.0.0.0', () => {
    logger.info(`Backend running on http://0.0.0.0:${env.PORT}`, {
      env: env.NODE_ENV,
      corsOrigin: env.CORS_ORIGIN,
    });
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => process.exit(0));
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});