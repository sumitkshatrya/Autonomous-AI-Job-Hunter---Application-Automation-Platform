import { Schema, model, Document } from 'mongoose';

export interface IOrganizationDocument extends Document {
  name: string;
  slug: string;
  ownerId: Schema.Types.ObjectId;
  subscriptionTier: string;
  maxSeats: number;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganizationDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subscriptionTier: { type: String, default: 'enterprise' },
    maxSeats: { type: Number, default: 5 },
    settings: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

export const Organization = model<IOrganizationDocument>('Organization', OrganizationSchema);
