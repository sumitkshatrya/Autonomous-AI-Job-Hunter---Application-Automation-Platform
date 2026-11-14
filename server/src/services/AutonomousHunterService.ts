import { JobDiscoveryService } from './JobDiscoveryService';
import { JobMatchingService } from './JobMatchingService';
import { ApplicationGenerationService } from './ApplicationGenerationService';
import { ApplicationSubmissionService } from './ApplicationSubmissionService';
import { CandidateProfile } from '../models/CandidateProfile';
import { AutomationSettings } from '../models/AutomationSettings';
import { Job, IJobDocument } from '../models/Job';
import { JobMatch } from '../models/JobMatch';
import { Application } from '../models/Application';
import { Notification } from '../models/Notification';
import { EmailNotificationService } from './EmailNotificationService';
import { WhatsAppBusinessService } from './WhatsAppBusinessService';
import { logger } from '../utils/logger';

export interface AutopilotStats {
  isRunning: boolean;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  totalCyclesExecuted: number;
  totalAutonomousApplicationsSubmitted: number;
}

export class AutonomousHunterService {
  private static instance: AutonomousHunterService;
  private discoveryService: JobDiscoveryService;
  private matchingService: JobMatchingService;
  private generationService: ApplicationGenerationService;
  private submissionService: ApplicationSubmissionService;
  private whatsAppService: WhatsAppBusinessService;

  private isRunning: boolean = false;
  private timer: NodeJS.Timeout | null = null;
  private intervalMs: number = 10 * 60 * 1000; // 10 minutes loop
  private stats: AutopilotStats = {
    isRunning: false,
    lastRunAt: null,
    nextRunAt: null,
    totalCyclesExecuted: 0,
    totalAutonomousApplicationsSubmitted: 0,
  };

  private constructor() {
    this.discoveryService = new JobDiscoveryService();
    this.matchingService = new JobMatchingService();
    this.generationService = new ApplicationGenerationService();
    this.submissionService = new ApplicationSubmissionService();
    this.whatsAppService = new WhatsAppBusinessService();
  }

  public static getInstance(): AutonomousHunterService {
    if (!AutonomousHunterService.instance) {
      AutonomousHunterService.instance = new AutonomousHunterService();
    }
    return AutonomousHunterService.instance;
  }

  /**
   * Starts the 100% autonomous background autopilot loop
   */
  public startAutopilotLoop(customIntervalMs?: number): void {
    if (this.isRunning) {
      logger.info('Autonomous Job Hunter Autopilot is already active and running in the background.');
      return;
    }

    if (customIntervalMs) {
      this.intervalMs = customIntervalMs;
    }

    this.isRunning = true;
    this.stats.isRunning = true;
    logger.info(`[AUTOPILOT] 🚀 Starting 24/7 Autonomous Job Hunter & Application Engine (Interval: ${this.intervalMs / 1000}s)`);

    // Execute immediately on startup
    this.executeAutonomousCycle().catch((err) => {
      logger.warn(`Initial autopilot cycle notice: ${err.message}`);
    });

    // Schedule recurring autonomous cycle
    this.timer = setInterval(() => {
      this.executeAutonomousCycle().catch((err) => {
        logger.error(`Autopilot background execution error: ${err.message}`);
      });
    }, this.intervalMs);

    this.stats.nextRunAt = new Date(Date.now() + this.intervalMs);
  }

  /**
   * Stops the background autopilot loop
   */
  public stopAutopilotLoop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    this.stats.isRunning = false;
    this.stats.nextRunAt = null;
    logger.info('[AUTOPILOT] Autonomous Job Hunter loop paused.');
  }

  /**
   * Returns current live status and metrics of the autopilot engine
   */
  public getStatus(): AutopilotStats {
    return { ...this.stats };
  }

  /**
   * Executes one complete autonomous job hunting & application cycle
   */
  public async executeAutonomousCycle(): Promise<{
    discovered: number;
    evaluated: number;
    matched: number;
    applied: number;
  }> {
    logger.info('[AUTOPILOT] 🔍 Initiating autonomous job discovery & zero-click application cycle...');
    this.stats.lastRunAt = new Date();
    this.stats.totalCyclesExecuted += 1;

    let discoveredCount = 0;
    let evaluatedCount = 0;
    let matchedCount = 0;
    let appliedCount = 0;

    try {
      // 1. Autonomous Job Discovery across all global and regional platforms
      const discoveryResult = await this.discoveryService.discoverAllJobs();
      discoveredCount = discoveryResult.totalDiscovered || 0;
      logger.info(`[AUTOPILOT] Discovered ${discoveredCount} active job postings across connected platforms.`);

      // 2. Fetch all candidates with active profiles
      const candidateProfiles = await CandidateProfile.find();
      if (candidateProfiles.length === 0) {
        logger.info('[AUTOPILOT] No candidate profiles configured yet. Waiting for candidate onboarding.');
        this.stats.nextRunAt = new Date(Date.now() + this.intervalMs);
        return { discovered: discoveredCount, evaluated: 0, matched: 0, applied: 0 };
      }

      // 3. Retrieve active jobs prioritized for technical software engineering domain
      const activeJobs = await Job.find({
        isExpired: false,
        $or: [
          {
            title: {
              $regex:
                /developer|engineer|software|full\s*stack|frontend|backend|mern|react|node|javascript|typescript|web|programmer|architect|cloud|ai\b/i,
            },
          },
          {
            skillsRequired: {
              $in: [
                'react',
                'node.js',
                'javascript',
                'typescript',
                'mongodb',
                'full stack',
                'frontend',
                'backend',
                'next.js',
                'express',
                'git',
              ],
            },
          },
        ],
      })
        .sort({ discoveredAt: -1 })
        .limit(150);

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // 4. Autonomous Matching & Application for each candidate
      for (const profile of candidateProfiles) {
        try {
          // Retrieve candidate automation settings
          let settings = await AutomationSettings.findOne({ userId: profile.userId });
          if (!settings) {
            settings = await AutomationSettings.create({
              userId: profile.userId,
              organizationId: profile.organizationId,
              enabled: true,
              autoApplyThreshold: 70, // Apply to 70%+ matches automatically
              dailyApplicationLimit: 50,
              requireApprovalBeforeSubmit: false, // ZERO CLICK by default
            });
          }

          if (!settings.enabled) {
            logger.info(`[AUTOPILOT] Automation disabled by candidate ${profile.fullName}. Skipping.`);
            continue;
          }

          // Count today's applications submitted to respect safety limits
          const todayAppliedCount = await Application.countDocuments({
            userId: profile.userId,
            status: 'applied',
            createdAt: { $gte: startOfDay },
          });

          const dailyLimit = settings.dailyApplicationLimit || 50;
          if (todayAppliedCount >= dailyLimit) {
            logger.warn(
              `[AUTOPILOT] Candidate ${profile.fullName} has reached the daily limit of ${dailyLimit} applications today. Safe pacing maintained.`
            );
            continue;
          }

          let candidateRemainingAllowance = dailyLimit - todayAppliedCount;

          // Find jobs already applied to or currently in-flight
          const existingApplications = await Application.find({ userId: profile.userId }).select('jobId status');
          const appliedJobIdSet = new Set(existingApplications.map((app) => app.jobId.toString()));

          for (const job of activeJobs) {
            if (candidateRemainingAllowance <= 0) break;
            if (appliedJobIdSet.has(job._id.toString())) continue;

            evaluatedCount++;

            // Evaluate match
            const matchResult = await this.matchingService.evaluateMatch(profile, job, settings);

            // Record JobMatch in MongoDB
            await JobMatch.findOneAndUpdate(
              { userId: profile.userId, jobId: job._id },
              {
                userId: profile.userId,
                organizationId: profile.organizationId,
                jobId: job._id,
                matchScore: matchResult.matchScore,
                breakdown: matchResult.breakdown,
                recommendation: matchResult.recommendation,
                eligibility: matchResult.eligibility,
                eligibilityReason: matchResult.eligibilityReason,
                matchedSkills: matchResult.matchedSkills,
                missingSkills: matchResult.missingSkills,
                reasoning: matchResult.reasoning,
                matchedAt: new Date(matchResult.matchedAt),
              },
              { upsert: true, new: true }
            );

            // Check if score meets auto-apply threshold
            const threshold = settings.autoApplyThreshold || 70;
            if (matchResult.eligibility && matchResult.matchScore >= threshold) {
              matchedCount++;

              if (!settings.requireApprovalBeforeSubmit) {
                logger.info(
                  `[AUTOPILOT] 🎯 High alignment detected (${matchResult.matchScore}% >= ${threshold}%). Submitting application for ${profile.fullName} to ${job.title} at ${job.company}...`
                );

                // Determine submission method
                let submissionMethod: any = 'playwright_browser';
                if (job.source === 'greenhouse') submissionMethod = 'greenhouse_api';
                else if (job.source === 'lever') submissionMethod = 'lever_api';
                else submissionMethod = 'playwright_browser';

                // Step A: Generate tailored application package
                const app = await this.generationService.generateApplicationPackage(
                  profile,
                  job,
                  submissionMethod
                );
                app.notes = 'autopilot';
                await app.save();

                // Step B: Submit application automatically
                const submittedApp = await this.submissionService.submitApplication(app._id.toString());

                if (submittedApp.status === 'applied') {
                  appliedCount++;
                  this.stats.totalAutonomousApplicationsSubmitted += 1;
                  candidateRemainingAllowance--;
                  appliedJobIdSet.add(job._id.toString());

                  const confirmation = submittedApp.submissionResult?.confirmationId || `APP-${Date.now()}`;
                  logger.info(
                    `[AUTOPILOT] ✅ SUCCESS: Autonomously applied ${profile.fullName} to ${job.title} at ${job.company}. Confirmation: ${confirmation}`
                  );

                  // Create in-app notification
                  await Notification.create({
                    userId: profile.userId,
                    organizationId: profile.organizationId,
                    title: `🚀 Autonomously Applied to ${job.company}!`,
                    message: `Applied to ${job.title} with a ${matchResult.matchScore}% profile match. Reference ID: ${confirmation}`,
                    type: 'success',
                    link: '/applications',
                    metadata: {
                      jobId: job._id,
                      company: job.company,
                      title: job.title,
                      score: matchResult.matchScore,
                      confirmationId: confirmation,
                    },
                  });

                  // Dispatch instant email notification to candidate's Gmail inbox
                  if (settings.sendEmailAlerts !== false) {
                    const recipientEmail = settings.notificationEmail || profile.email || 'skumar21082001@gmail.com';
                    try {
                      await EmailNotificationService.getInstance().sendApplicationNotification({
                        recipientEmail,
                        candidateName: profile.fullName || 'Candidate',
                        jobTitle: job.title,
                        company: job.company,
                        portal: job.source,
                        location: job.location,
                        matchScore: matchResult.matchScore,
                        confirmationId: confirmation,
                        applyUrl: job.applicationUrl,
                        appliedAt: new Date(),
                        companyLinkedinUrl: job.companyLinkedinUrl,
                        contactNumber: job.contactPhone || job.companyPhone,
                        companyWebsite: job.companyWebsite,
                        contactEmail: job.contactEmail,
                      });
                    } catch (mailErr: any) {
                      logger.warn(`Email notification dispatch notice for ${recipientEmail}: ${mailErr.message}`);
                    }
                  }

                  // Dispatch instant WhatsApp notification to candidate's mobile
                  if (settings.sendWhatsAppAlerts !== false) {
                    const recipientPhone = profile.phone || '9528865099';
                    try {
                      await this.whatsAppService.sendTemplateMessage(profile.userId.toString(), {
                        recipientPhone,
                        templateName: 'application_submitted_alert',
                        parameters: [
                          { type: 'text', text: profile.fullName || 'Candidate' },
                          { type: 'text', text: job.title },
                          { type: 'text', text: job.company },
                          { type: 'text', text: `${matchResult.matchScore}%` },
                          { type: 'text', text: confirmation },
                        ],
                      });
                    } catch (waErr: any) {
                      logger.warn(`WhatsApp notification dispatch notice for ${recipientPhone}: ${waErr.message}`);
                    }
                  }
                }
              }
            }
          }
        } catch (profileErr: any) {
          logger.error(`Error processing autonomous cycle for candidate ${profile.fullName}:`, profileErr);
        }
      }
    } catch (cycleErr: any) {
      logger.error('Error during autonomous hunting cycle execution:', cycleErr);
    }

    this.stats.nextRunAt = new Date(Date.now() + this.intervalMs);
    logger.info(
      `[AUTOPILOT] 🏁 Cycle completed. Discovered: ${discoveredCount}, Evaluated: ${evaluatedCount}, Qualified Matches: ${matchedCount}, Autonomously Applied: ${appliedCount}`
    );

    return {
      discovered: discoveredCount,
      evaluated: evaluatedCount,
      matched: matchedCount,
      applied: appliedCount,
    };
  }
}
