import { config } from '../config';
import { ICandidateProfileDocument } from '../models/CandidateProfile';
import { IJobDocument } from '../models/Job';
import { JobMatch, IJobMatchDocument } from '../models/JobMatch';
import { AutomationSettings, IAutomationSettingsDocument } from '../models/AutomationSettings';
import {
  IJobMatchResult,
  MatchRecommendation,
  IMatchBreakdown,
  IScoringWeights,
  DEFAULT_SCORING_WEIGHTS,
  DEFAULT_MATCH_THRESHOLD,
  DEFAULT_STRONG_MATCH_THRESHOLD,
} from '@autoapply/shared';
import { AIService } from './AIService';
import { logger } from '../utils/logger';

export class JobMatchingService {
  private aiService: AIService;

  constructor() {
    this.aiService = AIService.getInstance();
  }

  /**
   * Evaluates candidate profile against a job posting, computing weighted scores and vector similarity
   */
  public async evaluateMatch(
    profile: ICandidateProfileDocument,
    job: IJobDocument,
    settings?: IAutomationSettingsDocument | null
  ): Promise<IJobMatchResult> {
    let weights: IScoringWeights = settings?.scoringWeights || DEFAULT_SCORING_WEIGHTS;
    const totalWeightSum =
      (weights.skills || 0) +
      (weights.experience || 0) +
      (weights.jobTitle || 0) +
      (weights.location || 0) +
      (weights.seniority || 0) +
      (weights.keywords || 0);
    if (totalWeightSum < 95 || totalWeightSum > 105) {
      weights = DEFAULT_SCORING_WEIGHTS;
    }
    const threshold = settings?.autoApplyThreshold || DEFAULT_MATCH_THRESHOLD;

    // 1. Mandatory Eligibility Check (Location & Work Authorization)
    const { isEligible, eligibilityReason } = this.checkEligibility(profile, job);

    // 2. Comprehensive Skills Match (35%)
    const candidateSkills = profile.skills.map((s) => s.name.toLowerCase());
    const fullJobText = `${job.title} ${job.description} ${(job.skillsRequired || []).join(' ')} ${((job as any).techStack || []).join(' ')}`.toLowerCase();
    const jobSpecifiedSkills = (job.skillsRequired || []).map((s) => s.toLowerCase());

    const matchedSkillsRaw: string[] = [];
    const missingSkillsRaw: string[] = [];

    // Match candidate skills found in job text
    for (const skill of candidateSkills) {
      const isPresent =
        skill.length <= 2
          ? new RegExp(`\\b${skill}\\b`, 'i').test(fullJobText)
          : fullJobText.includes(skill);
      if (isPresent && !matchedSkillsRaw.includes(skill)) {
        matchedSkillsRaw.push(skill);
      }
    }

    // Evaluate explicitly required job skills
    for (const reqSkill of jobSpecifiedSkills) {
      const isMatched = candidateSkills.some(
        (cand) => cand.includes(reqSkill) || reqSkill.includes(cand)
      );
      if (isMatched) {
        if (!matchedSkillsRaw.includes(reqSkill)) matchedSkillsRaw.push(reqSkill);
      } else {
        if (!missingSkillsRaw.includes(reqSkill)) missingSkillsRaw.push(reqSkill);
      }
    }

    // Calculate skill match ratio
    let skillMatchRatio = 0.2;
    if (matchedSkillsRaw.length >= 4) {
      skillMatchRatio = 1.0;
    } else if (matchedSkillsRaw.length === 3) {
      skillMatchRatio = 0.85;
    } else if (matchedSkillsRaw.length === 2) {
      skillMatchRatio = 0.7;
    } else if (matchedSkillsRaw.length === 1) {
      skillMatchRatio = 0.5;
    } else if (jobSpecifiedSkills.length > 0) {
      skillMatchRatio = Math.max(
        0.1,
        (jobSpecifiedSkills.length - missingSkillsRaw.length) / jobSpecifiedSkills.length
      );
    }
    const skillsScore = Math.round(skillMatchRatio * weights.skills);

    // 3. Experience Match (25%)
    const experienceScore = this.calculateExperienceScore(
      profile.yearsOfExperience,
      job.experienceLevel,
      weights.experience
    );

    // 4. Job Title Match (15%)
    const jobTitleScore = this.calculateTitleScore(
      profile.headline,
      profile.preferences.desiredJobTitles,
      job.title,
      weights.jobTitle
    );

    // 5. Location / Workplace Type Match (10%)
    const locationScore = this.calculateLocationScore(profile, job, weights.location);

    // 6. Seniority Match (10%)
    const seniorityScore = this.calculateSeniorityScore(
      profile.yearsOfExperience,
      job.experienceLevel,
      weights.seniority
    );

    // 7. Keywords / Tech Stack Match (5%)
    const keywordsScore = this.calculateKeywordsScore(profile, job, weights.keywords);

    // Combined Raw Score
    let totalScore =
      skillsScore +
      experienceScore +
      jobTitleScore +
      locationScore +
      seniorityScore +
      keywordsScore;

    // Optional vector embedding similarity bonus/adjustment
    const vectorSimilarity = await this.computeVectorSimilarity(profile, job);
    if (vectorSimilarity !== undefined) {
      // blend 80% rule-based + 20% semantic embedding similarity
      totalScore = Math.round(totalScore * 0.8 + vectorSimilarity * 100 * 0.2);
    }

    // Clamp score
    totalScore = Math.max(0, Math.min(100, totalScore));

    // Recommendation tier
    let recommendation: MatchRecommendation = 'not_recommended';
    if (!isEligible || totalScore < 50) {
      recommendation = 'not_recommended';
    } else if (totalScore >= DEFAULT_STRONG_MATCH_THRESHOLD) {
      recommendation = 'strong_match';
    } else if (totalScore >= threshold) {
      recommendation = 'moderate_match';
    } else {
      recommendation = 'weak_match';
    }

    const breakdown: IMatchBreakdown = {
      skillsScore,
      experienceScore,
      jobTitleScore,
      locationScore,
      seniorityScore,
      keywordsScore,
    };

    const reasoning = this.generateReasoning({
      totalScore,
      recommendation,
      isEligible,
      eligibilityReason,
      matchedCount: matchedSkillsRaw.length,
      totalRequired: Math.max(matchedSkillsRaw.length, jobSpecifiedSkills.length),
      jobTitle: job.title,
      company: job.company,
    });

    const result: IJobMatchResult = {
      jobId: job._id.toString(),
      userId: profile.userId.toString(),
      matchScore: totalScore,
      recommendation,
      breakdown,
      matchedSkills: matchedSkillsRaw,
      missingSkills: missingSkillsRaw,
      eligibility: isEligible,
      eligibilityReason: isEligible ? undefined : eligibilityReason,
      reasoning,
      vectorSimilarity,
      matchedAt: new Date().toISOString(),
    };

    // Upsert into Mongo
    await JobMatch.findOneAndUpdate(
      { userId: profile.userId, jobId: job._id },
      {
        userId: profile.userId,
        organizationId: profile.organizationId,
        jobId: job._id,
        matchScore: totalScore,
        recommendation,
        breakdown,
        matchedSkills: matchedSkillsRaw,
        missingSkills: missingSkillsRaw,
        eligibility: isEligible,
        eligibilityReason: isEligible ? undefined : eligibilityReason,
        reasoning,
        vectorSimilarity,
        matchedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return result;
  }

  // --- Sub-Scorers & Helpers ---

  private checkEligibility(
    profile: ICandidateProfileDocument,
    job: IJobDocument
  ): { isEligible: boolean; eligibilityReason?: string } {
    const jTitle = job.title.toLowerCase();

    // Check domain role alignment: candidate is software engineer / developer
    const candidateIsTech =
      (profile.preferences?.desiredJobTitles || []).some((t) =>
        /developer|engineer|software|full\s*stack|frontend|backend|mern|react|node|tech/i.test(t)
      ) || /developer|engineer|software|full\s*stack|mern/i.test(profile.headline);

    if (candidateIsTech) {
      // Must be software/web/fullstack/AI/tech role
      const isTechJob =
        /developer|engineer|software|full\s*stack|frontend|backend|mern|react|node|javascript|typescript|web|tech|programmer|architect|qa|devops|cloud|ai\b|data/i.test(
          jTitle
        );
      if (!isTechJob) {
        return {
          isEligible: false,
          eligibilityReason: `Role '${job.title}' is outside candidate target software engineering domain`,
        };
      }

      // Explicitly reject non-software engineering disciplines (Mechanical, Civil, Chemical, Hardware, etc.)
      const isNonSoftwareDiscipline =
        /\b(mechanical|civil|chemical|structural|electrical|petroleum|aerospace|hardware|hvac|cfd|piping|metallurg|mining)\b/i.test(
          jTitle
        );
      if (isNonSoftwareDiscipline) {
        return {
          isEligible: false,
          eligibilityReason: `Role '${job.title}' is a physical/mechanical engineering discipline, outside candidate software engineering scope`,
        };
      }

      // Explicitly reject non-development business/sales/marketing roles
      const isSalesOrBusiness =
        /\b(sales engineer|solutions architect - pre-sales|solutions consultant|account executive|recruiter|sales manager|operations expert)\b/i.test(
          jTitle
        );
      if (isSalesOrBusiness) {
        return {
          isEligible: false,
          eligibilityReason: `Role '${job.title}' is a sales/pre-sales role outside candidate development scope`,
        };
      }
    }

    // Strict Seniority Filter for early career candidates (<= 2 years experience)
    if (profile.yearsOfExperience <= 2) {
      const isSeniorExecutive =
        /\b(lead|principal|staff|director|head of|vp|architect|distinguished|engineering manager)\b/i.test(jTitle) ||
        ['lead', 'executive'].includes(job.experienceLevel);
      if (isSeniorExecutive) {
        return {
          isEligible: false,
          eligibilityReason: `Candidate experience (${profile.yearsOfExperience} YOE) is not aligned with Staff/Lead/Principal level role '${job.title}'`,
        };
      }
    }

    // Workplace type eligibility
    if (
      job.workplaceType === 'onsite' &&
      profile.preferences.workplaceType === 'remote'
    ) {
      return {
        isEligible: false,
        eligibilityReason: 'Job is strictly On-Site while candidate preference is 100% Remote',
      };
    }

    // Work authorization heuristic
    if (
      job.country &&
      job.country !== 'Worldwide' &&
      profile.country !== job.country &&
      !profile.preferences.desiredCountries.includes(job.country) &&
      job.workplaceType !== 'remote'
    ) {
      return {
        isEligible: false,
        eligibilityReason: `Work location in ${job.country} is outside candidate authorized countries`,
      };
    }

    return { isEligible: true };
  }

  private calculateExperienceScore(
    candidateYears: number,
    level: string,
    maxWeight: number
  ): number {
    let targetYears = 2;
    switch (level) {
      case 'fresher':
      case 'internship':
        targetYears = 0;
        break;
      case 'junior':
        targetYears = 1;
        break;
      case 'mid':
        targetYears = 2;
        break;
      case 'senior':
        targetYears = 5;
        break;
      case 'lead':
      case 'executive':
        targetYears = 8;
        break;
    }

    if (candidateYears >= targetYears) {
      return maxWeight;
    }
    const ratio = Math.max(0.1, candidateYears / Math.max(1, targetYears));
    return Math.round(ratio * maxWeight);
  }

  private calculateTitleScore(
    headline: string,
    desiredTitles: string[],
    jobTitle: string,
    maxWeight: number
  ): number {
    const jTitle = jobTitle.toLowerCase();

    // 1. Direct or partial match with candidate desired titles
    const matchesDesired = (desiredTitles || []).some((t) => {
      const lower = t.toLowerCase();
      return jTitle.includes(lower) || lower.includes(jTitle);
    });
    if (matchesDesired) return maxWeight;

    // 2. High-value technical role alignment (full stack, mern, frontend, backend, react, node, software engineer)
    const coreTechRoles = [
      'full stack',
      'fullstack',
      'mern',
      'frontend',
      'backend',
      'software engineer',
      'web developer',
      'react',
      'node',
    ];
    const matchesCoreTech = coreTechRoles.some((r) => jTitle.includes(r));
    if (matchesCoreTech) return Math.round(maxWeight * 0.9);

    // 3. Match with words in headline
    const matchesHeadline = (headline || '')
      .toLowerCase()
      .split(' ')
      .some((word) => word.length > 3 && jTitle.includes(word));
    if (matchesHeadline) return Math.round(maxWeight * 0.75);

    // 4. General developer / engineer title match
    if (/developer|engineer|software/i.test(jTitle)) {
      return Math.round(maxWeight * 0.5);
    }

    return 0; // Completely non-matching titles get 0
  }

  private calculateLocationScore(
    profile: ICandidateProfileDocument,
    job: IJobDocument,
    maxWeight: number
  ): number {
    if (job.workplaceType === 'remote') return maxWeight;
    if (
      job.location.toLowerCase().includes(profile.currentLocation.toLowerCase()) ||
      job.country.toLowerCase() === profile.country.toLowerCase()
    ) {
      return maxWeight;
    }
    return Math.round(maxWeight * 0.5);
  }

  private calculateSeniorityScore(
    years: number,
    level: string,
    maxWeight: number
  ): number {
    if (level === 'senior' && years >= 5) return maxWeight;
    if (level === 'senior' && years < 3) return Math.round(maxWeight * 0.2);
    if (level === 'mid' && years >= 2) return maxWeight;
    if (level === 'mid' && years < 2) return Math.round(maxWeight * 0.7);
    if ((level === 'junior' || level === 'fresher' || level === 'internship') && years <= 3) return maxWeight;
    return Math.round(maxWeight * 0.5);
  }

  private calculateKeywordsScore(
    profile: ICandidateProfileDocument,
    job: IJobDocument,
    maxWeight: number
  ): number {
    const desc = job.description.toLowerCase();
    let hitCount = 0;
    for (const skill of profile.skills) {
      if (desc.includes(skill.name.toLowerCase())) {
        hitCount++;
      }
    }
    const ratio = Math.min(1, hitCount / 5);
    return Math.round(ratio * maxWeight);
  }

  private async computeVectorSimilarity(
    profile: ICandidateProfileDocument,
    job: IJobDocument
  ): Promise<number | undefined> {
    try {
      if (!job.embedding || job.embedding.length === 0) {
        // Generate embedding for job summary
        const jobText = `${job.title} at ${job.company}. Requirements: ${job.skillsRequired.join(', ')}. ${job.description.slice(0, 1000)}`;
        const emb = await this.aiService.generateEmbedding(jobText);
        if (emb) {
          job.embedding = emb;
          await job.save();
        }
      }

      if (!profile.embedding || profile.embedding.length === 0) {
        const profileText = `${profile.headline}. Skills: ${profile.skills.map((s) => s.name).join(', ')}. Summary: ${profile.workHistory.map((w) => w.role + ' ' + w.company).join('; ')}`;
        const emb = await this.aiService.generateEmbedding(profileText);
        if (emb) {
          profile.embedding = emb;
          await profile.save();
        }
      }

      if (profile.embedding && job.embedding && profile.embedding.length === job.embedding.length) {
        return this.cosineSimilarity(profile.embedding, job.embedding);
      }
      return undefined;
    } catch (err: any) {
      logger.debug('Vector embedding similarity skipped:', err.message);
      return undefined;
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private generateReasoning(ctx: {
    totalScore: number;
    recommendation: MatchRecommendation;
    isEligible: boolean;
    eligibilityReason?: string;
    matchedCount: number;
    totalRequired: number;
    jobTitle: string;
    company: string;
  }): string {
    if (!ctx.isEligible) {
      return `Ineligible: ${ctx.eligibilityReason}`;
    }

    if (ctx.recommendation === 'strong_match') {
      return `Exceptional alignment with ${ctx.jobTitle} at ${ctx.company}. Candidate demonstrates ${ctx.matchedCount} of ${ctx.totalRequired} primary core competencies with matching seniority, title expectation, and workplace compatibility.`;
    }

    if (ctx.recommendation === 'moderate_match') {
      return `Solid fit for ${ctx.jobTitle} at ${ctx.company}. Candidate fulfills primary requirements with satisfactory skills overlap (${ctx.matchedCount}/${ctx.totalRequired}).`;
    }

    return `Partial alignment for ${ctx.jobTitle} at ${ctx.company}. Several core requirements or keywords are unfulfilled in candidate background.`;
  }
}
