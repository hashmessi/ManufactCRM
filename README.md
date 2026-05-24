<div align="center">

<!-- LOGO BANNER -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=6366f1&height=180&section=header&text=ManufactCRM&fontSize=52&fontColor=ffffff&fontAlignY=38&desc=Enterprise%20BDA%20Intelligence%20Platform&descAlignY=58&descColor=a5b4fc" width="100%" />

<br/>

<!-- BADGES ROW 1 -->
<p>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5.2.x-000000?style=for-the-badge&logo=express&logoColor=white" />
</p>

<!-- BADGES ROW 2 -->
<p>
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Zustand-v5-FF4154?style=for-the-badge" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
</p>

<!-- STATUS BADGES -->
<p>
  <img src="https://img.shields.io/badge/Deployment-Live-10b981?style=for-the-badge&logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/Tests-Passing-10b981?style=for-the-badge&logo=vitest&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-6366f1?style=for-the-badge" />
</p>

<br/>

> **A production-grade, role-based CRM built for manufacturing BDA teams.**  
> Kanban pipeline · AI lead scoring · Real-time analytics · Smart alerts — in one precision-dark dashboard.

<br/>

<!-- LIVE LINKS -->
<a href="https://manufact-crm-wine.vercel.app">
  <img src="https://img.shields.io/badge/🌐_Live_App-manufact--crm--wine.vercel.app-6366f1?style=for-the-badge" />
</a>
&nbsp;
<a href="https://manufactcrm.onrender.com/">
  <img src="https://img.shields.io/badge/⚙️_API_Server-manufactcrm.onrender.com-8b5cf6?style=for-the-badge" />
</a>

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Architecture](#-system-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Test Credentials](#-test-credentials)
- [Local Setup](#-local-setup)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Lead Scoring Engine](#-lead-scoring-engine)

---

## 🎯 Overview

ManufactCRM eliminates the fragmentation that kills BDA team performance in manufacturing — no more leads tracked in Excel, follow-ups on WhatsApp, and reports assembled manually every Monday.

```
Before ManufactCRM                    After ManufactCRM
─────────────────────────────────     ─────────────────────────────────
📊 Excel sheets for lead tracking  →  🎯 Kanban pipeline with drag-drop
💬 WhatsApp for client comms       →  📋 Structured interaction timeline
📧 Email threads for follow-ups    →  🔔 Automated overdue alerts
🗣️ Verbal updates to manager       →  📈 Real-time team dashboards
❓ No lead prioritization           →  ⚡ AI-powered lead scoring (0-100)
```

**Built for:** Isaii AI · MERN Stack Intern Technical Assessment · Module #5

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Vercel)                          │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  React   │  │  Zustand │  │ React    │  │   Recharts   │   │
│  │    18    │  │    v5    │  │ Router 7 │  │  + dnd-kit   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       └─────────────┴─────────────┴────────────────┘           │
│                            │ Axios                              │
└────────────────────────────┼────────────────────────────────────┘
                             │ HTTPS / REST
┌────────────────────────────┼────────────────────────────────────┐
│                    SERVER (Render)                              │
│                            │                                    │
│  ┌─────────────────────────▼──────────────────────────────┐    │
│  │              Express 5.2 REST API                       │    │
│  │                                                         │    │
│  │  /auth  /leads  /interactions  /analytics  /reminders  │    │
│  └───────────┬──────────────────────────────┬─────────────┘    │
│              │ Mongoose ODM                 │ scoreEngine       │
│  ┌───────────▼──────────────┐   ┌──────────▼─────────────┐    │
│  │     MongoDB Atlas        │   │   JWT + bcrypt Auth     │    │
│  │  (5 Collections)         │   │   RBAC Middleware        │    │
│  └──────────────────────────┘   └────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Request Lifecycle

```
Browser Request
     │
     ▼
Axios Interceptor (attach JWT)
     │
     ▼
Express Router
     │
     ├─► verifyToken middleware → 401 if invalid
     │
     ├─► requireRole middleware → 403 if insufficient role
     │
     ▼
Route Handler
     │
     ├─► Mongoose Query → MongoDB Atlas
     │
     ├─► scoreEngine (if lead mutation)
     │
     ▼
JSON Response → React State (Zustand) → UI Update
```

---

## ✨ Features

### 🔐 Role-Based Access Control (3-Tier)

```
┌─────────────────────────────────────────────────────────┐
│                    RBAC Matrix                          │
├──────────────────┬──────────┬───────────┬──────────────┤
│ Feature          │  Admin   │  Manager  │  Associate   │
├──────────────────┼──────────┼───────────┼──────────────┤
│ Full pipeline    │    ✅    │     ✅    │  Own leads   │
│ Team analytics   │    ✅    │     ✅    │      ❌      │
│ User management  │    ✅    │     ❌    │      ❌      │
│ Set targets      │    ✅    │     ❌    │      ❌      │
│ Assign leads     │    ✅    │     ✅    │      ❌      │
│ Log interactions │    ✅    │     ✅    │      ✅      │
│ Own dashboard    │    ✅    │     ✅    │      ✅      │
│ Notifications    │    ✅    │     ✅    │      ✅      │
└──────────────────┴──────────┴───────────┴──────────────┘
```

### 🎯 Kanban Pipeline Engine

7-stage drag-and-drop pipeline with live deal value tracking per column:

```
  New          Contacted     Qualified    Proposal     Negotiation    Won          Lost
  ──────       ─────────     ─────────    ────────     ───────────    ───          ────
  [Lead]  →   [Lead]    →   [Lead]   →   [Lead]   →   [Lead]     →  [Lead]   →   [Lead]
   ₹2.4M        ₹1.8M         ₹3.1M        ₹5.2M        ₹1.9M        ₹4.5M         ₹0.8M
   4 leads      6 leads       3 leads      5 leads      2 leads      8 leads       2 leads
```

### ⚡ Intelligent Lead Scoring

```
Score = dealValueScore (30) + interactionScore (25) + velocityScore (20) + responseScore (15) + bonus (10)
                                                                                         Max: 100

  🔴 Hot   80–100  ████████████████████  Surface immediately
  🟡 Warm  50–79   █████████████         Keep engaged
  🔵 Cold  0–49    ██████                Re-evaluate or drop
```

### 📈 Analytics Dashboard

```
  Revenue vs Target (Bar)     Pipeline Funnel          Team Leaderboard
  ────────────────────────    ────────────────────     ────────────────────
  │ ████ │ ██   │            New ████████ 12          #1 Ravi K    94%  ↑
  │ ████ │ ████ │            Con ███████  10          #2 Priya M   81%  ↑
  │ ████ │ ████ │            Qua █████    7           #3 Arjun S   67%  →
  │ ████ │ ████ │            Pro ████     5           #4 Meena R   52%  ↓
  └──────┴──────┘            Neg ██       3
  Actual  Target             Won █        1
```

---

## 🛠 Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 18 | Component architecture |
| **Build Tool** | Vite | 5.x | Dev server, HMR, bundling |
| **Styling** | Tailwind CSS | v4 | Utility-first precision-dark theme |
| **State** | Zustand | v5 | Global store, no prop-drilling |
| **Routing** | React Router | v7 | SPA navigation, protected routes |
| **Charts** | Recharts | latest | Revenue, funnel, trend charts |
| **Drag/Drop** | @dnd-kit | latest | Kanban board interactions |
| **Testing (FE)** | Vitest | latest | Unit tests for components |
| **Backend** | Node.js | 18+ | Runtime |
| **Framework** | Express | 5.2.x | REST API routing |
| **Database** | MongoDB | Atlas | Document storage |
| **ODM** | Mongoose | 9.6.x | Schema + query abstraction |
| **Auth** | JWT + bcrypt | latest | Stateless auth + password hashing |
| **Testing (BE)** | Vitest | latest | Integration test suites |
| **Deployment (FE)** | Vercel | — | CDN + SPA routing |
| **Deployment (BE)** | Render | — | Web service hosting |

---

## 🗄 Database Schema

### Collections Overview

```
manufact-crm (MongoDB Atlas)
├── users         — Auth, roles, monthly targets
├── leads         — Companies, contacts, pipeline stage, score
├── interactions  — Call/email/meeting logs per lead
├── deals         — Closed won leads with revenue
└── notifications — Alerts per user (follow-up, stale, target)
```

### Schema Diagram

```
User
├── _id: ObjectId
├── name: String (required)
├── email: String (unique)
├── password: String (bcrypt)
├── role: Enum [admin | manager | associate]
├── target: Number (monthly INR target)
└── manager: ObjectId → User (self-ref)

Lead
├── _id: ObjectId
├── companyName: String
├── industry: String
├── contactPerson: { name, email, phone, designation }
├── stage: Enum [New | Contacted | Qualified | Proposal Sent | Negotiation | Won | Lost]
├── dealValue: Number (INR)
├── score: Number (0–100, computed by scoreEngine)
├── scoreBreakdown: { dealValueScore, interactionScore, velocityScore, responseScore, bonus }
├── assignedTo: ObjectId → User
├── source: Enum [referral | cold_outreach | inbound | exhibition | other]
├── nextFollowUp: Date
├── proposalSent: Boolean
├── stageChangedAt: Date (velocity tracking)
└── notes: String

Interaction
├── _id: ObjectId
├── lead: ObjectId → Lead
├── type: Enum [call | email | meeting | whatsapp | other]
├── date: Date
├── duration: Number (minutes, for calls)
├── outcome: String
├── nextAction: String
└── loggedBy: ObjectId → User

Deal
├── _id: ObjectId
├── lead: ObjectId → Lead
├── closedBy: ObjectId → User
├── revenue: Number (actual closed)
├── expectedValue: Number (original deal)
├── closedAt: Date
└── month: String (e.g. "2026-05" for aggregation)

Notification
├── _id: ObjectId
├── user: ObjectId → User
├── type: Enum [follow_up_due | stale_lead | target_alert | lead_assigned]
├── lead: ObjectId → Lead (optional)
├── message: String
└── read: Boolean
```

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | ❌ | Issue JWT token |
| `GET` | `/api/auth/me` | ✅ | Current user profile |

### Leads
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/leads` | ✅ | All leads (role-scoped, filterable) |
| `POST` | `/api/leads` | ✅ | Create lead + auto-score |
| `GET` | `/api/leads/:id` | ✅ | Single lead + interaction history |
| `PATCH` | `/api/leads/:id` | ✅ | Update lead fields |
| `PATCH` | `/api/leads/:id/stage` | ✅ | Pipeline stage transition |
| `DELETE` | `/api/leads/:id` | Admin | Hard delete |
| `POST` | `/api/leads/:id/score` | ✅ | Recompute lead score |

### Interactions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/interactions?leadId=` | ✅ | Interaction timeline for lead |
| `POST` | `/api/interactions` | ✅ | Log new interaction |
| `DELETE` | `/api/interactions/:id` | ✅ | Remove log entry |

### Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/analytics/team` | Mgr+ | Team KPIs, leaderboard |
| `GET` | `/api/analytics/pipeline` | ✅ | Funnel counts per stage |
| `GET` | `/api/analytics/revenue` | Mgr+ | Revenue vs target per rep |
| `GET` | `/api/analytics/trends` | Mgr+ | Monthly deals/revenue trend |

### Users & Targets
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/users` | Admin | All users |
| `POST` | `/api/users` | Admin | Create new user |
| `PATCH` | `/api/users/:id/target` | Admin | Set monthly target |
| `GET` | `/api/users/team` | Mgr | Manager's team members |

### Reminders & Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/reminders/overdue` | ✅ | Leads past follow-up date |
| `GET` | `/api/reminders/stale` | ✅ | Leads with no activity 7+ days |
| `GET` | `/api/notifications` | ✅ | User notification list |
| `PATCH` | `/api/notifications/:id/read` | ✅ | Mark notification as read |

---

## 🔐 Test Credentials

| Role | Email | Password | What You Can See |
|------|-------|----------|-----------------|
| **Admin** | `admin@manufact.com` | `admin123` | Everything — user management, all reports, global pipeline |
| **Manager** | `manager@manufact.com` | `manager123` | Team pipeline, rep KPIs, leaderboard, assign leads |
| **Associate 1** | `ravi@manufact.com` | `assoc123` | Own leads, interaction log, personal dashboard |
| **Associate 2** | `priya@manufact.com` | `assoc123` | Own leads, interaction log, personal dashboard |

> **Tip:** Login as Admin first to see the full system. Then switch to Associate to see how role-scoping restricts the view.

---

## 💻 Local Setup

### Prerequisites

```bash
node --version  # v18 or higher
npm --version   # v9 or higher
# MongoDB Atlas account (free tier sufficient)
```

### Step 1 — Clone

```bash
git clone https://github.com/YOUR_USERNAME/manufact-crm.git
cd manufact-crm
```

### Step 2 — Environment Variables

Create `server/.env` from the example:

```bash
cp server/.env.example server/.env
```

Fill in the values:

```env
MONGO_URI=mongodb+srv://manufact_admin:<password>@manufact-crm.xxxxx.mongodb.net/manufact-crm?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3 — Install Dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install --legacy-peer-deps
```

### Step 4 — Seed Database

```bash
cd server
npm run seed
```

Expected output:
```
✅ Connected to MongoDB
🗑️  Cleared existing data
👥 Created 4 users (admin, manager, 2 associates)
🏭 Created 22 manufacturing leads
💬 Created 45 interaction logs
🏆 Created 3 closed deals
🔔 Created 8 notifications
✅ Seeding complete
```

### Step 5 — Start Dev Servers

```bash
# Terminal 1 — Backend (port 5000)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
cd client && npm run dev
```

Open: [http://localhost:5173](http://localhost:5173)

---

## 🚀 Deployment

### Backend → Render

```
Service Type:    Web Service
Root Directory:  server
Build Command:   npm install
Start Command:   npm start
```

Environment Variables on Render:
```
MONGO_URI       = <your Atlas connection string>
JWT_SECRET      = <secure random string>
JWT_EXPIRES_IN  = 7d
NODE_ENV        = production
CLIENT_URL      = https://manufact-crm-wine.vercel.app
```

### Frontend → Vercel

```
Root Directory:    client
Framework Preset:  Vite
```

Environment Variables on Vercel:
```
VITE_API_URL = https://manufactcrm.onrender.com/api
```

> **Note:** `vercel.json` is pre-configured for React Router SPA rewrites. No additional setup needed.

---

## 📁 Project Structure

```
manufact-crm/
│
├── client/                          # React 18 + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js             # Axios instance + JWT interceptors
│   │   ├── components/
│   │   │   ├── analytics/
│   │   │   │   ├── FunnelChart.jsx  # Recharts pipeline funnel
│   │   │   │   ├── RepCard.jsx      # Individual rep KPI card
│   │   │   │   ├── RevenueChart.jsx # Bar chart: actual vs target
│   │   │   │   ├── Sparkline.jsx    # 7-pt inline trend chart
│   │   │   │   ├── TeamDashboard.jsx
│   │   │   │   └── TrendIndicator.jsx
│   │   │   ├── leads/
│   │   │   │   ├── LeadForm.jsx     # Create/edit modal
│   │   │   │   └── ScoreBadge.jsx   # SVG ring score badge
│   │   │   ├── pipeline/
│   │   │   │   ├── KanbanBoard.jsx  # Board + DnD orchestration
│   │   │   │   ├── LeadCard.jsx     # Draggable card
│   │   │   │   └── StageColumn.jsx  # Column with drop zone
│   │   │   ├── reminders/
│   │   │   │   └── ReminderSidebar.jsx
│   │   │   └── shared/
│   │   │       ├── AsyncButton.jsx
│   │   │       ├── EmptyState.jsx
│   │   │       ├── Navbar.jsx
│   │   │       ├── ProtectedRoute.jsx
│   │   │       └── RoleGuard.jsx
│   │   ├── pages/
│   │   │   ├── Admin.jsx            # User management (admin only)
│   │   │   ├── Analytics.jsx        # Team analytics (mgr+)
│   │   │   ├── LeadDetailPage.jsx   # Lead + interaction timeline
│   │   │   ├── Login.jsx            # Split-layout auth page
│   │   │   ├── MyDashboard.jsx      # Personal associate view
│   │   │   ├── Notifications.jsx
│   │   │   └── Pipeline.jsx         # Kanban board view
│   │   ├── store/
│   │   │   ├── authStore.js         # Auth state + JWT persistence
│   │   │   ├── leadStore.js         # Lead CRUD + optimistic updates
│   │   │   └── notificationStore.js
│   │   ├── App.jsx                  # Router + layout
│   │   ├── index.css                # Tailwind v4 + custom theme
│   │   └── main.jsx
│   ├── .env
│   ├── vercel.json                  # SPA rewrite rules
│   └── vite.config.js
│
├── server/                          # Express 5 REST API
│   ├── middleware/
│   │   ├── auth.js                  # verifyToken
│   │   └── roleGuard.js             # requireRole('admin')
│   ├── models/
│   │   ├── Deal.js
│   │   ├── Interaction.js
│   │   ├── Lead.js
│   │   ├── Notification.js
│   │   └── User.js
│   ├── routes/
│   │   ├── analytics.js
│   │   ├── auth.js
│   │   ├── interactions.js
│   │   ├── leads.js
│   │   ├── reminders.js
│   │   └── users.js
│   ├── seed/
│   │   └── seedData.js              # 22 Indian manufacturing leads
│   ├── test/
│   │   └── *.test.js                # Vitest integration tests
│   ├── utils/
│   │   └── scoreEngine.js           # Lead scoring algorithm
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

## ⚡ Lead Scoring Engine

The scoring algorithm runs on every lead create/update and produces a 0–100 score that determines the lead's priority tier.

```
┌─────────────────────────────────────────────────────────────┐
│                   SCORE COMPOSITION                         │
├──────────────────────────┬──────────┬───────────────────────┤
│ Component                │ Max Pts  │ Logic                 │
├──────────────────────────┼──────────┼───────────────────────┤
│ Deal Value               │   30     │ (value / maxDeal) × 30│
│ Interaction Frequency    │   25     │ min(count × 5, 25)    │
│ Stage Velocity           │   20     │ 20 - (daysInStage × 2)│
│ Response Time            │   15     │ ≤1d:15 ≤3d:10 ≤7d:5  │
│ Proposal Bonus           │   10     │ proposalSent ? 10 : 0 │
├──────────────────────────┼──────────┼───────────────────────┤
│ TOTAL (capped at 100)    │  100     │                       │
└──────────────────────────┴──────────┴───────────────────────┘

Score Tiers:
  🔴 Hot  (80–100): Surface to top of pipeline, alert manager
  🟡 Warm (50–79):  Active engagement, schedule next touchpoint
  🔵 Cold (0–49):   Re-evaluate strategy or redistribute
```

---

## 🧪 Running Tests

```bash
# Backend integration tests
cd server && npm test

# Frontend unit tests
cd client && npm test
```

---

## 📄 License

MIT — Built for the Isaii AI MERN Stack Developer Intern Technical Assessment.

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=6366f1&height=100&section=footer" width="100%" />

<p>
  <strong>ManufactCRM</strong> — Built with precision to transform raw BDA effort into predictable revenue growth.
</p>

<p>
  <img src="https://img.shields.io/badge/Made_with-MERN_Stack-6366f1?style=flat-square" />
  <img src="https://img.shields.io/badge/Deployed_on-Vercel_%2B_Render-black?style=flat-square" />
  <img src="https://img.shields.io/badge/Assessment-Isaii_AI-8b5cf6?style=flat-square" />
</p>

</div>
