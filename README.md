# AutoApply AI 🚀
### Autonomous AI Job Hunter & Application Automation Platform
> **Find Jobs. Apply Automatically. Get Hired.**

AutoApply AI is an enterprise-grade, multi-tenant autonomous SaaS platform designed to completely automate a candidate's job-hunting workflow. Following a one-time onboarding and fact verification process, the platform continuously discovers jobs worldwide, matches candidate resumes using vector embeddings and configurable weighted criteria, tailors truthful application documents, submits applications through authorized integrations, conducts personalized recruiter outreach, monitors incoming replies, detects interview invitations, and delivers daily performance reports.

---

## 🌟 Key Features

- **Worldwide Autonomous Job Discovery**: Ingests opportunities continuously from Greenhouse Job Board API, Lever Postings API, Remotive API, and public company career pages with deterministic SHA-256 deduplication and rate limiting.
- **AI Resume Intelligence Agent**: Deep fact extraction from PDF and DOCX files. Formulates structured skills, verified work histories, quantified achievements, and profile completeness scores. Preserves original resumes immutably.
- **AI Job Matching Engine**: Vector semantic search blended with configurable multi-factor weighted scoring:
  - Skills: **35%**
  - Experience: **25%**
  - Job Title: **15%**
  - Location: **10%**
  - Seniority: **10%**
  - Keywords: **5%**
  - *Strict eligibility rules* enforce workplace compatibility (remote/hybrid/onsite) and legal work authorizations.
- **AI Application Generation Agent**: Synthesizes ATS-optimized tailored resume bullet points, company-specific personalized cover letters, and truthful answers to standard screening questions without hallucinating. Saves immutable `ApprovedSnapshot` records for complete audit compliance.
- **Autonomous Application Submission Engine**: Adapter architecture supporting Greenhouse API, Lever Postings flow, and permitted Playwright browser automation with anti-bot and CAPTCHA safeguards (automatic fallback to manual handoff when automation is prohibited).
- **AI Recruiter Outreach Agent**: Discovers publicly available talent acquisition and engineering contacts. Dispatches 1-to-1 personalized emails with candidate highlights, portfolio links, and mandatory opt-out/unsubscribe compliance.
- **Official WhatsApp Business Cloud API**: Delivers real-time interview invitation alerts, daily pipeline digests, and application status updates using pre-approved Meta Business utility templates.
- **Email & Reply Intelligence**: Continuously monitors connected mailboxes, classifies incoming recruiter messages (interview invitations, assessments, rejections), extracts calendar dates and video conference links, and updates application statuses.
- **12 Dedicated BullMQ Queues**: Background worker cluster managing job discovery, matching, document synthesis, submissions, recruiter outreach, email monitoring, and analytics with automatic recovery and exponential backoff.
- **Futuristic Dark SaaS Dashboard**: Complete 16-view interface built with React 18, Vite, TypeScript, Tailwind CSS, DaisyUI, Zustand, and TanStack Query.
- **Security & Multi-Tenant Isolation**: Tenant isolation enforcement on every query, AES-256-GCM token encryption, JWT authentication, RBAC authorization, and comprehensive audit logs.

---

## 🏗 Monorepo Architecture

```
autoapply-ai/
├── client/              # React 18 + Vite + TypeScript + Tailwind CSS + DaisyUI
├── server/              # Node.js + Express + TypeScript + Mongoose + JWT
├── workers/             # Dedicated BullMQ worker processes (12 queues)
├── shared/              # Shared TypeScript contracts, Zod schemas, scoring models
├── infrastructure/      # Multi-stage Dockerfiles and Nginx configurations
├── docs/                # Architecture, API specifications, and deployment guides
├── docker-compose.yml   # Full-stack container orchestration
└── package.json         # Root npm workspaces manifest
```

---

## ⚡ Quick Start

### 1. Installation
Clone the repository and install all dependencies across workspaces:
```bash
npm install
```

### 2. Build Shared Schemas
```bash
npm run build:shared
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(The system runs in full sandbox / development mode out-of-the-box even without third-party API keys!)*

### 4. Run Development Stack
```bash
# Terminal 1: Run Backend REST API Server (Port 5000)
npm run dev:server

# Terminal 2: Run Dedicated Background Workers
npm run dev:workers

# Terminal 3: Run Frontend Client (Port 3000)
npm run dev:client
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Click **"⚡ One-Click Instant Demo Login"** on the login page to immediately explore the workspace.

---

## 🧪 Running the Test Suite

Run unit, integration, connector, and multi-tenant security isolation tests:
```bash
npm run test
```
All 7 test suites (19 test cases) pass with zero errors.

---

## 🐳 Docker Deployment

To spin up the entire production-grade stack (MongoDB + API + Background Workers + Client):
```bash
docker compose up -d --build
```

Access services:
- **Client (Web UI)**: [http://localhost:3000](http://localhost:3000)
- **API Server & Health**: [http://localhost:5000/health](http://localhost:5000/health)

---

## 🌐 Live Production Hosting & Deployment

AutoApply AI supports three streamlined live hosting architectures:

### Option A: Monolithic Full-Stack Hosting (Render / Railway / VPS / EC2)
The backend Express server automatically compiles and serves the React SPA frontend from `client/dist` when hosted together:
1. **Repository**: Connect your GitHub repository to Render / Railway.
2. **Environment**: Node.js
3. **Build Command**: `npm run build`
4. **Start Command**: `npm start`
5. **Environment Variables**: Set the variables from `.env.example` (especially `MONGODB_URI`, `JWT_SECRET`, `AI_PROVIDER`, `GEMINI_API_KEY`).
6. The entire platform (Frontend, Backend REST API, 24/7 Autopilot Engine, Health Checks) is accessible on a single URL!

### Option B: Decoupled Hosting (Vercel Frontend + Render Backend)
- **Backend (Render / Railway)**:
  - Build Command: `npm run build:shared && npm run build:server`
  - Start Command: `npm start`
  - Set `CORS_ORIGIN=https://your-frontend.vercel.app`
- **Frontend (Vercel / Netlify)**:
  - Framework: Vite
  - Root Directory: `client`
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Environment Variable: `VITE_API_URL=https://your-backend-api.onrender.com`

### Option C: Containerized Deployment (Docker / Cloud Run / Kubernetes)
```bash
# Build and run the entire stack with single command
docker compose up -d --build
```

---

## 📄 License & Compliance
This software adheres strictly to authorized API standards, legal anti-spam requirements (CAN-SPAM / GDPR opt-out handling), and anti-bot website restrictions.

