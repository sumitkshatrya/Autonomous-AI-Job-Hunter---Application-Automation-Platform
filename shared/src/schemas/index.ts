import { z } from 'zod';

export const RegisterSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organizationName: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const SkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  category: z.string().optional(),
  yearsOfExperience: z.number().min(0).max(50).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
});

export const WorkExperienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role is required'),
  location: z.string().optional().default(''),
  startDate: z.string().default(''),
  endDate: z.string().optional().default('Present'),
  current: z.boolean().default(false),
  description: z.string().default(''),
  achievements: z.array(z.string()).default([]),
  technologiesUsed: z.array(z.string()).default([]),
});

export const EducationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().default('Bachelor of Science'),
  fieldOfStudy: z.string().default('Computer Science'),
  startDate: z.string().default(''),
  endDate: z.string().optional().default(''),
  grade: z.string().optional().default(''),
});

export const ProjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().default(''),
  role: z.string().optional().default(''),
  liveUrl: z.string().url().optional().or(z.literal('')).default(''),
  repoUrl: z.string().url().optional().or(z.literal('')).default(''),
  technologiesUsed: z.array(z.string()).default([]),
});

export const CandidatePreferencesSchema = z.object({
  desiredJobTitles: z.array(z.string()).default(['Software Engineer']),
  desiredCountries: z.array(z.string()).default(['India', 'United States']),
  workplaceType: z.enum(['remote', 'hybrid', 'onsite', 'any']).default('remote'),
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  currency: z.string().default('USD'),
  employmentTypes: z.array(z.enum(['full_time', 'contract', 'part_time', 'internship'])).default(['full_time']),
  noticePeriodDays: z.number().min(0).default(30),
  workAuthorization: z.array(z.string()).default(['Authorized to work in India']),
  preferredIndustries: z.array(z.string()).default([]),
});

export const CandidateProfileOnboardingSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().default(''),
  country: z.string().optional().default('India'),
  currentLocation: z.string().optional().default(''),
  headline: z.string().optional().default('Software Professional'),
  yearsOfExperience: z.union([z.number(), z.string()]).transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? 0 : Math.max(0, num);
  }),
  skills: z.array(SkillSchema).default([]),
  education: z.array(EducationSchema).default([]),
  workHistory: z.array(WorkExperienceSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  preferences: CandidatePreferencesSchema.optional().default({
    desiredJobTitles: ['Software Engineer'],
    desiredCountries: ['India', 'United States'],
    workplaceType: 'remote',
    currency: 'USD',
    employmentTypes: ['full_time'],
    noticePeriodDays: 30,
    workAuthorization: ['Authorized to work in India'],
    preferredIndustries: [],
  }),
  isVerified: z.boolean().default(true),
});

export const ScoringWeightsSchema = z.object({
  skills: z.number().min(0).max(100),
  experience: z.number().min(0).max(100),
  jobTitle: z.number().min(0).max(100),
  location: z.number().min(0).max(100),
  seniority: z.number().min(0).max(100),
  keywords: z.number().min(0).max(100),
});

export const AutomationSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  discoveryFrequencyHours: z.number().min(1).max(72).default(1),
  autoApplyThreshold: z.number().min(50).max(100).default(75),
  dailyApplicationLimit: z.number().min(1).max(500).default(50),
  dailyEmailOutreachLimit: z.number().min(1).max(200).default(25),
  dailyWhatsAppLimit: z.number().min(1).max(100).default(10),
  scoringWeights: ScoringWeightsSchema.default({
    skills: 35,
    experience: 25,
    jobTitle: 15,
    location: 10,
    seniority: 10,
    keywords: 5,
  }),
  allowedWorkplaceTypes: z.array(z.enum(['remote', 'hybrid', 'onsite', 'any'])).default(['remote', 'hybrid']),
  sendRecruiterOutreach: z.boolean().default(true),
  sendWhatsAppAlerts: z.boolean().default(true),
  sendEmailAlerts: z.boolean().default(true),
  notificationEmail: z.string().optional(),
  requireApprovalBeforeSubmit: z.boolean().default(false),
});

export const JobQuerySchema = z.object({
  query: z.string().optional(),
  country: z.string().optional(),
  location: z.string().optional(),
  workplaceType: z.enum(['remote', 'hybrid', 'onsite', 'any']).optional(),
  source: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});
