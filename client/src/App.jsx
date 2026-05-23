import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/shared/Navbar.jsx';
import ProtectedRoute from './components/shared/ProtectedRoute.jsx';
import RoleGuard from './components/shared/RoleGuard.jsx';

import Login from './pages/Login.jsx';
import Pipeline from './pages/Pipeline.jsx';
import LeadDetailPage from './pages/LeadDetailPage.jsx';
import Analytics from './pages/Analytics.jsx';
import MyDashboard from './pages/MyDashboard.jsx';
import Admin from './pages/Admin.jsx';
import Notifications from './pages/Notifications.jsx';

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1d29',
            color: '#f1f5f9',
            border: '1px solid #2d3348',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#1a1d29' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#1a1d29' },
          },
        }}
      />

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <AuthenticatedLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/pipeline" replace />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
          <Route
            path="analytics"
            element={
              <RoleGuard allowedRoles={['manager', 'admin']}>
                <Analytics />
              </RoleGuard>
            }
          />
          <Route path="dashboard" element={<MyDashboard />} />
          <Route
            path="admin"
            element={
              <RoleGuard allowedRoles={['admin']}>
                <Admin />
              </RoleGuard>
            }
          />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        <Route path="*" element={<Navigate to="/pipeline" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
