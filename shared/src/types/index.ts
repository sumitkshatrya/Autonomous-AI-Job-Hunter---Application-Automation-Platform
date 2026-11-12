export type UserRole = 'individual' | 'saas_customer' | 'admin' | 'organization_member';

export type SubscriptionTier = 'starter' | 'pro' | 'enterprise' | 'custom';

export type WorkplaceType = 'remote' | 'hybrid' | 'onsite' | 'any';

export type EmploymentType = 'full_time' | 'contract' | 'part_time' | 'internship';

export type ExperienceLevel = 'fresher' | 'internship' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface ISkill {
  name: string;
  category?: string;
  yearsOfExperience?: number;
  level?: SkillLevel;
}

export interface IWorkExperience {
  id?: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
  technologiesUsed: string[];
}

export interface IEducation {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  grade?: string;
}

export interface IProject {
  id?: string;
  name: string;
  description: string;
  role?: string;
  liveUrl?: string;
  repoUrl?: string;
  technologiesUsed: string[];
}

export interface ICandidatePreferences {
  desiredJobTitles: string[];
  desiredCountries: string[];
  workplaceType: WorkplaceType;
  minSalary?: number;
  maxSalary?: number;
  currency: string;
  employmentTypes: EmploymentType[];
  noticePeriodDays: number;
  workAuthorization: string[]; // e.g. ["US Citizen", "Green Card", "Sponsorship Required", "EU Citizen"]
  preferredIndustries: string[];
}

export interface IProfileCompleteness {
  score: number; // 0 - 100
  missingFields: string[];
  suggestions: string[];
}

export interface ICandidateProfile {
  userId: string;
  organizationId?: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  currentLocation: string;
  headline: string;
  yearsOfExperience: number;
  skills: ISkill[];
  education: IEducation[];
  workHistory: IWorkExperience[];
  projects: IProject[];
  preferences: ICandidatePreferences;
  completeness: IProfileCompleteness;
  isVerified: boolean;
  embedding?: number[];
  createdAt: string;
  updatedAt: string;
}

export type JobSource =
  | 'greenhouse'
  | 'lever'
  | 'remotive'
  | 'linkedin'
  | 'wellfound'
  | 'naukri'
  | 'internshala'
  | 'remotehunter'
  | 'instahyre'
  | 'indeed'
  | 'workindia'
  | 'ycombinator'
  | 'ziprecruiter'
  | 'glassdoor'
  | 'foundit'
  | 'cuvette'
  | 'hirist'
  | 'remoteco'
  | 'weworkremotely'
  | 'arbeitnow'
  | 'jobicy'
  | 'remoteok'
  | 'career_page'
  | 'manual'
  | 'licensed_api';

export interface INormalizedJob {
  id?: string;
  sourceId: string;
  source: JobSource;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  country: string;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  description: string;
  requirements: string[];
  skillsRequired: string[];
  benefits?: string[];
  applicationUrl: string;
  duplicateHash: string;
  isExpired: boolean;
  discoveredAt: string;
  expiresAt?: string;
  rawData?: Record<string, any>;
  embedding?: number[];
}

export type MatchRecommendation =
  | 'strong_match'
  | 'moderate_match'
  | 'weak_match'
  | 'not_recommended';

export interface IMatchBreakdown {
  skillsScore: number;      // 0-35 by default
  experienceScore: number;  // 0-25 by default
  jobTitleScore: number;    // 0-15 by default
  locationScore: number;    // 0-10 by default
  seniorityScore: number;   // 0-10 by default
  keywordsScore: number;    // 0-5 by default
}

export interface IScoringWeights {
  skills: number;     // 35
  experience: number; // 25
  jobTitle: number;   // 15
  location: number;   // 10
  seniority: number;  // 10
  keywords: number;   // 5
}

export interface IJobMatchResult {
  jobId: string;
  userId: string;
  matchScore: number; // 0-100
  recommendation: MatchRecommendation;
  breakdown: IMatchBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  eligibility: boolean;
  eligibilityReason?: string;
  reasoning: string;
  vectorSimilarity?: number;
  matchedAt: string;
}

export type ApplicationStatus =
  | 'draft'
  | 'ready'
  | 'submitting'
  | 'applied'
  | 'failed'
  | 'under_review'
  | 'interview'
  | 'rejected'
  | 'offer'
  | 'withdrawn';

export type SubmissionMethod =
  | 'greenhouse_api'
  | 'lever_api'
  | 'ats_official'
  | 'playwright_browser'
  | 'browser_automation'
  | 'manual_handoff';

export interface IApplicationAnswer {
  question: string;
  answer: string;
  fieldType: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file';
  confidence: number; // 0-100
  sourceField?: string;
}

export interface IApplicationPackage {
  id?: string;
  userId: string;
  organizationId?: string;
  jobId: string;
  tailoredResumeId?: string;
  tailoredResumeContent?: string;
  coverLetter: string;
  answers: IApplicationAnswer[];
  status: ApplicationStatus;
  submissionMethod: SubmissionMethod;
  submissionResult?: {
    success: boolean;
    confirmationId?: string;
    submittedAt?: string;
    details?: string;
    screenshotUrl?: string;
  };
  failureReason?: string;
  isFactuallyVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RecruiterVerificationStatus = 'verified' | 'unverified' | 'risky';

export interface IRecruiterContact {
  id?: string;
  userId: string;
  organizationId?: string;
  name: string;
  company: string;
  role: string;
  publicProfileUrl?: string;
  email: string;
  source: string;
  verificationStatus: RecruiterVerificationStatus;
  optOut: boolean;
  createdAt: string;
}

export type OutreachStatus =
  | 'draft'
  | 'scheduled'
  | 'sent'
  | 'delivered'
  | 'bounced'
  | 'replied'
  | 'opted_out'
  | 'failed';

export interface IOutreachMessage {
  id?: string;
  userId: string;
  organizationId?: string;
  recruiterId: string;
  jobId?: string;
  channel: 'email' | 'whatsapp';
  subject?: string;
  body: string;
  status: OutreachStatus;
  sentAt?: string;
  deliveredAt?: string;
  repliedAt?: string;
  error?: string;
}

export type EmailReplyClassification =
  | 'interview_invitation'
  | 'rejection'
  | 'assessment_request'
  | 'salary_inquiry'
  | 'general_reply'
  | 'auto_responder'
  | 'spam';

export interface IExtractedInterviewDetails {
  interviewDates?: string[];
  meetingLink?: string;
  interviewType?: 'phone' | 'video' | 'onsite' | 'technical' | 'hr';
  nextSteps?: string;
  notes?: string;
}

export interface IAutomationSettings {
  userId: string;
  organizationId?: string;
  enabled: boolean;
  discoveryFrequencyHours: number;
  autoApplyThreshold: number; // e.g. 75
  dailyApplicationLimit: number;
  dailyEmailOutreachLimit: number;
  dailyWhatsAppLimit: number;
  scoringWeights: IScoringWeights;
  allowedWorkplaceTypes: WorkplaceType[];
  sendRecruiterOutreach: boolean;
  sendWhatsAppAlerts: boolean;
  sendEmailAlerts?: boolean;
  notificationEmail?: string;
  requireApprovalBeforeSubmit: boolean; // default false for autonomous
}

export type QueueName =
  | 'job-discovery'
  | 'resume-processing'
  | 'job-matching'
  | 'application-generation'
  | 'application-submission'
  | 'recruiter-discovery'
  | 'email-outreach'
  | 'whatsapp-outreach'
  | 'email-monitoring'
  | 'application-tracking'
  | 'notifications'
  | 'analytics';

export interface IDashboardMetrics {
  jobsDiscovered: number;
  eligibleJobs: number;
  strongMatches: number;
  applicationsSubmitted: number;
  failedSubmissions: number;
  recruiterEmailsSent: number;
  whatsAppMessagesSent: number;
  repliesReceived: number;
  interviewsScheduled: number;
  offersReceived: number;
}