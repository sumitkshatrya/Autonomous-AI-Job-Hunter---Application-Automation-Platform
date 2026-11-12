import { Schema, model, Document } from 'mongoose';
import { IScoringWeights, WorkplaceType } from '@autoapply/shared';

export interface IAutomationSettingsDocument extends Document {
  userId: Schema.Types.ObjectId;
  organizationId?: Schema.Types.ObjectId;
  enabled: boolean;
  discoveryFrequencyHours: number;
  autoApplyThreshold: number;
  dailyApplicationLimit: number;
  dailyEmailOutreachLimit: number;
  dailyWhatsAppLimit: number;
  scoringWeights: IScoringWeights;
  allowedWorkplaceTypes: WorkplaceType[];
  sendRecruiterOutreach: boolean;
  sendWhatsAppAlerts: boolean;
  sendEmailAlerts: boolean;
  notificationEmail?: string;
  requireApprovalBeforeSubmit: boolean;
  lastAutonomousRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AutomationSettingsSchema = new Schema<IAutomationSettingsDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    enabled: { type: Boolean, default: true, index: true },
    discoveryFrequencyHours: { type: Number, default: 1 },
    autoApplyThreshold: { type: Number, default: 75 },
    dailyApplicationLimit: { type: Number, default: 50 },
    dailyEmailOutreachLimit: { type: Number, default: 25 },
    dailyWhatsAppLimit: { type: Number, default: 10 },
    scoringWeights: {
      skills: { type: Number, default: 35 },
      experience: { type: Number, default: 25 },
      jobTitle: { type: Number, default: 15 },
      location: { type: Number, default: 10 },
      seniority: { type: Number, default: 10 },
      keywords: { type: Number, default: 5 },
    },
    allowedWorkplaceTypes: [{ type: String, enum: ['remote', 'hybrid', 'onsite', 'any'], default: ['remote', 'hybrid'] }],
    sendRecruiterOutreach: { type: Boolean, default: true },
    sendWhatsAppAlerts: { type: Boolean, default: true },
    sendEmailAlerts: { type: Boolean, default: true },
    notificationEmail: { type: String, default: 'skumar21082001@gmail.com' },
    requireApprovalBeforeSubmit: { type: Boolean, default: false },
    lastAutonomousRunAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const AutomationSettings = model<IAutomationSettingsDocument>(
  'AutomationSettings',
  AutomationSettingsSchema
);
