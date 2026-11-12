import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { WhatsAppAccount } from '../models/WhatsAppAccount';
import { WhatsAppBusinessService } from '../services/WhatsAppBusinessService';
import { encrypt } from '../utils/crypto';

const waService = new WhatsAppBusinessService();

export class WhatsAppController {
  public static async getAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    const account = await WhatsAppAccount.findOne({ userId: req.userId }).select('-accessTokenEncrypted');
    res.json({ success: true, account });
  }

  public static async configureAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { phoneNumberId, wabaId, businessPhoneNumber, accessToken } = req.body;

    const accessTokenEncrypted = encrypt(accessToken);

    const account = await WhatsAppAccount.findOneAndUpdate(
      { userId: req.userId },
      {
        userId: req.userId,
        organizationId: req.organizationId,
        phoneNumberId,
        wabaId,
        businessPhoneNumber,
        accessTokenEncrypted,
        isActive: true,
        approvedTemplates: [
          { name: 'application_submitted_alert', language: 'en_US', status: 'APPROVED', category: 'UTILITY' },
          { name: 'interview_invitation_urgent', language: 'en_US', status: 'APPROVED', category: 'UTILITY' },
          { name: 'daily_job_hunter_digest', language: 'en_US', status: 'APPROVED', category: 'UTILITY' },
        ],
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'WhatsApp Business Cloud API account connected successfully',
      account: {
        id: account._id,
        businessPhoneNumber: account.businessPhoneNumber,
        phoneNumberId: account.phoneNumberId,
        templates: account.approvedTemplates,
      },
    });
  }

  public static async sendTestNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { recipientPhone, templateName } = req.body;

    const result = await waService.sendTemplateMessage(req.userId!, {
      recipientPhone: recipientPhone || '+15551234567',
      templateName: templateName || 'interview_invitation_urgent',
      parameters: [{ type: 'text', text: 'Interview with CloudMatrix on Wednesday at 2:00 PM EST' }],
    });

    res.json({
      success: result.success,
      message: result.success ? 'WhatsApp message dispatched' : result.error,
      result,
    });
  }

  // Meta Webhook Challenge verification
  public static verifyWebhook(req: Request, res: Response): void {
    const mode = req.query['hub.mode'] as string;
    const token = req.query['hub.verify_token'] as string;
    const challenge = req.query['hub.challenge'] as string;

    const verified = waService.verifyWebhook(mode, token, challenge);
    if (verified) {
      res.status(200).send(verified);
    } else {
      res.status(403).json({ success: false, message: 'Invalid verification token' });
    }
  }

  // Meta Webhook Inbound Events
  public static async handleWebhook(req: Request, res: Response): Promise<void> {
    await waService.handleIncomingWebhook(req.body);
    res.status(200).json({ status: 'ok' });
  }
}
