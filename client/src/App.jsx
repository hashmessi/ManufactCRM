import React, { useEffect, useRef, Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router';
import { Toaster } from 'react-hot-toast';

import Sidebar from './components/shared/Sidebar.jsx';
import Topbar from './components/shared/Topbar.jsx';
import AIAssistantDrawer from './components/shared/AIAssistantDrawer.jsx';
import ProtectedRoute from './components/shared/ProtectedRoute.jsx';
import RoleGuard from './components/shared/RoleGuard.jsx';

const Login = lazy(() => import('./pages/Login.jsx'));
const Pipeline = lazy(() => import('./pages/Pipeline.jsx'));
const LeadDetailPage = lazy(() => import('./pages/LeadDetailPage.jsx'));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const MyDashboard = lazy(() => import('./pages/MyDashboard.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));
const Notifications = lazy(() => import('./pages/Notifications.jsx'));

function RouteLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
    </div>
  );
}

function AuthenticatedLayout() {
  const location = useLocation();
  const mainRef = useRef(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.style.opacity = '0';
      mainRef.current.style.transform = 'translateY(8px)';
      requestAnimationFrame(() => {
        if (mainRef.current) {
          mainRef.current.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          mainRef.current.style.opacity = '1';
          mainRef.current.style.transform = 'translateY(0)';
        }
      });
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* 2. Main content container, shifts based on sidebar expand state */}
      <div 
        className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'pl-16' : 'pl-64'
        }`}
      >
        {/* Top Header Bar */}
        <Topbar 
          sidebarCollapsed={sidebarCollapsed} 
          setSidebarCollapsed={setSidebarCollapsed} 
          onAIAssistantToggle={() => setAiAssistantOpen(!aiAssistantOpen)} 
        />

        {/* Content Body */}
        <main ref={mainRef} className="flex-1 px-8 py-6 overflow-y-auto">
          <Suspense fallback={<RouteLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {/* 3. Collapsible AI Assistant Panel */}
      <AIAssistantDrawer 
        isOpen={aiAssistantOpen} 
        onClose={() => setAiAssistantOpen(false)} 
      />
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
        <Route path="/login" element={<Suspense fallback={<RouteLoader />}><Login /></Suspense>} />

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
