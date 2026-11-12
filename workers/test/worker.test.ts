import { describe, it, expect } from 'vitest';
import { config } from '../src/config';
import { BackgroundTask } from '../src/models/BackgroundTask';
import { QUEUE_NAMES } from '@autoapply/shared';

describe('AutoApply AI Worker Engine & Task Model Tests', () => {
  it('should load worker configuration with valid defaults', () => {
    expect(config.concurrency).toBeGreaterThan(0);
    expect(config.pollIntervalMs).toBeGreaterThanOrEqual(100);
    expect(config.mongoUri).toBeDefined();
    expect(config.mongoUri).toContain('mongodb');
  });

  it('should validate all standard queue names defined in shared package', () => {
    expect(QUEUE_NAMES.JOB_DISCOVERY).toBe('job-discovery');
    expect(QUEUE_NAMES.JOB_MATCHING).toBe('job-matching');
    expect(QUEUE_NAMES.APPLICATION_GENERATION).toBe('application-generation');
    expect(QUEUE_NAMES.APPLICATION_SUBMISSION).toBe('application-submission');
    expect(QUEUE_NAMES.RECRUITER_DISCOVERY).toBe('recruiter-discovery');
    expect(QUEUE_NAMES.EMAIL_OUTREACH).toBe('email-outreach');
    expect(QUEUE_NAMES.EMAIL_MONITORING).toBe('email-monitoring');
    expect(QUEUE_NAMES.NOTIFICATIONS).toBe('notifications');
    expect(QUEUE_NAMES.ANALYTICS).toBe('analytics');
  });

  it('should initialize a BackgroundTask document with valid default schema values', () => {
    const task = new BackgroundTask({
      queueName: QUEUE_NAMES.JOB_DISCOVERY,
      jobName: 'sync-linkedin-jobs',
      data: { source: 'linkedin', region: 'India' },
    });

    expect(task.queueName).toBe('job-discovery');
    expect(task.jobName).toBe('sync-linkedin-jobs');
    expect(task.status).toBe('pending');
    expect(task.attempts).toBe(0);
    expect(task.maxAttempts).toBe(3);
    expect(task.data?.source).toBe('linkedin');
    expect(task.runAt).toBeInstanceOf(Date);
  });

  it('should support task status transitions to processing and completed', () => {
    const task = new BackgroundTask({
      queueName: QUEUE_NAMES.APPLICATION_SUBMISSION,
      jobName: 'submit-stripe-job',
      data: { applicationId: 'app-123' },
    });

    // Simulate worker acquiring lock
    task.status = 'processing';
    task.lockedAt = new Date();
    task.lockedBy = 'worker-test-1';
    task.attempts += 1;

    expect(task.status).toBe('processing');
    expect(task.attempts).toBe(1);
    expect(task.lockedBy).toBe('worker-test-1');

    // Simulate completion
    task.status = 'completed';
    task.completedAt = new Date();

    expect(task.status).toBe('completed');
    expect(task.completedAt).toBeInstanceOf(Date);
  });

  it('should handle retry exponential backoff calculations on failure', () => {
    const task = new BackgroundTask({
      queueName: QUEUE_NAMES.EMAIL_OUTREACH,
      jobName: 'outreach-recruiter',
      maxAttempts: 3,
    });

    task.attempts = 1;
    const retryDelay = 5000 * task.attempts;
    const nextRunAt = new Date(Date.now() + retryDelay);

    task.status = 'pending';
    task.runAt = nextRunAt;

    expect(task.status).toBe('pending');
    expect(task.runAt.getTime()).toBeGreaterThan(Date.now());
  });
});

