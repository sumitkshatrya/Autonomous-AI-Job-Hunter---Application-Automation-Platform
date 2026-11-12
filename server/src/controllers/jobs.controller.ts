import { Request, Response } from 'express';
import { Job } from '../models/Job';
import { JobDiscoveryService } from '../services/JobDiscoveryService';
import { AutonomousHunterService } from '../services/AutonomousHunterService';
import { JobQuerySchema } from '@autoapply/shared';
import { AuthenticatedRequest } from '../middleware/auth';

const discoveryService = new JobDiscoveryService();
const autopilotService = AutonomousHunterService.getInstance();

export class JobsController {
  public static async listJobs(req: Request, res: Response): Promise<void> {
    const query = JobQuerySchema.parse(req.query);

    const filter: Record<string, any> = { isExpired: false };

    if (query.query) {
      filter.$or = [
        { title: { $regex: query.query, $options: 'i' } },
        { company: { $regex: query.query, $options: 'i' } },
        { skillsRequired: { $regex: query.query, $options: 'i' } },
      ];
    }

    if (query.country) {
      filter.country = { $regex: query.country, $options: 'i' };
    }

    if (query.workplaceType && query.workplaceType !== 'any') {
      filter.workplaceType = query.workplaceType;
    }

    if (query.source) {
      filter.source = query.source;
    }

    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .sort({ discoveredAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit);

    res.json({
      success: true,
      jobs,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  }

  public static async getJobById(req: Request, res: Response): Promise<void> {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    res.json({ success: true, job });
  }

  public static async triggerDiscovery(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await discoveryService.discoverAllJobs();
    res.json({
      success: true,
      message: `Job discovery completed successfully. Discovered: ${result.totalDiscovered}, New: ${result.totalNew}`,
      ...result,
    });
  }

  public static async getAutopilotStatus(_req: Request, res: Response): Promise<void> {
    const status = autopilotService.getStatus();
    res.json({
      success: true,
      autopilot: status,
    });
  }

  public static async triggerAutopilotCycle(_req: Request, res: Response): Promise<void> {
    // Run cycle asynchronously in background so client gets an immediate response
    autopilotService.executeAutonomousCycle().catch(() => {});
    res.json({
      success: true,
      message: 'Zero-Click Autonomous Job Discovery & Application cycle initiated in the background.',
    });
  }

  public static async toggleAutopilot(req: Request, res: Response): Promise<void> {
    const { enabled } = req.body;
    if (enabled) {
      autopilotService.startAutopilotLoop();
    } else {
      autopilotService.stopAutopilotLoop();
    }

    res.json({
      success: true,
      message: `Autopilot background engine ${enabled ? 'started' : 'paused'} successfully.`,
      autopilot: autopilotService.getStatus(),
    });
  }
}
