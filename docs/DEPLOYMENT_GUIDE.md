# AutoApply AI - Production Deployment Guide

## 1. Local Development (All Workspaces)

### Prerequisites
- Node.js 20+ (Node.js 22 or 24 recommended)
- MongoDB running locally or MongoDB Atlas URI (Persistent queue and database store)

```bash
# 1. Install dependencies across all workspaces
npm install

# 2. Build shared contracts
npm run build:shared

# 3. Start development servers concurrently
npm run dev:server
npm run dev:workers
npm run dev:client
```

Client: `http://localhost:3000`
API Server: `http://localhost:5000`

---

## 2. Docker Compose Deployment (Recommended)

Deploy the entire microservice stack (MongoDB, API, Workers, Nginx Client):

```bash
# Build and start all services in detached mode
docker compose up -d --build

# Inspect running containers
docker compose ps

# Follow logs
docker compose logs -f
```

---

## 3. Cloud Production Targets

### Frontend (Client) -> Vercel / Cloudflare Pages
- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `VITE_API_BASE_URL`: `https://api.yourdomain.com`

### Backend (Server) & Background Workers -> Render / Railway / AWS ECS
- Deploy API Server as Web Service:
  - Command: `npm run start`
  - Port: `5000`
  - Health Endpoint: `/health`
- Deploy Background Workers as Background Worker Service:
  - Command: `node workers/dist/index.js`
- Connect Managed MongoDB Atlas cluster (stores both application data and persistent background task queues).

