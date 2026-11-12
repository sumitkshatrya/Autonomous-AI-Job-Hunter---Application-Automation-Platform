import { Schema, model, Document } from 'mongoose';

export interface IApprovedSnapshotDocument extends Document {
  userId: Schema.Types.ObjectId;
  organizationId?: Schema.Types.ObjectId;
  applicationId: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  candidateProfileSnapshot: Record<string, any>;
  resumeSnapshot: Record<string, any>;
  coverLetterSnapshot: string;
  answersSnapshot: Array<{ question: string; answer: string }>;
  consentGiven: boolean;
  consentTimestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApprovedSnapshotSchema = new Schema<IApprovedSnapshotDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    candidateProfileSnapshot: { type: Schema.Types.Mixed, required: true },
    resumeSnapshot: { type: Schema.Types.Mixed, required: true },
    coverLetterSnapshot: { type: String, required: true },
    answersSnapshot: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    consentGiven: { type: Boolean, default: true },
    consentTimestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: true,
  }
);

ApprovedSnapshotSchema.index({ userId: 1, applicationId: 1 });

export const ApprovedSnapshot = model<IApprovedSnapshotDocument>(
  'ApprovedSnapshot',
  ApprovedSnapshotSchema
);
