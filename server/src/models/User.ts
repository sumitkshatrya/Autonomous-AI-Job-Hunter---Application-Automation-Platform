import { Schema, model, Document } from 'mongoose';
import { UserRole, SubscriptionTier } from '@autoapply/shared';

export interface IUserDocument extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  organizationId?: Schema.Types.ObjectId;
  isActive: boolean;
  isEmailVerified: boolean;
  avatarUrl?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['individual', 'saas_customer', 'admin', 'organization_member'],
      default: 'individual',
      index: true,
    },
    subscriptionTier: {
      type: String,
      enum: ['starter', 'pro', 'enterprise', 'custom'],
      default: 'starter',
      index: true,
    },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    avatarUrl: { type: String },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ organizationId: 1, role: 1 });

export const User = model<IUserDocument>('User', UserSchema);
