import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { RecruiterContact } from '../models/RecruiterContact';
import { OutreachMessage } from '../models/OutreachMessage';
import { RecruiterOutreachService } from '../services/RecruiterOutreachService';

const recruiterService = new RecruiterOutreachService();

export class RecruiterController {
  public static async listContacts(req: AuthenticatedRequest, res: Response): Promise<void> {
    const contacts = await RecruiterContact.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, contacts });
  }

  public static async discoverContacts(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { company, jobTitle } = req.body;

    if (!company) {
      res.status(400).json({ success: false, message: 'Company name is required' });
      return;
    }

    const contacts = await recruiterService.discoverRecruiterContacts(
      req.userId!,
      company,
      jobTitle || 'Software Engineer'
    );

    res.json({ success: true, contacts });
  }

  public static async listMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    const messages = await OutreachMessage.find({ userId: req.userId })
      .populate('recruiterId')
      .populate('jobId')
      .sort({ createdAt: -1 });

    res.json({ success: true, messages });
  }

  public static async sendOutreach(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { recruiterId, jobId } = req.body;

    try {
      const message = await recruiterService.sendOutreachMessage(
        req.userId!,
        recruiterId,
        jobId
      );

      res.json({
        success: true,
        message: 'Personalized recruiter outreach sent successfully',
        outreach: message,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async optOutWebhook(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email required' });
      return;
    }

    await recruiterService.handleOptOut(email);
    res.json({ success: true, message: `Email ${email} has been unsubscribed from all recruiter outreach.` });
  }
}
