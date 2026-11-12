import { describe, it, expect } from 'vitest';
import { ApplicationGenerationService } from '../src/services/ApplicationGenerationService';
import {
  GreenhouseSubmissionAdapter,
  LeverSubmissionAdapter,
  PlaywrightBrowserAdapter,
} from '../src/services/ApplicationSubmissionService';

describe('AI Application Generation & Submission Engine', () => {
  const genService = new ApplicationGenerationService();

  const mockProfile: any = {
    userId: '507f1f77bcf86cd799439011',
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+1 555-0199',
    headline: 'Senior Full Stack Engineer',
    yearsOfExperience: 6,
    skills: [
      { name: 'TypeScript', level: 'advanced' },
      { name: 'React', level: 'advanced' },
      { name: 'Node.js', level: 'advanced' },
    ],
    projects: [{ name: 'CloudScale Platform' }],
    preferences: {
      workAuthorization: ['US Citizen'],
      noticePeriodDays: 30,
      minSalary: 140000,
      currency: 'USD',
      workplaceType: 'remote',
    },
  };

  const mockJob: any = {
    _id: '607f1f77bcf86cd799439022',
    title: 'Senior Full Stack Engineer',
    company: 'Stripe',
    skillsRequired: ['TypeScript', 'React', 'Node.js'],
    applicationUrl: 'https://boards.greenhouse.io/stripe/jobs/1234',
  };

  it('should generate professional truthful cover letter citing candidate facts', async () => {
    const letter = await genService.generateCoverLetter(mockProfile, mockJob);

    expect(letter).toContain('Stripe');
    expect(letter).toContain('Jane Doe');
    expect(letter).toContain('Senior Full Stack Engineer');
    expect(letter).not.toContain('undefined');
  });

  it('should generate truthful answers for ATS questionnaire', async () => {
    const answers = await genService.generateTruthfulAnswers(mockProfile, mockJob);

    expect(answers).toBeInstanceOf(Array);
    expect(answers.length).toBeGreaterThanOrEqual(5);

    const authAnswer = answers.find((a) => a.question.includes('legally authorized'));
    expect(authAnswer?.answer).toContain('US Citizen');

    const noticeAnswer = answers.find((a) => a.question.includes('notice period'));
    expect(noticeAnswer?.answer).toContain('30 days');
  });

  it('should verify Greenhouse submission adapter returns reference receipt', async () => {
    const adapter = new GreenhouseSubmissionAdapter();
    const receipt = await adapter.submit({} as any, mockJob, mockProfile);

    expect(receipt.success).toBe(true);
    expect(receipt.confirmationId).toContain('GH-APP-');
  });

  it('should verify Lever submission adapter returns reference receipt', async () => {
    const adapter = new LeverSubmissionAdapter();
    const receipt = await adapter.submit({} as any, mockJob, mockProfile);

    expect(receipt.success).toBe(true);
    expect(receipt.confirmationId).toContain('LEVER-APP-');
  });

  it('should safeguard and trigger manual handoff when anti-bot / CAPTCHA domain detected', async () => {
    const adapter = new PlaywrightBrowserAdapter();
    const botJob: any = {
      ...mockJob,
      applicationUrl: 'https://www.linkedin.com/jobs/view/9999999',
    };

    const receipt = await adapter.submit({} as any, botJob, mockProfile);
    expect(receipt.success).toBe(false);
    expect(receipt.requiresManualHandoff).toBe(true);
    expect(receipt.failureReason).toContain('anti-bot / CAPTCHA');
  });
});
