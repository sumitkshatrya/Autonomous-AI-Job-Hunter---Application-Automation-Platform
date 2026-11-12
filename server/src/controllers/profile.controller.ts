import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { CandidateProfile } from '../models/CandidateProfile';
import { Resume } from '../models/Resume';
import { ResumeIntelligenceService } from '../services/ResumeIntelligenceService';
import { CandidateProfileOnboardingSchema } from '@autoapply/shared';

const resumeService = new ResumeIntelligenceService();

export class ProfileController {
  public static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    let profile = await CandidateProfile.findOne({ userId: req.userId });

    // Fallback: If candidate profile not yet created, but resume exists, auto-provision profile
    if (!profile) {
      const primaryResume = await Resume.findOne({ userId: req.userId }).sort({ createdAt: -1 });
      if (primaryResume?.parsedProfileSnapshot) {
        const snap = primaryResume.parsedProfileSnapshot;
        const completeness = resumeService.calculateCompleteness(snap);
        profile = await CandidateProfile.create({
          userId: req.userId,
          organizationId: req.organizationId,
          fullName: snap.fullName || 'Candidate',
          email: snap.email || '',
          phone: snap.phone || '',
          country: snap.country || 'India',
          currentLocation: snap.currentLocation || '',
          headline: snap.headline || 'Software Professional',
          yearsOfExperience: snap.yearsOfExperience || 0,
          skills: snap.skills || [],
          education: snap.education || [],
          workHistory: snap.workHistory || [],
          projects: snap.projects || [],
          preferences: {
            desiredJobTitles: [snap.headline || 'Software Engineer'],
            desiredCountries: [snap.country || 'India', 'United States'],
            workplaceType: 'remote',
            currency: snap.country === 'India' ? 'INR' : 'USD',
            employmentTypes: ['full_time'],
            noticePeriodDays: 30,
            workAuthorization: [`Authorized to work in ${snap.country || 'India'}`],
            preferredIndustries: [],
          },
          completeness,
          isVerified: true,
        });
      }
    }

    res.json({ success: true, profile: profile || null });
  }

  public static async upsertProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const existing = await CandidateProfile.findOne({ userId: req.userId });

    const payload = {
      ...req.body,
      preferences: req.body.preferences || existing?.preferences || {
        desiredJobTitles: ['Software Engineer'],
        desiredCountries: ['India', 'United States'],
        workplaceType: 'remote',
        currency: 'USD',
        employmentTypes: ['full_time'],
        noticePeriodDays: 30,
        workAuthorization: ['Authorized to work in India'],
        preferredIndustries: [],
      },
    };

    const validated = CandidateProfileOnboardingSchema.parse(payload);
    const completeness = resumeService.calculateCompleteness(validated);

    const profile = await CandidateProfile.findOneAndUpdate(
      { userId: req.userId },
      {
        userId: req.userId,
        organizationId: req.organizationId,
        ...validated,
        completeness,
        isVerified: true,
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Candidate profile updated and verified successfully',
      profile,
    });
  }

  public static async uploadResume(req: AuthenticatedRequest, res: Response): Promise<void> {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, message: 'Please upload a PDF or DOCX resume file' });
      return;
    }

    const rawText = await resumeService.extractTextFromBuffer(file.buffer, file.mimetype);
    const analyzed = await resumeService.analyzeResumeText(rawText);

    // Save resume document without overwriting previous versions
    await Resume.updateMany({ userId: req.userId }, { isPrimary: false });

    const resumeDoc = await Resume.create({
      userId: req.userId,
      organizationId: req.organizationId,
      originalFileName: file.originalname,
      storageKey: `resumes/${req.userId}/${Date.now()}-${file.originalname}`,
      mimeType: file.mimetype,
      fileSizeBytes: file.size,
      rawExtractedText: rawText,
      parsedProfileSnapshot: analyzed,
      isPrimary: true,
    });

    // Automatically synchronize and provision CandidateProfile so the user can immediately view and edit facts
    const existing = await CandidateProfile.findOne({ userId: req.userId });
    const profileDoc = await CandidateProfile.findOneAndUpdate(
      { userId: req.userId },
      {
        userId: req.userId,
        organizationId: req.organizationId,
        fullName: analyzed.fullName,
        email: analyzed.email,
        phone: analyzed.phone,
        country: analyzed.country,
        currentLocation: analyzed.currentLocation,
        headline: analyzed.headline,
        yearsOfExperience: analyzed.yearsOfExperience,
        skills: analyzed.skills,
        education: analyzed.education,
        workHistory: analyzed.workHistory,
        projects: analyzed.projects,
        preferences: existing?.preferences || {
          desiredJobTitles: [analyzed.headline || 'Software Engineer'],
          desiredCountries: [analyzed.country || 'India', 'United States'],
          workplaceType: 'remote',
          currency: analyzed.country === 'India' ? 'INR' : 'USD',
          employmentTypes: ['full_time'],
          noticePeriodDays: 30,
          workAuthorization: [`Authorized to work in ${analyzed.country || 'India'}`],
          preferredIndustries: [],
        },
        completeness: analyzed.completeness,
        isVerified: true,
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Resume parsed and candidate profile verified successfully',
      resumeId: resumeDoc._id,
      extractedProfile: analyzed,
      profile: profileDoc,
    });
  }
}
