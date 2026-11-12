import { Schema, model, Document } from 'mongoose';

export interface IMembershipDocument extends Document {
  organizationId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  role: 'owner' | 'admin' | 'member';
  invitedBy?: Schema.Types.ObjectId;
  status: 'active' | 'invited' | 'disabled';
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<IMembershipDocument>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['active', 'invited', 'disabled'], default: 'active' },
  },
  {
    timestamps: true,
  }
);

MembershipSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

export const Membership = model<IMembershipDocument>('Membership', MembershipSchema);
