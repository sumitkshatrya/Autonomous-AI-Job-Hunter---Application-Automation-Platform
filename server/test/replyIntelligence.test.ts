import { describe, it, expect } from 'vitest';
import { EmailMonitoringService } from '../src/services/EmailMonitoringService';

describe('Email & Reply Intelligence Agent', () => {
  const service = new EmailMonitoringService();

  it('should classify interview invitation and extract video conference links', async () => {
    const subject = 'Invitation to Interview with Databricks';
    const body = 'Hi Jane, we would love to schedule a video call this Wednesday at 2pm. Here is the Zoom link: https://zoom.us/j/987654321';

    const result = await service.classifyEmailReply('recruiter@databricks.com', subject, body);

    expect(result.classification).toBe('interview_invitation');
    expect(result.suggestedApplicationStatus).toBe('interview');
    expect(result.extractedDetails.meetingLink).toContain('zoom.us');
  });

  it('should classify polite rejection notices', async () => {
    const subject = 'Update regarding your application';
    const body = 'Thank you for your time. Unfortunately we have decided to pursue other applicants whose background more closely matches our current needs.';

    const result = await service.classifyEmailReply('no-reply@company.com', subject, body);

    expect(result.classification).toBe('rejection');
    expect(result.suggestedApplicationStatus).toBe('rejected');
  });

  it('should classify technical assessment requests', async () => {
    const subject = 'Next Steps: Technical Coding Assessment';
    const body = 'Please complete the Hackerrank assessment link within the next 48 hours to proceed to the next stage.';

    const result = await service.classifyEmailReply('talent@tech.com', subject, body);

    expect(result.classification).toBe('assessment_request');
  });
});
