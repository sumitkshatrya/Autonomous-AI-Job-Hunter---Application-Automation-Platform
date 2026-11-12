import { Schema, model, Document } from 'mongoose';

export interface IResumeVersionDocument extends Document {
  userId: Schema.Types.ObjectId;
  organizationId?: Schema.Types.ObjectId;
  baseResumeId: Schema.Types.ObjectId;
  jobId?: Schema.Types.ObjectId;
  tailoredHeadline: string;
  tailoredSummary: string;
  highlightedSkills: string[];
  tailoredBulletPoints: Array<{
    experienceId?: string;
    originalPoint: string;
    tailoredPoint: string;
  }>;
  formattedMarkdownContent: string;
  formattedPdfStorageKey?: string;
  changesSummary: string[];
  isFactuallyAccurate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeVersionSchema = new Schema<IResumeVersionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    baseResumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', index: true },
    tailoredHeadline: { type: String, required: true },
    tailoredSummary: { type: String, required: true },
    highlightedSkills: [{ type: String }],
    tailoredBulletPoints: [
      {
        experienceId: { type: String },
        originalPoint: { type: String },
        tailoredPoint: { type: String },
      },
    ],
    formattedMarkdownContent: { type: String, required: true },
    formattedPdfStorageKey: { type: String },
    changesSummary: [{ type: String }],
    isFactuallyAccurate: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

ResumeVersionSchema.index({ userId: 1, jobId: 1 });

export const ResumeVersion = model<IResumeVersionDocument>('ResumeVersion', ResumeVersionSchema);
