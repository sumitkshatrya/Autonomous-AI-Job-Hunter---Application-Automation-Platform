import mongoose, { Schema, Document } from 'mongoose';

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface IBackgroundTaskDocument extends Document {
  queueName: string;
  jobName: string;
  data: Record<string, any>;
  status: TaskStatus;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  runAt: Date;
  lockedAt?: Date;
  lockedBy?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BackgroundTaskSchema = new Schema<IBackgroundTaskDocument>(
  {
    queueName: { type: String, required: true, index: true },
    jobName: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    lastError: { type: String },
    runAt: { type: Date, default: Date.now, index: true },
    lockedAt: { type: Date },
    lockedBy: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

BackgroundTaskSchema.index({ queueName: 1, status: 1, runAt: 1 });
BackgroundTaskSchema.index({ status: 1, lockedAt: 1 });

export const BackgroundTask = mongoose.model<IBackgroundTaskDocument>(
  'BackgroundTask',
  BackgroundTaskSchema
);
