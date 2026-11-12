import { Schema, model, Document } from 'mongoose';
import { OutreachStatus } from '@autoapply/shared';

export interface IOutreachMessageDocument extends Document {
  userId: Schema.Types.ObjectId;
  organizationId?: Schema.Types.ObjectId;
  recruiterId: Schema.Types.ObjectId;
  jobId?: Schema.Types.ObjectId;
  channel: 'email' | 'whatsapp';
  subject?: string;
  body: string;
  resumeAttachmentKey?: string;
  status: OutreachStatus;
  externalMessageId?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  repliedAt?: Date;
  error?: string;
  openCount: number;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const OutreachMessageSchema = new Schema<IOutreachMessageDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    recruiterId: { type: Schema.Types.ObjectId, ref: 'RecruiterContact', required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', index: true },
    channel: { type: String, enum: ['email', 'whatsapp'], required: true },
    subject: { type: String },
    body: { type: String, required: true },
    resumeAttachmentKey: { type: String },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sent', 'delivered', 'bounced', 'replied', 'opted_out', 'failed'],
      default: 'draft',
      index: true,
    },
    externalMessageId: { type: String },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    repliedAt: { type: Date },
    error: { type: String },
    openCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

OutreachMessageSchema.index({ userId: 1, recruiterId: 1, createdAt: -1 });

export const OutreachMessage = model<IOutreachMessageDocument>(
  'OutreachMessage',
  OutreachMessageSchema
);
