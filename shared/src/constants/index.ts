import { IScoringWeights, QueueName } from '../types';

export const DEFAULT_SCORING_WEIGHTS: IScoringWeights = {
  skills: 35,
  experience: 25,
  jobTitle: 15,
  location: 10,
  seniority: 10,
  keywords: 5,
};

export const DEFAULT_MATCH_THRESHOLD = 75;
export const DEFAULT_STRONG_MATCH_THRESHOLD = 85;

export const QUEUE_NAMES: Record<string, QueueName> = {
  JOB_DISCOVERY: 'job-discovery',
  RESUME_PROCESSING: 'resume-processing',
  JOB_MATCHING: 'job-matching',
  APPLICATION_GENERATION: 'application-generation',
  APPLICATION_SUBMISSION: 'application-submission',
  RECRUITER_DISCOVERY: 'recruiter-discovery',
  EMAIL_OUTREACH: 'email-outreach',
  WHATSAPP_OUTREACH: 'whatsapp-outreach',
  EMAIL_MONITORING: 'email-monitoring',
  APPLICATION_TRACKING: 'application-tracking',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
};

export const APPLICATION_STATUSES = [
  'draft',
  'ready',
  'submitting',
  'applied',
  'failed',
  'under_review',
  'interview',
  'rejected',
  'offer',
  'withdrawn',
] as const;

export const JOB_SOURCES = [
  'greenhouse',
  'lever',
  'remotive',
  'linkedin',
  'wellfound',
  'naukri',
  'internshala',
  'remotehunter',
  'instahyre',
  'indeed',
  'workindia',
  'ycombinator',
  'ziprecruiter',
  'glassdoor',
  'foundit',
  'cuvette',
  'hirist',
  'remoteco',
  'weworkremotely',
  'arbeitnow',
  'jobicy',
  'remoteok',
  'career_page',
  'manual',
  'licensed_api',
] as const;
