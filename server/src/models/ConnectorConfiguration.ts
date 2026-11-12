import { Schema, model, Document } from 'mongoose';
import { JobSource, JOB_SOURCES } from '@autoapply/shared';

export interface IConnectorConfigurationDocument extends Document {
  source: JobSource;
  displayName: string;
  isEnabled: boolean;
  apiKeyEncrypted?: string;
  apiSecretEncrypted?: string;
  baseUrl?: string;
  rateLimitPerMinute: number;
  lastSyncAt?: Date;
  lastSyncStatus: 'success' | 'partial' | 'failed' | 'idle';
  jobsFetchedTotal: number;
  errorMessage?: string;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ConnectorConfigurationSchema = new Schema<IConnectorConfigurationDocument>(
  {
    source: {
      type: String,
      enum: JOB_SOURCES,
      required: true,
      unique: true,
    },
    displayName: { type: String, required: true },
    isEnabled: { type: Boolean, default: true },
    apiKeyEncrypted: { type: String },
    apiSecretEncrypted: { type: String },
    baseUrl: { type: String },
    rateLimitPerMinute: { type: Number, default: 60 },
    lastSyncAt: { type: Date },
    lastSyncStatus: {
      type: String,
      enum: ['success', 'partial', 'failed', 'idle'],
      default: 'idle',
    },
    jobsFetchedTotal: { type: Number, default: 0 },
    errorMessage: { type: String },
    settings: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

export const ConnectorConfiguration = model<IConnectorConfigurationDocument>(
  'ConnectorConfiguration',
  ConnectorConfigurationSchema
);
