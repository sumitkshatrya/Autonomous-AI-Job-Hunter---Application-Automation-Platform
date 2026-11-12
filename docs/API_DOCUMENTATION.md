# AutoApply AI - REST API Specification

Base URL: `/api`

All protected endpoints require the HTTP Header:
`Authorization: Bearer <jwt_token>`

---

## 1. Authentication (`/api/auth`)
- `POST /register`: Register a new user and optional organization.
- `POST /login`: Authenticate email and password, returns JWT session token.
- `GET /me`: Fetch authenticated user profile and subscription tier.

## 2. Candidate Profile & Onboarding (`/api/profile`)
- `GET /`: Retrieve candidate profile facts.
- `POST /onboarding`: Save verified facts and preferences.
- `POST /upload-resume`: Upload PDF or DOCX file, triggers AI extraction.

## 3. Autonomous Job Discovery (`/api/jobs`)
- `GET /`: List discovered jobs with filters (`query`, `country`, `workplaceType`, `source`, `page`, `limit`).
- `GET /:id`: Retrieve job posting details.
- `POST /discover`: Trigger autonomous discovery ingestion across all connected sources.

## 4. AI Job Matching (`/api/matching`)
- `GET /recommendations`: Retrieve ranked matches for user (`minScore`, `recommendation`).
- `POST /evaluate`: Run weighted scoring and vector similarity evaluation.
- `POST /dismiss/:jobId`: Dismiss a match from candidate recommendations.

## 5. Applications (`/api/applications`)
- `GET /`: List applications (`status`).
- `GET /:id`: Fetch application details with cover letter and screening answers.
- `POST /generate`: Synthesize tailored resume, cover letter, and answers.
- `POST /:id/submit`: Execute autonomous submission via appropriate adapter.
- `PATCH /:id/status`: Update application state.

## 6. Recruiter Outreach (`/api/recruiter`)
- `GET /contacts`: List discovered recruiter contacts.
- `POST /discover`: Find publicly available recruiters for target company.
- `GET /messages`: List outreach messages and delivery statuses.
- `POST /send`: Dispatch 1-to-1 personalized email with opt-out clause.
- `POST /opt-out`: Public webhook for recruiter unsubscribe requests.

## 7. Email Center (`/api/email`)
- `GET /accounts`: List connected email accounts.
- `POST /connect-smtp`: Authorize and connect SMTP credentials.
- `POST /simulate-reply`: Ingest simulated recruiter reply to test AI classifier.

## 8. WhatsApp Business (`/api/whatsapp`)
- `GET /account`: Retrieve connected WhatsApp Business account details.
- `POST /configure`: Update Cloud API Phone Number ID and access token.
- `POST /send-test`: Dispatch test approved template message.
- `GET /webhook`: Meta challenge verification.
- `POST /webhook`: Inbound webhook events (status, stop opt-out).

## 9. Analytics & Reporting (`/api/analytics`)
- `GET /metrics`: Fetch 10 core metrics (discovered, eligible, strong matches, submitted, failed, emails, WA, replies, interviews, offers).
- `GET /activity`: Live background event stream.

## 10. Automation Settings (`/api/settings`)
- `GET /`: Fetch user automation settings and weights.
- `PUT /`: Update auto-apply threshold, scoring weights, and limits.

## 11. Administration (`/api/admin`)
- `GET /overview`: Telemetry overview (users, jobs, apps, audit logs).
- `GET /audit-logs`: Audit logs with IP and user attribution.
- `GET /users`: User list and role statuses.

