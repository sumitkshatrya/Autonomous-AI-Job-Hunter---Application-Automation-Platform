import { describe, it, expect } from 'vitest';
import { RecruiterOutreachService } from '../src/services/RecruiterOutreachService';

describe('Recruiter Outreach & Opt-Out Compliance', () => {
  const service = new RecruiterOutreachService();

  const mockProfile: any = {
    fullName: 'Alex Vance',
    headline: 'Senior Full Stack Engineer',
    email: 'alex@example.com',
    phone: '+1 555-0188',
    yearsOfExperience: 5,
    skills: [{ name: 'TypeScript' }, { name: 'React' }, { name: 'Node.js' }],
    projects: [{ name: 'AutoApply Platform' }],
  };

  const mockRecruiter: any = {
    name: 'Sarah Connor',
    role: 'Principal Tech Recruiter',
    company: 'Cyberdyne Systems',
    email: 's.connor@cyberdyne.com',
    optOut: false,
  };

  it('should compose personalized 1-to-1 outreach email with mandatory opt-out clause', async () => {
    const { subject, body } = await service.composeOutreachEmail(mockProfile, mockRecruiter);

    expect(subject).toContain('Cyberdyne Systems');
    expect(body).toMatch(/Sarah/i);
    expect(body).toContain('Alex Vance');
    expect(body).toContain('Unsubscribe'); // Legal anti-spam compliance check
  });
});
