# ManufactCRM — Enterprise BDA Intelligence Platform

A full-stack, production-ready MERN CRM that provides Business Development Associate (BDA) teams in the manufacturing sector with a premium, robust command center for managing leads, tracking communication, and driving sales performance.

![ManufactCRM Pipeline](https://via.placeholder.com/1200x600?text=ManufactCRM+Dashboard)

## 🚀 Live Deployment
- **Frontend (Vercel)**: [ManufactCRM App](https://manufact-crm.vercel.app) *(Update with actual URL once deployed)*
- **Backend (Render)**: [ManufactCRM API](https://manufact-crm-backend.onrender.com) *(Update with actual URL once deployed)*

## 🔐 Test Login Credentials

Use the following test credentials to explore the different role-based views of the application:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@manufact.com` | `admin123` | Full access, user management, global analytics |
| **Manager** | `manager@manufact.com` | `manager123` | Team oversight, team analytics, assign leads |
| **Associate 1** | `ravi@manufact.com` | `assoc123` | Pipeline execution, log interactions |
| **Associate 2** | `priya@manufact.com` | `assoc123` | Pipeline execution, log interactions |

## 🛠 Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS v4, Zustand v5, React Router v7, Recharts, @dnd-kit (Kanban), Vitest for unit testing.
- **Backend**: Node.js, Express 5.2.x, MongoDB, Mongoose 9.6.x, JWT Authentication, Vitest for integration testing.

## ✨ Enterprise-Grade Features
- **Role-Based Access Control (RBAC)**: Secure access gating for Admins, Managers, and Associates.
- **Premium UI/UX**: Precision-dark theme with meticulously designed components, empty states, and micro-interactions.
- **Kanban Pipeline Engine**: Fluid drag-and-drop lead management integrated with data mutations.
- **Intelligent Lead Scoring**: Dynamic scoring algorithms analyzing deal value, interactions, velocity, and response times to surface hot prospects.
- **Activity & Interaction Timeline**: Comprehensive logging for calls, emails, meetings, and WhatsApp messages.
- **Real-time Analytics**: Visualized revenue attainment, pipeline run-rate predictions, sales funnels, and team performance metrics.
- **Smart Alerts**: Actionable notifications for overdue follow-ups, stale leads, and target milestones to maintain pipeline momentum.

## 💻 Getting Started (Local Development)

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (local or Atlas cluster)

### 1. Environment Setup
Create a `.env` file in the `server` directory based on `server/.env.example`. Make sure to set your MongoDB URI and JWT secrets.

### 2. Installation & Execution
Install dependencies for both server and client:
```bash
cd server
npm install

cd ../client
npm install --legacy-peer-deps
```

**Seed the database (Optional but recommended for testing):**
```bash
cd server
npm run seed
```

**Run the development servers:**
```bash
# Terminal 1: Backend (runs on port 5000)
cd server
npm run dev

# Terminal 2: Frontend (runs on port 5173)
cd client
npm run dev
```

## 🚀 Production Deployment Guide

### Backend (Render / Heroku)
1. Connect your GitHub repository to Render as a **Web Service**.
2. Set Root Directory to `server`.
3. Set Build Command to `npm install` and Start Command to `npm start`.
4. Configure essential Environment Variables:
   - `MONGO_URI`: Your secure MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random string for signing tokens.
   - `JWT_EXPIRES_IN`: e.g., `7d`.
   - `NODE_ENV`: `production`.
   - `CLIENT_URL`: The origin URL of your deployed frontend.

### Frontend (Vercel / Netlify)
1. Import the repository into Vercel.
2. Set Root Directory to `client`.
3. Select `Vite` as the framework preset.
4. Set the Environment Variable:
   - `VITE_API_URL`: The URL of your deployed backend API (e.g., `https://your-backend.onrender.com/api`).
5. Vercel automatically respects the configured `vercel.json` for React Router SPA rewrites.

## 🏗 Project Architecture
- `/client`: Vite + React frontend application
  - `/src/components`: Highly reusable, atomic UI elements categorized by domain (analytics, leads, pipeline, shared).
  - `/src/pages`: Top-level routing views.
  - `/src/store`: Zustand global state managers (auth, leads, notifications).
  - `/src/api`: Centralized Axios configuration and interceptors.
- `/server`: Express REST API backend
  - `/models`: Mongoose database schemas.
  - `/routes`: Protected and public API endpoints.
  - `/middleware`: JWT authentication and RBAC validation handlers.
  - `/utils`: Core business logic, such as the `scoreEngine`.
  - `/test`: Comprehensive backend test suites.
  - `/seed`: Scripts for initial database hydration.

---

*Built with precision to transform raw BDA efforts into measurable, predictable revenue growth.*
