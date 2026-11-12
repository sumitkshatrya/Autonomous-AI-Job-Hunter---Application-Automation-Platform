import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { CandidateProfile } from '../models/CandidateProfile';
import { Job } from '../models/Job';
import { JobMatch } from '../models/JobMatch';
import { AutomationSettings } from '../models/AutomationSettings';
import { JobMatchingService } from '../services/JobMatchingService';

const matchingService = new JobMatchingService();

export class MatchingController {
  public static async getRecommendations(req: AuthenticatedRequest, res: Response): Promise<void> {
    const minScore = req.query.minScore ? parseInt(req.query.minScore as string, 10) : 50;
    const recommendationType = req.query.recommendation as string;

    const filter: Record<string, any> = {
      userId: req.userId,
      isDismissed: false,
      matchScore: { $gte: minScore },
    };

    if (recommendationType) {
      filter.recommendation = recommendationType;
    }

    const matches = await JobMatch.find(filter)
      .populate('jobId')
      .sort({ matchScore: -1 })
      .limit(50);

    res.json({
      success: true,
      matches,
    });
  }

  public static async triggerMatching(req: AuthenticatedRequest, res: Response): Promise<void> {
    const profile = await CandidateProfile.findOne({ userId: req.userId });
    if (!profile) {
      res.status(400).json({ success: false, message: 'Please complete your candidate profile before matching.' });
      return;
    }

    const settings = await AutomationSettings.findOne({ userId: req.userId });
    const availableJobs = await Job.find({ isExpired: false }).limit(50);

    let matchCount = 0;
    let strongMatchCount = 0;

    for (const job of availableJobs) {
      const match = await matchingService.evaluateMatch(profile, job, settings);
      matchCount++;
      if (match.recommendation === 'strong_match') {
        strongMatchCount++;
      }
    }

    res.json({
      success: true,
      message: `Evaluated ${matchCount} opportunities. Found ${strongMatchCount} strong matches.`,
      evaluatedJobs: matchCount,
      strongMatches: strongMatchCount,
    });
  }

  public static async dismissMatch(req: AuthenticatedRequest, res: Response): Promise<void> {
    const match = await JobMatch.findOneAndUpdate(
      { userId: req.userId, jobId: req.params.jobId },
      { isDismissed: true },
      { new: true }
    );

    res.json({ success: true, message: 'Match dismissed', match });
  }
}
