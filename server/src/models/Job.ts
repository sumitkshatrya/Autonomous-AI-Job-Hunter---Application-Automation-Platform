import { Schema, model, Document } from 'mongoose';
import {
  JobSource,
  WorkplaceType,
  EmploymentType,
  ExperienceLevel,
  JOB_SOURCES,
} from '@autoapply/shared';

export interface IJobDocument extends Document {
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
  benefits: string[];
  applicationUrl: string;
  companyLinkedinUrl?: string;
  companyWebsite?: string;
  companyPhone?: string;
  contactPhone?: string;
  contactEmail?: string;
  duplicateHash: string;
  isExpired: boolean;
  discoveredAt: Date;
  expiresAt?: Date;
  rawData?: Record<string, any>;
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJobDocument>(
  {
    sourceId: { type: String, required: true },
    source: {
      type: String,
      enum: JOB_SOURCES,
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, index: true },
    company: { type: String, required: true, trim: true, index: true },
    companyLogo: { type: String },
    location: { type: String, required: true, index: true },
    country: { type: String, required: true, index: true },
    workplaceType: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite', 'any'],
      default: 'remote',
      index: true,
    },
    employmentType: {
      type: String,
      enum: ['full_time', 'contract', 'part_time', 'internship'],
      default: 'full_time',
      index: true,
    },
    experienceLevel: {
      type: String,
      enum: ['fresher', 'internship', 'junior', 'mid', 'senior', 'lead', 'executive'],
      default: 'mid',
      index: true,
    },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    salaryCurrency: { type: String, default: 'USD' },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    skillsRequired: [{ type: String, index: true }],
    benefits: [{ type: String }],
    applicationUrl: { type: String, required: true },
    companyLinkedinUrl: { type: String },
    companyWebsite: { type: String },
    companyPhone: { type: String },
    contactPhone: { type: String },
    contactEmail: { type: String },
    duplicateHash: { type: String, required: true, unique: true },
    isExpired: { type: Boolean, default: false, index: true },
    discoveredAt: { type: Date, default: Date.now, index: true },
    expiresAt: { type: Date },
    rawData: { type: Schema.Types.Mixed },
    embedding: [{ type: Number }],
  },
  {
    timestamps: true,
  }
);

JobSchema.index({ source: 1, sourceId: 1 }, { unique: true });
JobSchema.index({ isExpired: 1, discoveredAt: -1 });

export const Job = model<IJobDocument>('Job', JobSchema);
