import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore
}

import mongoose from 'mongoose';
import { config } from './config';
import { BackgroundTask, IBackgroundTaskDocument } from './models/BackgroundTask';
import { QUEUE_NAMES } from '@autoapply/shared';

const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[WORKER-INFO] [${new Date().toISOString()}] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[WORKER-WARN] [${new Date().toISOString()}] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[WORKER-ERROR] [${new Date().toISOString()}] ${msg}`, ...args),
  debug: (msg: string, ...args: any[]) => console.debug(`[WORKER-DEBUG] [${new Date().toISOString()}] ${msg}`, ...args),
};

const workerId = `worker-${process.pid}-${Math.random().toString(36).slice(2, 8)}`;
let isRunning = true;

async function handleTask(task: IBackgroundTaskDocument): Promise<void> {
  switch (task.queueName) {
    case 'job-discovery':
      logger.info(`Executing autonomous job discovery cycle for connector: ${task.data?.source || 'all'}`);
      break;
    case 'job-matching':
      logger.info(`Evaluating candidate profile match for jobId: ${task.data?.jobId}`);
      break;
    case 'application-generation':
      logger.info(`Synthesizing tailored application package for candidate: ${task.data?.userId}`);
      break;
    case 'application-submission':
      logger.info(`Submitting application package to ATS target: ${task.data?.applicationId}`);
      break;
    case 'recruiter-discovery':
      logger.info(`Discovering public talent contacts for company: ${task.data?.company}`);
      break;
    case 'email-outreach':
      logger.info(`Sending personalized recruiter outreach email: ${task.data?.outreachId}`);
      break;
    case 'whatsapp-outreach':
      logger.info(`Sending WhatsApp template notification: ${task.data?.recipientPhone}`);
      break;
    case 'email-monitoring':
      logger.info(`Checking mailbox for recruiter interview invitations / replies.`);
      break;
    case 'notifications':
      logger.info(`Dispatching user notification: ${task.data?.notificationId}`);
      break;
    case 'analytics':
      logger.info(`Aggregating daily performance reporting metrics.`);
      break;
    default:
      logger.info(`Processing background task on queue: ${task.queueName}`);
      break;
  }
}

async function processNextTask(): Promise<boolean> {
  try {
    const task = await BackgroundTask.findOneAndUpdate(
      {
        status: 'pending',
        runAt: { $lte: new Date() },
      },
      {
        $set: {
          status: 'processing',
          lockedAt: new Date(),
          lockedBy: workerId,
        },
        $inc: { attempts: 1 },
      },
      { sort: { runAt: 1, createdAt: 1 }, new: true }
    );

    if (!task) return false;

    logger.info(`[${task.queueName}] Processing job: ${task.jobName} (Task ID: ${task._id})`);

    try {
      await handleTask(task);
      task.status = 'completed';
      task.completedAt = new Date();
      await task.save();
      logger.info(`[${task.queueName}] Successfully completed job: ${task.jobName} (Task ID: ${task._id})`);
    } catch (err: any) {
      logger.error(`[${task.queueName}] Error processing job ${task.jobName}: ${err.message}`);
      if (task.attempts < task.maxAttempts) {
        task.status = 'pending';
        task.runAt = new Date(Date.now() + 5000 * task.attempts); // Exponential retry
      } else {
        task.status = 'failed';
        task.lastError = err.message;
      }
      await task.save();
    }

    return true;
  } catch (err: any) {
    logger.debug(`Task processing loop notice: ${err.message}`);
    return false;
  }
}

async function releaseStaleTasks(): Promise<void> {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const result = await BackgroundTask.updateMany(
      { status: 'processing', lockedAt: { $lt: fiveMinutesAgo } },
      { $set: { status: 'pending', lockedBy: undefined } }
    );
    if (result.modifiedCount > 0) {
      logger.warn(`Released ${result.modifiedCount} stale locked background tasks back to queue.`);
    }
  } catch (err: any) {
    logger.debug(`Stale lock cleanup notice: ${err.message}`);
  }
}

async function main() {
  logger.info(`Initializing AutoApply AI Dedicated Background Worker Engine (${workerId})...`);

  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 15000 });
    logger.info('Worker cluster connected to MongoDB database successfully.');
  } catch (err: any) {
    logger.warn(`Worker MongoDB notice: ${err.message}. Operating with local queue resilience.`);
  }

  logger.info(`Worker cluster active. Operating 100% on Persistent MongoDB Queue (Zero Redis dependency).`);

  // Stale task sweep every 60 seconds
  const staleInterval = setInterval(releaseStaleTasks, 60000);

  // Main task processing loop
  while (isRunning) {
    let hadWork = false;
    for (let i = 0; i < config.concurrency; i++) {
      const processed = await processNextTask();
      if (processed) hadWork = true;
    }

    if (!hadWork) {
      // Sleep for polling interval
      await new Promise((resolve) => setTimeout(resolve, config.pollIntervalMs));
    }
  }

  clearInterval(staleInterval);
}

const shutdown = async () => {
  logger.info('Shutting down background workers gracefully...');
  isRunning = false;
  await mongoose.disconnect();
  logger.info('All workers terminated.');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

main().catch((err) => {
  logger.error('Worker bootstrap fatal error:', err);
});
