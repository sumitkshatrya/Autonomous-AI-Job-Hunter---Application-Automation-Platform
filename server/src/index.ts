import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore
}

import mongoose from 'mongoose';
import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { JobDiscoveryService } from './services/JobDiscoveryService';

async function bootstrap() {
  const app = createApp();

  // 1. Bind HTTP listener immediately so cloud health checks (Render/Railway/AWS/GCP) pass instantly
  const server = app.listen(config.port, '0.0.0.0', () => {
    logger.info(`🚀 AutoApply AI REST Server running on port ${config.port} (${config.env})`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${config.port} is currently busy (EADDRINUSE). Waiting for port release...`);
      setTimeout(() => {
        try {
          server.close();
          server.listen(config.port);
        } catch {
          // Ignore
        }
      }, 1500);
    } else {
      logger.error(`Server listen error: ${err.message}`);
    }
  });

  // 2. Connect to MongoDB and initialize background autonomous engines
  try {
    logger.info(`Connecting to MongoDB at: ${config.mongoUri.replace(/:([^@]+)@/, ':****@')}`);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });
    logger.info('Connected to MongoDB database successfully.');

    // 🚀 Start Zero-Click 24/7 Autonomous Job Hunter & Application Engine
    const { AutonomousHunterService } = await import('./services/AutonomousHunterService');
    AutonomousHunterService.getInstance().startAutopilotLoop(10 * 60 * 1000); // Discovers and applies 24/7 every 10 minutes
  } catch (err: any) {
    logger.warn(`MongoDB initial connection notice: ${err.message}. Server running with runtime resilience.`);
  }

  const shutdown = async () => {
    logger.info('Shutting down API server gracefully...');
    server.close(async () => {
      await mongoose.disconnect();
      logger.info('Closed DB connections and HTTP server.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}
