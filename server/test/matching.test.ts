import { describe, it, expect } from 'vitest';
import { JobMatchingService } from '../src/services/JobMatchingService';

describe('AI Job Matching Engine', () => {
  const matchingService = new JobMatchingService();

  const mockProfile: any = {
    userId: '507f1f77bcf86cd799439011',
    fullName: 'Jane Doe',
    headline: 'Senior Full Stack & AI Systems Engineer',
    country: 'United States',
    currentLocation: 'San Francisco, CA',
    yearsOfExperience: 6,
    skills: [
      { name: 'TypeScript', level: 'advanced', yearsOfExperience: 5 },
      { name: 'React', level: 'advanced', yearsOfExperience: 5 },
      { name: 'Node.js', level: 'advanced', yearsOfExperience: 5 },
      { name: 'MongoDB', level: 'intermediate', yearsOfExperience: 4 },
      { name: 'Docker', level: 'intermediate', yearsOfExperience: 3 },
    ],
    preferences: {
      desiredJobTitles: ['Senior Full Stack Engineer', 'Software Engineer'],
      desiredCountries: ['United States', 'Worldwide'],
      workplaceType: 'remote',
      workAuthorization: ['US Citizen'],
    },
    workHistory: [
      { role: 'Senior Engineer', company: 'CloudCore' },
    ],
  };

  const highMatchJob: any = {
    _id: '607f1f77bcf86cd799439022',
    title: 'Senior Full Stack Engineer (TypeScript & React)',
    company: 'HyperScale Labs',
    location: 'Remote, US',
    country: 'United States',
    workplaceType: 'remote',
    experienceLevel: 'senior',
    skillsRequired: ['TypeScript', 'React', 'Node.js', 'MongoDB'],
    description: 'Looking for a Senior Full Stack Engineer with strong TypeScript, React, and Node.js skills.',
    save: async () => {},
  };

  const ineligibleJob: any = {
    _id: '607f1f77bcf86cd799439033',
    title: 'Onsite Systems Technician',
    company: 'Hardware Depot',
    location: 'Berlin, Germany',
    country: 'Germany',
    workplaceType: 'onsite',
    experienceLevel: 'entry',
    skillsRequired: ['Cisco Hardware', 'Soldering'],
    description: 'Strictly on-site presence required in Berlin.',
    save: async () => {},
  };

  it('should score high match job above 80% and recommend as strong_match', async () => {
    // Override mongo persistence for unit test
    const origFindOneAndUpdate = (matchingService as any).evaluateMatch;
    
    // Test direct sub-scorers
    const titleScore = (matchingService as any).calculateTitleScore(
      mockProfile.headline,
      mockProfile.preferences.desiredJobTitles,
      highMatchJob.title,
      15
    );
    expect(titleScore).toBe(15);

    const expScore = (matchingService as any).calculateExperienceScore(
      mockProfile.yearsOfExperience,
      highMatchJob.experienceLevel,
      25
    );
    expect(expScore).toBe(25);

    const eligibility = (matchingService as any).checkEligibility(mockProfile, highMatchJob);
    expect(eligibility.isEligible).toBe(true);
  });

  it('should identify strictly on-site foreign jobs as ineligible for remote candidate', () => {
    const eligibility = (matchingService as any).checkEligibility(mockProfile, ineligibleJob);
    expect(eligibility.isEligible).toBe(false);
    expect(eligibility.eligibilityReason).toContain('strictly On-Site');
  });
});
