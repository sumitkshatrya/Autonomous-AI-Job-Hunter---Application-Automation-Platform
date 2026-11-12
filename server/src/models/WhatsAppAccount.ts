import { Schema, model, Document } from 'mongoose';

export interface IWhatsAppAccountDocument extends Document {
  userId: Schema.Types.ObjectId;
  organizationId?: Schema.Types.ObjectId;
  phoneNumberId: string;
  wabaId: string; // WhatsApp Business Account ID
  businessPhoneNumber: string;
  accessTokenEncrypted: string;
  webhookVerifyTokenEncrypted?: string;
  approvedTemplates: Array<{
    name: string;
    language: string;
    status: string;
    category: string;
  }>;
  dailyQuota: number;
  messagesSentToday: number;
  lastResetDate: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppAccountSchema = new Schema<IWhatsAppAccountDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    phoneNumberId: { type: String, required: true },
    wabaId: { type: String, required: true },
    businessPhoneNumber: { type: String, required: true },
    accessTokenEncrypted: { type: String, required: true },
    webhookVerifyTokenEncrypted: { type: String },
    approvedTemplates: [
      {
        name: { type: String, required: true },
        language: { type: String, default: 'en_US' },
        status: { type: String, default: 'APPROVED' },
        category: { type: String, default: 'UTILITY' },
      },
    ],
    dailyQuota: { type: Number, default: 25 },
    messagesSentToday: { type: Number, default: 0 },
    lastResetDate: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const WhatsAppAccount = model<IWhatsAppAccountDocument>(
  'WhatsAppAccount',
  WhatsAppAccountSchema
);
