import { Schema, model, Document } from 'mongoose';
import { ApplicationStatus, SubmissionMethod, IApplicationAnswer } from '@autoapply/shared';

export interface IApplicationDocument extends Document {
  userId: Schema.Types.ObjectId;
  organizationId?: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  tailoredResumeId?: Schema.Types.ObjectId;
  tailoredResumeContent?: string;
  coverLetter: string;
  answers: IApplicationAnswer[];
  status: ApplicationStatus;
  submissionMethod: SubmissionMethod;
  submissionResult?: {
    success: boolean;
    confirmationId?: string;
    submittedAt?: Date;
    details?: string;
    screenshotUrl?: string;
  };
  failureReason?: string;
  isFactuallyVerified: boolean;
  notes?: string;
  timeline: Array<{
    status: ApplicationStatus;
    changedAt: Date;
    notes?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationAnswerSchema = new Schema<IApplicationAnswer>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    fieldType: {
      type: String,
      enum: ['text', 'textarea', 'select', 'radio', 'checkbox', 'file'],
      default: 'text',
    },
    confidence: { type: Number, default: 100 },
    sourceField: { type: String },
  },
  { _id: false }
);

const ApplicationSchema = new Schema<IApplicationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    tailoredResumeId: { type: Schema.Types.ObjectId, ref: 'ResumeVersion' },
    tailoredResumeContent: { type: String },
    coverLetter: { type: String, required: true },
    answers: [ApplicationAnswerSchema],
    status: {
      type: String,
      enum: [
        'draft',
        'ready',
        'submitting',
        'applied',
        'failed',
        'under_review',
        'interview',
        'rejected',
        'offer',
        'withdrawn',
      ],
      default: 'draft',
      index: true,
    },
    submissionMethod: {
      type: String,
      enum: [
        'greenhouse_api',
        'lever_api',
        'ats_official',
        'playwright_browser',
        'browser_automation',
        'manual_handoff',
      ],
      default: 'greenhouse_api',
    },
    submissionResult: {
      success: { type: Boolean },
      confirmationId: { type: String },
      submittedAt: { type: Date },
      details: { type: String },
      screenshotUrl: { type: String },
    },
    failureReason: { type: String },
    isFactuallyVerified: { type: Boolean, default: true },
    notes: { type: String },
    timeline: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        notes: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

ApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });
ApplicationSchema.index({ userId: 1, status: 1 });

export const Application = model<IApplicationDocument>('Application', ApplicationSchema);
