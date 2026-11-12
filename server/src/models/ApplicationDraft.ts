import { Schema, model, Document } from 'mongoose';

export interface IApplicationDraftDocument extends Document {
  userId: Schema.Types.ObjectId;
  organizationId?: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  draftData: Record<string, any>;
  version: number;
  lastAutoSavedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationDraftSchema = new Schema<IApplicationDraftDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    draftData: { type: Schema.Types.Mixed, required: true },
    version: { type: Number, default: 1 },
    lastAutoSavedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

ApplicationDraftSchema.index({ userId: 1, jobId: 1 });

export const ApplicationDraft = model<IApplicationDraftDocument>(
  'ApplicationDraft',
  ApplicationDraftSchema
);
