🚀 Week 7 — Deployment & DevOps Essentials: README

Objective: Deploy a full MERN stack application to production, implement CI/CD, configure environment variables, and set up monitoring and maintenance.

Table of Contents

Overview

Prerequisites

Repository Structure

Environment Variables (.env.example)

Preparing the App for Production

Frontend (React)

Backend (Express)

Database (MongoDB Atlas)

Deploying the Backend

Provider options

Example steps (Render / Railway / Heroku)

Custom domain & HTTPS

Monitoring & logging

Deploying the Frontend

Provider options

Example steps (Vercel / Netlify / GitHub Pages)

Caching strategies & headers

CI / CD (GitHub Actions)

CI workflow (tests, lint)

CD workflow (deploy to staging & prod)

Rollback strategy

Monitoring & Maintenance

Health checks & uptime

Error tracking

Performance monitoring

Backups & maintenance plan

Security & Production Hardening

Submission Checklist (for GitHub Classroom)

Troubleshooting & FAQs

Appendix: Sample GitHub Actions workflows and Nginx/proxy snippets

Overview

This README guides you through production-ready deployment of a MERN application: building the frontend, deploying the Express API, provisioning a managed MongoDB cluster, adding CI/CD with GitHub Actions, wiring environment variables securely, and configuring monitoring, logging, and backups.

Follow this file step-by-step and include the links/screenshots requested in the assignment submission.

Prerequisites

A completed MERN application in a GitHub repository

Accounts:

GitHub (repo + Actions)

MongoDB Atlas (cluster)

One backend host (Render, Railway or Heroku)

One frontend host (Vercel, Netlify, or GitHub Pages)

Optional: Sentry / Logflare / Datadog / New Relic for monitoring

Local tools (CLI): Node.js (v18+ recommended), npm or yarn, Git, Heroku/Render/Vercel CLIs (optional)

Repository Structure (recommended)

/ (root)
├─ frontend/ # React app (create-react-app, Vite, Next.js etc.)
├─ backend/ # Express app (server.js or app.js)
├─ .github/workflows/ # GitHub Actions CI/CD
├─ docker-compose.yml # Optional: local dev & testing
├─ README.md # This file
└─ .env.example # env var template

Environment Variables (.env.example)

Provide a .env.example (do NOT commit real secrets).

# backend/.env.example
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
LOG_LEVEL=info
CORS_ORIGIN=https://your-frontend.com


# frontend/.env.example (depending on framework, env names may require REACT_APP_ prefix)
VITE_API_URL=https://api.yourdomain.com
REACT_APP_API_URL=https://api.yourdomain.com

Notes:

Use your cloud provider's secrets manager or GitHub Actions Secrets for storing real values.

Keep separate envs for development, staging, and production.

Preparing the App for Production
Frontend (React)

Build

npm run build (or yarn build) to create optimized production assets (static files).

Performance & Bundling

Use code-splitting (dynamic import()), route-based splitting.

Tree-shake unused code; remove console logs.

Environment variables

Use framework-specific patterns (e.g., REACT_APP_ or Vite VITE_ prefixes)

Security

Avoid embedding secrets in frontend.

Set appropriate Content-Security-Policy (CSP) headers if using custom server.

Testing

Smoke test the build locally with a static server: npx serve build

Backend (Express)

Error handling

Centralized error middleware that never leaks stack traces in production.

Example: respond with generic message and log stack to the server logger.

Security headers

Use helmet() to add secure headers.

Configure CORS to only allow your frontend origin.

Logging

Use structured logs (pino, bunyan, or winston).

Send logs to a remote log aggregator in production.

Connection pooling

Use the official MongoDB driver’s connection pooling or Mongoose defaults—keep single instance across the app lifecycle.

Graceful shutdown

Handle SIGTERM/SIGINT to close DB connections and finish active requests.

Rate limiting & brute force protection

Add rate-limit middleware for sensitive endpoints.

MongoDB Atlas

Cluster

Create a production cluster (M0 for demo, M10+ for production workloads).

Database users & roles

Create a least-privilege DB user for your app.

Network access

Allow your app’s IP (or use VPC peering for private access).

Backups & maintenance

Enable automated backups and configure retention.

Deploying the Backend
Provider options

Render — good for simplicity, auto-deploys from GitHub, provides HTTPS by default.

Railway — easy DB + service integration and preview environments.

Heroku — classic PaaS, free tier deprecated but still common in classrooms.

Generic steps

Create a new project/service on provider and connect your GitHub repo.

Set environment variables/secrets in the provider dashboard.

Configure build/start command (e.g., npm install && npm run start:prod or node dist/server.js).

Ensure your server binds to process.env.PORT.

Enable automatic deploys from the chosen branch (e.g., main/master).

Custom domain & HTTPS

Add your domain in provider settings and verify ownership (DNS TXT or CNAME).

Providers provide TLS certificates (Let's Encrypt) automatically on domain attach.

Force HTTPS by redirecting HTTP -> HTTPS in Express or via provider settings.

Monitoring & Logging

Integrate with a log aggregator (Logflare, Papertrail, Datadog, or provider's built-in logs).

Set up uptime checks (UptimeRobot / provider health checks).

Deploying the Frontend
Provider options

Vercel — seamless with Next/Vite, automatic preview deployments.

Netlify — great for SPA and static sites.

GitHub Pages — acceptable for simple static builds (no serverless functions).

Generic steps

Connect your frontend repo to the provider.

Configure build command (npm run build) and publish directory (e.g., build or dist).

Add environment variables in the project settings (e.g., VITE_API_URL).

Configure automatic deploys from your chosen branch.

Custom domain & HTTPS

Add domain, configure DNS (A/CNAME records), and enable automatic TLS.

Caching & CDN strategies

Set long Cache-Control for immutable assets with content-hash filenames: cache-control: public, max-age=31536000, immutable.

Keep short TTL for index.html so users pick up new releases quickly: cache-control: public, max-age=0, must-revalidate.

Many hosts provide automatic asset hashing — ensure your build outputs hashed filenames.

CI / CD (GitHub Actions)

Store secrets in GitHub Repo Settings > Secrets and never commit them.

Example: CI workflow (tests + lint)

File: .github/workflows/ci.yml

name: CI
on: [push, pull_request]
jobs:
test-and-lint:
runs-on: ubuntu-latest
strategy:
matrix:
node-version: [18.x]
steps:
- uses: actions/checkout@v4
- name: Use Node.js
uses: actions/setup-node@v4
with:
node-version: ${{ matrix.node-version }}
- name: Install dependencies
run: |
cd backend && npm ci
cd ../frontend && npm ci
- name: Lint backend
run: cd backend && npm run lint
- name: Lint frontend
run: cd frontend && npm run lint
- name: Run backend tests
run: cd backend && npm test -- --coverage
- name: Run frontend tests
run: cd frontend && npm test -- --coverage
- name: Upload coverage
uses: actions/upload-artifact@v4
with:
name: coverage-report
path: |
backend/coverage
frontend/coverage

Example: CD workflow (deploy on push to main)

For providers like Render/Vercel you may rely on provider webhooks or automatic GitHub integration.

For custom deploys (e.g., Docker to a VM), use a GitHub Actions workflow that builds, tests, then pushes an image and updates the service.

Simple deploy to Heroku (example)

name: Deploy Backend to Heroku
on:
push:
branches: [ main ]
jobs:
deploy:
runs-on: ubuntu-latest
steps:
- uses: actions/checkout@v4
- name: Setup Node
uses: actions/setup-node@v4
with:
node-version: 18
- name: Install and build
run: |
cd backend && npm ci && npm run build
- name: Deploy to Heroku
uses: akhileshns/heroku-deploy@v3.12.12
with:
heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
heroku_app_name: 'your-heroku-app-name'
heroku_email: 'your-email@example.com'

Staging & Production

Use branch-based deployments (develop -> staging, main -> production).

Use separate environment variables and separate DB instances.

Rollback strategy

Keep a set number of releases/artifacts and support quick rollback via provider UI or scripts.

For Docker: tag images with semantic version and latest; rollback by re-deploying previous tag.

For static sites: revert the git commit and let automatic deploy re-publish.

Monitoring & Maintenance
Health checks

Implement a /health endpoint that checks DB connectivity, disk space and returns simple JSON.

Example response: { status: 'ok', db: 'ok', uptime: 12345 }.

Uptime checks

Configure UptimeRobot / Pingdom to hit /health every 1–5 minutes.

Error tracking

Use Sentry (frontend + backend) to capture and group exceptions; configure release tags.

Performance monitoring

Backend: Datadog / NewRelic / provider metrics.

Frontend: Lighthouse audits, Real User Monitoring (RUM) via Google Analytics, Sentry Performance, or Web Vitals.

Backups & DB maintenance

Enable automated backups in MongoDB Atlas; test restores periodically


Deployment Links
GitHub repo = https://github.com/PLP-MERN-Stack-Development/deployment-and-devops-essentials-Wambua-Richard.git
render = https://deployment-and-devops-essentials-wambua.onrender.com
vercel = https://mernapp-sand.vercel.app/