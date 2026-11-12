import { Schema, model, Document } from 'mongoose';

export interface IAuditLogDocument extends Document {
  userId?: Schema.Types.ObjectId;
  organizationId?: Schema.Types.ObjectId;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  status: 'success' | 'failure';
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true, index: true },
    resourceId: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    details: { type: Schema.Types.Mixed },
    status: { type: String, enum: ['success', 'failure'], default: 'success' },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AuditLogSchema.index({ userId: 1, action: 1, createdAt: -1 });

export const AuditLog = model<IAuditLogDocument>('AuditLog', AuditLogSchema);
