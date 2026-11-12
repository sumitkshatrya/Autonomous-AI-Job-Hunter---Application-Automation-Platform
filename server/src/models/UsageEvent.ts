import { Schema, model, Document } from 'mongoose';

export interface IUsageEventDocument extends Document {
  userId: Schema.Types.ObjectId;
  organizationId?: Schema.Types.ObjectId;
  eventType:
    | 'job_discovered'
    | 'resume_tailored'
    | 'application_submitted'
    | 'recruiter_email_sent'
    | 'whatsapp_sent'
    | 'ai_tokens_consumed';
  count: number;
  metadata?: Record<string, any>;
  timestamp: Date;
  createdAt: Date;
}

const UsageEventSchema = new Schema<IUsageEventDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    eventType: {
      type: String,
      enum: [
        'job_discovered',
        'resume_tailored',
        'application_submitted',
        'recruiter_email_sent',
        'whatsapp_sent',
        'ai_tokens_consumed',
      ],
      required: true,
      index: true,
    },
    count: { type: Number, default: 1 },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

UsageEventSchema.index({ userId: 1, eventType: 1, timestamp: -1 });

export const UsageEvent = model<IUsageEventDocument>('UsageEvent', UsageEventSchema);
