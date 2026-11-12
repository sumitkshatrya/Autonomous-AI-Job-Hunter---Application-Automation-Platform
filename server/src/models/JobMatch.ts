import { Schema, model, Document } from 'mongoose';
import { MatchRecommendation, IMatchBreakdown } from '@autoapply/shared';

export interface IJobMatchDocument extends Document {
  userId: Schema.Types.ObjectId;
  organizationId?: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  matchScore: number;
  recommendation: MatchRecommendation;
  breakdown: IMatchBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  eligibility: boolean;
  eligibilityReason?: string;
  reasoning: string;
  vectorSimilarity?: number;
  isDismissed: boolean;
  matchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobMatchSchema = new Schema<IJobMatchDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    matchScore: { type: Number, required: true, min: 0, max: 100, index: true },
    recommendation: {
      type: String,
      enum: ['strong_match', 'moderate_match', 'weak_match', 'not_recommended'],
      required: true,
      index: true,
    },
    breakdown: {
      skillsScore: { type: Number, required: true },
      experienceScore: { type: Number, required: true },
      jobTitleScore: { type: Number, required: true },
      locationScore: { type: Number, required: true },
      seniorityScore: { type: Number, required: true },
      keywordsScore: { type: Number, required: true },
    },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    eligibility: { type: Boolean, required: true, index: true },
    eligibilityReason: { type: String },
    reasoning: { type: String, required: true },
    vectorSimilarity: { type: Number },
    isDismissed: { type: Boolean, default: false },
    matchedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

JobMatchSchema.index({ userId: 1, jobId: 1 }, { unique: true });
JobMatchSchema.index({ userId: 1, matchScore: -1, eligibility: 1 });

export const JobMatch = model<IJobMatchDocument>('JobMatch', JobMatchSchema);
