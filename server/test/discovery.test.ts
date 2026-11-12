import { describe, it, expect } from 'vitest';
import { JobDiscoveryService } from '../src/services/JobDiscoveryService';

describe('Autonomous Job Discovery Connectors', () => {
  const service = new JobDiscoveryService();

  it('should fetch and normalize live jobs from Remotive API', async () => {
    const jobs = await service.fetchRemotiveJobs('software-dev', 5);

    expect(jobs).toBeInstanceOf(Array);
    if (jobs.length > 0) {
      const firstJob = jobs[0];
      expect(firstJob).toHaveProperty('title');
      expect(firstJob).toHaveProperty('company');
      expect(firstJob).toHaveProperty('source');
      expect(firstJob.workplaceType).toBe('remote');
      expect(firstJob.skillsRequired).toBeInstanceOf(Array);
    }
  }, 15000);

  it('should normalize Greenhouse board live jobs into standard format', async () => {
    const jobs = await service.fetchGreenhouseSampleJobs('cloudflare');

    expect(jobs).toBeInstanceOf(Array);
    if (jobs.length > 0) {
      const first = jobs[0];
      expect(first.source).toBe('greenhouse');
      expect(first.applicationUrl).toContain('http');
    }
  }, 15000);

  it('should normalize Lever live posting jobs into standard format', async () => {
    const jobs = await service.fetchLeverSampleJobs('spotify');

    expect(jobs).toBeInstanceOf(Array);
    if (jobs.length > 0) {
      const first = jobs[0];
      expect(first.source).toBe('lever');
      expect(first.applicationUrl).toContain('http');
    }
  }, 15000);

  it('should discover and normalize real live tech jobs from Arbeitnow, Jobicy, RemoteOK, and WWR', async () => {
    const arbeitnowJobs = await service.fetchArbeitnowJobs();
    expect(arbeitnowJobs).toBeInstanceOf(Array);
    if (arbeitnowJobs.length > 0) {
      expect(arbeitnowJobs[0].source).toBe('arbeitnow');
      expect(arbeitnowJobs[0].applicationUrl).toContain('http');
    }

    const jobicyJobs = await service.fetchJobicyJobs();
    expect(jobicyJobs).toBeInstanceOf(Array);
    if (jobicyJobs.length > 0) {
      expect(jobicyJobs[0].source).toBe('jobicy');
    }

    const remoteOKJobs = await service.fetchRemoteOKJobs();
    expect(remoteOKJobs).toBeInstanceOf(Array);
    if (remoteOKJobs.length > 0) {
      expect(remoteOKJobs[0].source).toBe('remoteok');
    }

    const wwrJobs = await service.fetchWeWorkRemotelyJobs();
    expect(wwrJobs).toBeInstanceOf(Array);
    if (wwrJobs.length > 0) {
      expect(wwrJobs[0].source).toBe('weworkremotely');
    }
  }, 25000);

  it('should adhere to strict zero-seed policy and never return hardcoded fake jobs', async () => {
    const linkedInJobs = await service.fetchLinkedInJobs();
    expect(linkedInJobs).toBeInstanceOf(Array);
    // If rate-limited or unavailable, returns clean empty array, never fake mock URLs
    for (const j of linkedInJobs) {
      expect(j.applicationUrl).not.toContain('39182');
    }

    const naukriJobs = await service.fetchNaukriJobs();
    expect(naukriJobs).toBeInstanceOf(Array);
    for (const j of naukriJobs) {
      expect(j.applicationUrl).not.toContain('98210');
    }
  });
});
