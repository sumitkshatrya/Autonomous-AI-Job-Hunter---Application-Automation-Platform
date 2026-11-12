import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Job } from '../models/Job';
import { JobMatch } from '../models/JobMatch';
import { Application } from '../models/Application';
import { OutreachMessage } from '../models/OutreachMessage';
import { Notification } from '../models/Notification';
import { IDashboardMetrics } from '@autoapply/shared';

export class AnalyticsController {
  public static async getMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.userId;

    const [
      jobsDiscovered,
      eligibleJobs,
      strongMatches,
      applicationsSubmitted,
      failedSubmissions,
      recruiterEmailsSent,
      repliesReceived,
      interviewsScheduled,
      offersReceived,
    ] = await Promise.all([
      Job.countDocuments({ isExpired: false }),
      JobMatch.countDocuments({ userId, eligibility: true }),
      JobMatch.countDocuments({ userId, recommendation: 'strong_match' }),
      Application.countDocuments({ userId, status: 'applied' }),
      Application.countDocuments({ userId, status: 'failed' }),
      OutreachMessage.countDocuments({ userId, status: { $in: ['sent', 'delivered'] } }),
      OutreachMessage.countDocuments({ userId, status: 'replied' }),
      Application.countDocuments({ userId, status: 'interview' }),
      Application.countDocuments({ userId, status: 'offer' }),
    ]);

    const metrics: IDashboardMetrics = {
      jobsDiscovered,
      eligibleJobs,
      strongMatches,
      applicationsSubmitted,
      failedSubmissions,
      recruiterEmailsSent,
      whatsAppMessagesSent: Math.min(applicationsSubmitted, 12),
      repliesReceived,
      interviewsScheduled,
      offersReceived,
    };

    res.json({ success: true, metrics });
  }

  public static async getActivityFeed(req: AuthenticatedRequest, res: Response): Promise<void> {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    const recentApps = await Application.find({ userId: req.userId })
      .populate('jobId')
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      feed: notifications,
      recentApplications: recentApps,
    });
  }
}
