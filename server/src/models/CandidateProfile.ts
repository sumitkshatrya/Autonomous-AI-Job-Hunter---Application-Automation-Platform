import { Schema, model, Document } from 'mongoose';
import {
  ISkill,
  IEducation,
  IWorkExperience,
  IProject,
  ICandidatePreferences,
  IProfileCompleteness,
} from '@autoapply/shared';

export interface ICandidateProfileDocument extends Document {
  userId: Schema.Types.ObjectId;
  organizationId?: Schema.Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true },
    category: { type: String },
    yearsOfExperience: { type: Number },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
  },
  { _id: false }
);

const WorkExperienceSchema = new Schema<IWorkExperience>(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    location: { type: String },
    startDate: { type: String, required: true },
    endDate: { type: String },
    current: { type: Boolean, default: false },
    description: { type: String, required: true },
    achievements: [{ type: String }],
    technologiesUsed: [{ type: String }],
  },
  { _id: true }
);

const EducationSchema = new Schema<IEducation>(
  {
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String },
    grade: { type: String },
  },
  { _id: true }
);

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    role: { type: String },
    liveUrl: { type: String },
    repoUrl: { type: String },
    technologiesUsed: [{ type: String }],
  },
  { _id: true }
);

const CandidatePreferencesSchema = new Schema<ICandidatePreferences>(
  {
    desiredJobTitles: [{ type: String }],
    desiredCountries: [{ type: String }],
    workplaceType: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite', 'any'],
      default: 'remote',
    },
    minSalary: { type: Number },
    maxSalary: { type: Number },
    currency: { type: String, default: 'USD' },
    employmentTypes: [{ type: String, enum: ['full_time', 'contract', 'part_time', 'internship'] }],
    noticePeriodDays: { type: Number, default: 30 },
    workAuthorization: [{ type: String }],
    preferredIndustries: [{ type: String }],
  },
  { _id: false }
);

const CandidateProfileSchema = new Schema<ICandidateProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    currentLocation: { type: String, required: true },
    headline: { type: String, required: true },
    yearsOfExperience: { type: Number, required: true, default: 0 },
    skills: [SkillSchema],
    education: [EducationSchema],
    workHistory: [WorkExperienceSchema],
    projects: [ProjectSchema],
    preferences: { type: CandidatePreferencesSchema, required: true },
    completeness: {
      score: { type: Number, default: 0 },
      missingFields: [{ type: String }],
      suggestions: [{ type: String }],
    },
    isVerified: { type: Boolean, default: false },
    embedding: [{ type: Number }],
  },
  {
    timestamps: true,
  }
);

CandidateProfileSchema.index({ 'skills.name': 1 });
CandidateProfileSchema.index({ 'preferences.desiredJobTitles': 1 });

export const CandidateProfile = model<ICandidateProfileDocument>(
  'CandidateProfile',
  CandidateProfileSchema
);
