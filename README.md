# ManufactCRM — BDA Team Intelligence Platform

A full-stack MERN CRM that gives Business Development Associate (BDA) teams in manufacturing a single command center for leads, communication, and performance.

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
   npm install
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
