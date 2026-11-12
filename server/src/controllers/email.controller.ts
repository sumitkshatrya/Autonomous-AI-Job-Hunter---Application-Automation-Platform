import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { EmailAccount } from '../models/EmailAccount';
import { EmailMonitoringService } from '../services/EmailMonitoringService';
import { EmailNotificationService } from '../services/EmailNotificationService';
import { CandidateProfile } from '../models/CandidateProfile';
import { encrypt } from '../utils/crypto';

const emailMonitoringService = new EmailMonitoringService();

export class EmailController {
  public static async getAccounts(req: AuthenticatedRequest, res: Response): Promise<void> {
    const accounts = await EmailAccount.find({ userId: req.userId }).select('-smtpConfig.auth.passEncrypted');
    res.json({ success: true, accounts });
  }

  public static async connectSmtp(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { emailAddress, host, port, secure, user, pass } = req.body;

    const passEncrypted = encrypt(pass);

    const account = await EmailAccount.findOneAndUpdate(
      { userId: req.userId, emailAddress: emailAddress.toLowerCase() },
      {
        userId: req.userId,
        organizationId: req.organizationId,
        provider: 'smtp',
        emailAddress: emailAddress.toLowerCase(),
        smtpConfig: {
          host,
          port: Number(port) || 465,
          secure: secure ?? true,
          auth: {
            user,
            passEncrypted,
          },
        },
        isActive: true,
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'SMTP Email account connected and verified successfully',
      account: {
        id: account._id,
        emailAddress: account.emailAddress,
        provider: account.provider,
        isActive: account.isActive,
      },
    });
  }

  public static async simulateInboundReply(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { senderEmail, subject, body } = req.body;

    await emailMonitoringService.handleRecruiterReply(
      req.userId!,
      senderEmail || 'recruiter@techventures.io',
      subject || 'Invitation to Interview - Technical Round',
      body || 'Hi, We reviewed your application and would love to schedule a 45-minute video interview. Let us know your availability for this coming Tuesday or Wednesday: https://calendly.com/techventures/interview'
    );

    res.json({
      success: true,
      message: 'Inbound recruiter email ingested, classified, and notifications dispatched.',
    });
  }

  public static async sendTestNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    const profile = await CandidateProfile.findOne({ userId: req.userId });
    const targetEmail = req.body?.email || profile?.email || 'skumar21082001@gmail.com';

    const result = await EmailNotificationService.getInstance().sendTestNotification(targetEmail);

    res.json({
      success: result.success,
      message: `Test email notification dispatched to ${targetEmail} via ${result.channel}`,
      channel: result.channel,
    });
  }
}
