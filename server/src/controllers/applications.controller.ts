import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Application } from '../models/Application';
import { Job } from '../models/Job';
import { CandidateProfile } from '../models/CandidateProfile';
import { ApplicationGenerationService } from '../services/ApplicationGenerationService';
import { ApplicationSubmissionService } from '../services/ApplicationSubmissionService';
import { ApplicationStatus } from '@autoapply/shared';

const generationService = new ApplicationGenerationService();
const submissionService = new ApplicationSubmissionService();

export class ApplicationsController {
  public static async listApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
    const status = req.query.status as ApplicationStatus;
    const filter: Record<string, any> = { userId: req.userId };

    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('jobId')
      .populate('tailoredResumeId')
      .sort({ updatedAt: -1 });

    res.json({ success: true, applications });
  }

  public static async getApplicationById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.userId,
    })
      .populate('jobId')
      .populate('tailoredResumeId');

    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    res.json({ success: true, application });
  }

  public static async generateApplication(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { jobId, submissionMethod } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ success: false, message: 'Job posting not found' });
      return;
    }

    const profile = await CandidateProfile.findOne({ userId: req.userId });
    if (!profile) {
      res.status(400).json({ success: false, message: 'Please complete your candidate profile first' });
      return;
    }

    const app = await generationService.generateApplicationPackage(
      profile,
      job,
      submissionMethod || 'greenhouse_api'
    );

    res.json({
      success: true,
      message: 'Tailored application package synthesized successfully',
      application: app,
    });
  }

  public static async submitApplication(req: AuthenticatedRequest, res: Response): Promise<void> {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const submitted = await submissionService.submitApplication(application._id.toString());

    res.json({
      success: true,
      message:
        submitted.status === 'applied'
          ? 'Application submitted successfully to target ATS gateway!'
          : `Submission ended with status: ${submitted.status}`,
      application: submitted,
    });
  }

  public static async updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { status, notes } = req.body;

    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    application.status = status;
    application.timeline.push({
      status,
      changedAt: new Date(),
      notes: notes || `User updated status to ${status}`,
    });

    await application.save();

    res.json({ success: true, message: 'Status updated', application });
  }
}
