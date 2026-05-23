# ManufactCRM — BDA Team Intelligence Platform

A full-stack MERN CRM that gives Business Development Associate (BDA) teams in manufacturing a single command center for leads, communication, and performance.

## Live Deployment (Add URLs here)
- **Frontend (Vercel)**: [Deploy URL](https://manufact-crm.vercel.app) *(Update with your actual URL)*
- **Backend (Render)**: [Backend URL](https://manufact-crm-backend.onrender.com) *(Update with your actual URL)*

## Test Login Credentials
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@manufact.com` | `admin123` |
| **Manager** | `manager@manufact.com` | `manager123` |
| **Associate 1** | `ravi@manufact.com` | `assoc123` |
| **Associate 2** | `priya@manufact.com` | `assoc123` |

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS v4, Zustand v5, React Router v7, Recharts, @dnd-kit (Kanban)
- **Backend**: Node.js, Express 5.2.x, MongoDB, Mongoose 9.6.x, JWT Authentication

## Features
- **Role-based Access Control (RBAC)**: Admin, Manager, and Associate views.
- **Kanban Pipeline**: Drag-and-drop lead management.
- **Lead Scoring Engine**: Intelligent scoring based on deal value, interactions, velocity, response time, and proposals.
- **Interaction Logging**: Track calls, emails, meetings, and WhatsApp messages with timeline views.
- **Real-time Analytics**: Visualized revenue vs targets, sales funnels, and team performance metrics.
- **Smart Reminders**: Alerts for overdue follow-ups and stale leads to maintain pipeline momentum.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (local or Atlas cluster)

### Environment Setup
Create a `.env` file in the `server` directory based on `server/.env.example`.

### Installation & Execution

1. **Install dependencies for both server and client:**
   ```bash
   cd server
   npm install
   
   cd ../client
   npm install --legacy-peer-deps
   ```

2. **Seed the database (Optional but recommended for testing):**
   ```bash
   cd server
   npm run seed
   ```

3. **Run the development servers:**
   - **Backend** (port 5000):
     ```bash
     cd server
     npm run dev
     ```
   - **Frontend** (port 5173):
     ```bash
     cd client
     npm run dev
     ```

## Production Deployment Guide

### 1. Backend (Render)
1. Sign in to [Render](https://render.com) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add the following **Environment Variables**:
   - `MONGO_URI`: Your MongoDB Atlas URI.
   - `JWT_SECRET`: A secure secret string (e.g., `manufact_super_secret_2026`).
   - `JWT_EXPIRES_IN`: `7d`
   - `PORT`: `10000` (Render will override this, but good to set a fallback)
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: The URL of your Vercel frontend (e.g., `https://your-app.vercel.app`).

### 2. Frontend (Vercel)
1. Sign in to [Vercel](https://vercel.com) and create a **New Project**.
2. Connect your GitHub repository.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
4. Add the following **Environment Variable**:
   - `VITE_API_URL`: The URL of your Render backend API service (e.g., `https://your-service.onrender.com/api`).
5. Vercel will automatically read `vercel.json` and configure routing redirects so that React Router links load properly on page refreshes.

## Project Structure
- `/client`: Vite + React frontend application.
  - `/src/components`: Reusable UI elements, grouped by feature.
  - `/src/pages`: Main view routes.
  - `/src/store`: Zustand state stores.
  - `/src/api`: Axios instance configuration.
- `/server`: Express API backend.
  - `/models`: Mongoose database schemas.
  - `/routes`: API route definitions.
  - `/middleware`: Authentication and validation handlers.
  - `/utils`: Helper functions like the score engine.
  - `/seed`: Database seeding scripts.

