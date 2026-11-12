import { Schema, model, Document } from 'mongoose';
import { RecruiterVerificationStatus } from '@autoapply/shared';

export interface IRecruiterContactDocument extends Document {
  userId: Schema.Types.ObjectId;
  organizationId?: Schema.Types.ObjectId;
  name: string;
  company: string;
  role: string;
  publicProfileUrl?: string;
  email: string;
  source: string;
  verificationStatus: RecruiterVerificationStatus;
  optOut: boolean;
  optOutDate?: Date;
  lastContactedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecruiterContactSchema = new Schema<IRecruiterContactDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true, index: true },
    role: { type: String, required: true, trim: true },
    publicProfileUrl: { type: String },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    source: { type: String, default: 'public_web' },
    verificationStatus: {
      type: String,
      enum: ['verified', 'unverified', 'risky'],
      default: 'unverified',
    },
    optOut: { type: Boolean, default: false, index: true },
    optOutDate: { type: Date },
    lastContactedAt: { type: Date },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

RecruiterContactSchema.index({ userId: 1, email: 1 }, { unique: true });

export const RecruiterContact = model<IRecruiterContactDocument>(
  'RecruiterContact',
  RecruiterContactSchema
);
