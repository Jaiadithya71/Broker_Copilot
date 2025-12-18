# Broker Copilot

Broker Copilot is a clinical-grade, AI-driven insurance brokerage management system. It orchestrates data from **HubSpot CRM** and **Google Workspace (Gmail & Calendar)** to provide a unified, prioritized view of insurance renewals, enriched with deep communication history and AI-generated insights.

---

## Core Features

### Intelligent Renewal Analytics
- **Multi-Factor Priority Scoring**: Dynamic scores (1-100) based on Time Urgency, Deal Value, Engagement Level, Deal Stage, and Contact Quality.
- **Visual Breakdown**: Intuitive status bars explain exactly *why* a renewal is high priority.
- **What-If Simulator**: Model different scenarios by adjusting variables (premium, days left) to see real-time priority impacts.

### Seamless Data Orchestration
- **HubSpot Integration**: Real-time sync of deals and contact properties.
- **Google Workspace Sync**: Intelligent matching of Gmail threads and Calendar events to HubSpot deals.
- **Incognito Persistence**: Secure AES-256 encryption. System operates in **Incognito Mode**, wiping tokens from disk upon server shutdown for maximum security.

### AI-Powered Workflow
- **Professional Briefs**: Gemini-powered summaries of deal status and ghosting detection, delivered in a clean, emoji-free format.
- **Smart Outreach**: Auto-generated email templates personalized with policy details and recent interaction context.
- **PDF Generation**: Instantly generate professional PDF briefs for client reports.

### Integrated Scheduling & Connectivity
- **Backend Connectivity Guard**: Automatic detection and recovery system that masks the UI with high-fidelity loading/offline screens if the server is unreachable.
- **Automatic Initialization**: Background sync is automatically triggered upon login, ensuring the workspace is populated without manual intervention.
- **Communication Timeline**: A centralized view of all emails and meetings related to a specific client.

---

## Project Structure

```text
Broker_Copilot/
├── backend/                # Node.js Express Server
│   ├── src/
│   │   ├── connectors/     # HubSpot & Google API Logic
│   │   ├── services/       # Data Orchestrator & AI Logic
│   │   ├── utils/          # Score Calculator & PDF Generator
│   │   └── routes/         # API Endpoints & OAuth
│   ├── tests/              # Comprehensive Test Suite (15 Tests)
│   └── data/               # Persistent Storage (Encrypted)
├── frontend/               # React (Vite) Frontend
│   ├── src/
│   │   ├── components/     # UI Components (Dashboard, Timeline, etc.)
│   │   └── hooks/          # Data Fetching & Sync State
└── start.ps1               # Portable Startup Script
```

---

## Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **API Keys**: Google OAuth Client, HubSpot Client, and Gemini API Key.

### 2. Environment Setup
Create a `.env` file in the `backend/` directory:
```env
PORT=4000
ENCRYPTION_KEY=your_key
HUBSPOT_CLIENT_ID=...
HUBSPOT_CLIENT_SECRET=...
HUBSPOT_REDIRECT_URI=http://localhost:4000/auth/hubspot/callback
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:4000/auth/google/callback
GEMINI_API_KEY=...
FRONTEND_URL=http://localhost:3000
```

### 3. Installation & Startup
```powershell
./start.ps1
```

---

## Verification & Testing
The system includes a robust test suite covering 100% of core business logic.

**Run All Tests:**
```bash
cd backend
npm test
```
*Current Status: 15/15 passing (Scoring, Matching, Encryption, PDF, API).*

---

## Summary of Completion
The Broker Copilot is a fully professionalized, end-to-end solution.
- **Secure Auth**: Encrypted token handling with automatic cleanup.
- **Intelligent Loading**: Unified connectivity guard with automatic Hubspot/Google synchronization.
- **Professional UI/UX**: Clean, emoji-free interface with high-fidelity glassmorphism overlays.
- **Stability**: Comprehensive testing ensuring zero-regression across all core modules.

---

**Lead Developers**: Jai Adithya A, Kiran Soorya R S, Veeresh, Arya Chigare

**Status**: 100% Completed
