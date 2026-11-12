import { Schema, model, Document } from 'mongoose';

export interface IEmailAccountDocument extends Document {
  userId: Schema.Types.ObjectId;
  organizationId?: Schema.Types.ObjectId;
  provider: 'gmail' | 'outlook' | 'smtp';
  emailAddress: string;
  accessTokenEncrypted?: string;
  refreshTokenEncrypted?: string;
  tokenExpiresAt?: Date;
  smtpConfig?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      passEncrypted: string;
    };
  };
  dailyQuota: number;
  emailsSentToday: number;
  lastResetDate: string; // YYYY-MM-DD
  isActive: boolean;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmailAccountSchema = new Schema<IEmailAccountDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    provider: { type: String, enum: ['gmail', 'outlook', 'smtp'], required: true },
    emailAddress: { type: String, required: true, lowercase: true, trim: true },
    accessTokenEncrypted: { type: String },
    refreshTokenEncrypted: { type: String },
    tokenExpiresAt: { type: Date },
    smtpConfig: {
      host: { type: String },
      port: { type: Number },
      secure: { type: Boolean, default: true },
      auth: {
        user: { type: String },
        passEncrypted: { type: String },
      },
    },
    dailyQuota: { type: Number, default: 50 },
    emailsSentToday: { type: Number, default: 0 },
    lastResetDate: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    isActive: { type: Boolean, default: true },
    isPrimary: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

EmailAccountSchema.index({ userId: 1, emailAddress: 1 }, { unique: true });

export const EmailAccount = model<IEmailAccountDocument>('EmailAccount', EmailAccountSchema);
