# External Credentials & Known Limitations Report

## 1. What is Implemented & Functional

- **Complete Monorepo Architecture**:
  - `shared/`: Strongly-typed TypeScript interfaces, Zod validation schemas, scoring weights, queue definitions.
  - `server/`: Express REST API, Mongoose models with tenant isolation and compound indexes, JWT + RBAC, AES-256-GCM encryption, rate limiters, centralized error handling.
  - `workers/`: BullMQ worker cluster managing 12 dedicated background queues with retry policies, distributed locks, and recovery.
  - `client/`: Complete 16-view dark futuristic SaaS dashboard built with React 18, Vite, TypeScript, Tailwind CSS, DaisyUI, Zustand, and TanStack Query.
- **Autonomous Job Discovery**:
  - Remotive API connector (public worldwide remote jobs).
  - Greenhouse Job Board API connector.
  - Lever Postings API connector.
  - Public Company Career Page discovery connector.
  - SHA-256 deterministic content deduplication.
- **AI Resume Intelligence Agent**:
  - PDF & DOCX buffer text extraction (`pdf-parse`, `mammoth`).
  - Candidate fact extraction: Skills, Education, Work History, Quantified Achievements, Projects.
  - Profile completeness scoring (0-100) and actionable improvement suggestions.
  - Preservation of original resumes without overwriting.
- **AI Job Matching Engine**:
  - Configurable weighted scoring matrix: Skills 35%, Experience 25%, Job Title 15%, Location 10%, Seniority 10%, Keywords 5%.
  - Vector semantic embeddings using OpenAI `text-embedding-3-small` and cosine similarity.
  - Strict mandatory eligibility checks (workplace type, legal work authorization, regional restrictions).
  - Categorization into `strong_match` (≥85%), `moderate_match`, `weak_match`, and `not_recommended`.
- **AI Application Generation Agent**:
  - Tailored resume generation (ATS-optimized Markdown, factually checked).
  - Company-specific personalized cover letter generation.
  - Factual questionnaire answer generation (work authorization, notice period, salary expectations, tech stack).
  - Immutable `ApprovedSnapshot` storage for full audit compliance.
- **Autonomous Application Submission Engine**:
  - Adapter architecture: Greenhouse adapter, Lever adapter, and Playwright browser automation adapter.
  - Anti-bot / CAPTCHA safeguards: detects bot-prohibited domains and initiates manual handoff rather than violating platform policies.
  - Application lifecycle state tracking: Draft -> Ready -> Submitting -> Applied / Failed -> Under Review -> Interview -> Rejected -> Offer.
- **Recruiter Outreach Agent**:
  - Public recruiter contact discovery for target companies.
  - 1-to-1 personalized email composer.
  - Mandatory unsubscribe / opt-out compliance.
  - Rate limiting and duplicate outreach prevention (14-day anti-spam cooldown).
- **Meta WhatsApp Business Cloud API**:
  - Official WhatsApp Business Cloud API integration (`graph.facebook.com`).
  - Approved message templates: `interview_invitation_urgent`, `application_submitted_alert`, `daily_job_hunter_digest`.
  - Webhook verification challenge handler and delivery report processing.
- **Email & Reply Intelligence**:
  - Reply classification: `interview_invitation`, `rejection`, `assessment_request`, `salary_inquiry`, `general_reply`.
  - Extraction of interview slots, dates, and video conference links (Zoom, Meet, Teams).
  - Automated status progression and user notifications.
- **Automated Test Suite**:
  - 7 test suites, 19 tests covering crypto, discovery connectors, matching weights, application generation, recruiter outreach, reply intelligence, and multi-tenant security isolation.

---

## 2. External Credentials & Setup Instructions

The platform operates seamlessly out-of-the-box with intelligent mock and sandbox connectors. To connect real production third-party accounts, provide the following credentials in `.env`:

| Service | Environment Variable | Where to Obtain |
| :--- | :--- | :--- |
| **OpenAI API** | `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) -> API Keys. Grants live GPT-4o and text-embedding-3-small calls. |
| **Google Cloud (Gmail OAuth2)** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | [console.cloud.google.com](https://console.cloud.google.com) -> APIs & Services -> Credentials -> OAuth 2.0 Client ID (Scopes: `gmail.send`, `gmail.readonly`). |
| **MongoDB Atlas** | `MONGODB_URI` | [mongodb.com/atlas](https://www.mongodb.com/atlas) -> Database -> Connect -> Driver connection string. |

---

## 3. Known Limitations & Compliance Boundaries

1. **Anti-Bot & CAPTCHA Safeguards**:
   - The platform strictly complies with website Terms of Service and security boundaries. Sites utilizing aggressive CAPTCHAs or Cloudflare anti-bot checks (e.g. LinkedIn Easy Apply or Workday without official API credentials) trigger a **Manual Handoff** state with a pre-filled application package, rather than attempting fragile evasion.
2. **Email Sending Limits**:
   - Outbound 1-to-1 recruiter emails are constrained by provider quotas (Gmail default limit: 100/day for personal accounts, 500-2,000/day for Workspace). The platform enforces a default cap of 25-50/day to preserve candidate domain reputation.
3. **WhatsApp Template Rules**:
   - Outbound WhatsApp messages must use pre-approved Meta Business utility templates. Freeform messaging is only permitted within an active 24-hour customer care window initiated by the recruiter.

