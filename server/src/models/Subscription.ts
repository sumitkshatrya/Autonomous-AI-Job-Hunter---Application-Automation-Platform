import { Schema, model, Document } from 'mongoose';
import { SubscriptionTier } from '@autoapply/shared';

export interface ISubscriptionDocument extends Document {
  userId: Schema.Types.ObjectId;
  organizationId?: Schema.Types.ObjectId;
  tier: SubscriptionTier;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  limits: {
    maxDailyApplications: number;
    maxDailyEmailOutreach: number;
    maxDailyWhatsApp: number;
    allowVectorSearch: boolean;
    allowAutonomousSubmission: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    tier: {
      type: String,
      enum: ['starter', 'pro', 'enterprise', 'custom'],
      default: 'starter',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'past_due', 'canceled', 'trialing'],
      default: 'active',
      index: true,
    },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    limits: {
      maxDailyApplications: { type: Number, default: 50 },
      maxDailyEmailOutreach: { type: Number, default: 25 },
      maxDailyWhatsApp: { type: Number, default: 10 },
      allowVectorSearch: { type: Boolean, default: true },
      allowAutonomousSubmission: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

SubscriptionSchema.index({ userId: 1, status: 1 });

export const Subscription = model<ISubscriptionDocument>('Subscription', SubscriptionSchema);
