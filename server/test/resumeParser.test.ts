import { describe, it, expect } from 'vitest';
import { ResumeIntelligenceService } from '../src/services/ResumeIntelligenceService';

describe('Resume Intelligence Parser & Review Facts', () => {
  const service = new ResumeIntelligenceService();

  const sampleResumeText = `
Johnathan Doe
Senior Full Stack Engineer
johnathan.doe@example.com | +1 (415) 555-8921 | 450 Mission St, San Francisco, CA 94105, United States
https://linkedin.com/in/johndoe | https://github.com/johndoe

SUMMARY
Versatile engineer with 6+ years of experience designing high-scale cloud platforms and microservices.

WORK EXPERIENCE
TechFlow Innovations - Lead Engineer
San Francisco, CA | 2021-06 - Present
• Architected event-driven microservices processing 12 million events per day.
• Mentored a team of 8 engineers and decreased platform downtime by 40%.
Technologies: TypeScript, Node.js, React, MongoDB, Docker

Apex Digital - Software Developer
Austin, TX | 2019-01 - 2021-05
• Engineered customer-facing payment gateways and responsive web interfaces.
• Built automated CI/CD pipelines reducing deployment cycle time from 2 hours to 10 minutes.
Technologies: JavaScript, Python, PostgreSQL, AWS

EDUCATION
University of Texas at Austin
Bachelor of Science in Computer Science
2015 - 2019 | 3.9 GPA

TECHNICAL SKILLS
Languages & Frameworks: TypeScript, JavaScript, Python, React, Next.js, Node.js, Express.js
Databases & Cloud: MongoDB, PostgreSQL, Redis, Docker, AWS, Git, CI/CD
`;

  it('should accurately extract contact, location/address, and headline from resume text', () => {
    const parsed = service.heuristicExtraction(sampleResumeText);

    expect(parsed.fullName).toBe('Johnathan Doe');
    expect(parsed.email).toBe('johnathan.doe@example.com');
    expect(parsed.phone).toContain('555-8921');
    expect(parsed.currentLocation).toContain('San Francisco');
    expect(parsed.country).toBe('United States');
    expect(parsed.headline).toContain('Full Stack');
  });

  it('should extract structured work history with companies, roles, and dates', () => {
    const parsed = service.heuristicExtraction(sampleResumeText);

    expect(parsed.workHistory.length).toBeGreaterThanOrEqual(1);
    const topJob = parsed.workHistory[0];
    expect(topJob.company).toBeTruthy();
    expect(topJob.role).toBeTruthy();
    expect(topJob.achievements.length).toBeGreaterThanOrEqual(1);
  });

  it('should extract education degree and institution', () => {
    const parsed = service.heuristicExtraction(sampleResumeText);

    expect(parsed.education.length).toBeGreaterThanOrEqual(1);
    expect(parsed.education[0].institution).toContain('Texas');
    expect(parsed.education[0].degree).toContain('Bachelor');
  });

  it('should extract detected skills across languages and frameworks', () => {
    const parsed = service.heuristicExtraction(sampleResumeText);

    const skillNames = parsed.skills.map((s) => s.name);
    expect(skillNames).toContain('TypeScript');
    expect(skillNames).toContain('React');
    expect(skillNames).toContain('Node.js');
    expect(skillNames).toContain('MongoDB');
  });

  it('should accurately extract address and details for international resumes', () => {
    const indiaResume = `
Rahul Sharma
Full Stack Developer
rahul.sharma@gmail.com | +91 98765 43210
Flat 402, Sector 62, Noida, Uttar Pradesh, India
https://github.com/rahulsharma

EXPERIENCE
Infosys Technologies - Senior Systems Engineer
Bengaluru, India | 2021-08 - Present
• Designed microservices using Node.js and MongoDB.
• Built frontend portals using React and Tailwind CSS.

EDUCATION
Delhi Technological University
B.Tech in Computer Science
2017 - 2021 | 8.8 CGPA

SKILLS
JavaScript, TypeScript, Python, React, Node.js, Express.js, MongoDB, Docker
`;

    const parsed = service.heuristicExtraction(indiaResume);
    expect(parsed.fullName).toBe('Rahul Sharma');
    expect(parsed.email).toBe('rahul.sharma@gmail.com');
    expect(parsed.country).toBe('India');
    expect(parsed.currentLocation).toContain('Sector 62');
    expect(parsed.headline).toContain('Full Stack');
    expect(parsed.education[0].institution).toContain('Delhi Technological University');
    expect(parsed.education[0].degree).toContain('B.Tech');
  });
});
