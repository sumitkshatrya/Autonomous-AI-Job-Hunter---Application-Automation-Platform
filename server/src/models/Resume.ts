import { Schema, model, Document } from 'mongoose';

export interface IResumeDocument extends Document {
  userId: Schema.Types.ObjectId;
  organizationId?: Schema.Types.ObjectId;
  originalFileName: string;
  storageKey: string;
  fileUrl?: string;
  mimeType: string;
  fileSizeBytes: number;
  rawExtractedText: string;
  parsedProfileSnapshot: Record<string, any>;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResumeDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    originalFileName: { type: String, required: true },
    storageKey: { type: String, required: true },
    fileUrl: { type: String },
    mimeType: { type: String, required: true },
    fileSizeBytes: { type: Number, required: true },
    rawExtractedText: { type: String, required: true },
    parsedProfileSnapshot: { type: Schema.Types.Mixed, default: {} },
    isPrimary: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

ResumeSchema.index({ userId: 1, isPrimary: 1 });

export const Resume = model<IResumeDocument>('Resume', ResumeSchema);
