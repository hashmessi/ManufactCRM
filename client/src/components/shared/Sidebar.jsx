import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { FiGrid, FiBarChart2, FiHome, FiSettings, FiLogOut, FiChevronsLeft, FiChevronsRight, FiBriefcase, FiZap } from 'react-icons/fi';
import useAuthStore from '../../store/authStore.js';

function FactoryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="20" width="6" height="12" rx="1" fill="#4f8cff" opacity="0.7" />
      <rect x="12" y="14" width="6" height="18" rx="1" fill="#7c5cff" opacity="0.85" />
      <rect x="20" y="8" width="6" height="24" rx="1" fill="#4f8cff" />
      <rect x="28" y="4" width="6" height="28" rx="1" fill="#a78bfa" opacity="0.75" />
      <rect x="4" y="30" width="30" height="2" rx="1" fill="#4f8cff" />
    </svg>
  );
}

export default function Sidebar({ collapsed, setCollapsed }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const isManager = user?.role === 'manager' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-bg-tertiary text-text-primary border-l-2 border-accent'
        : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary/50'
    }`;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-bg-secondary border-r border-border flex flex-col transition-all duration-300 z-30 shadow-premium-soft ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Workspace Switcher Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-bg-tertiary border border-border flex items-center justify-center shrink-0">
            <FactoryIcon />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text-primary leading-none">ManufactCRM</span>
              <span className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1 font-mono uppercase tracking-wider">
                <FiBriefcase className="w-2.5 h-2.5" /> Workspace
              </span>
            </div>
          )}
        </div>
        
        {/* Toggle Collapse Button */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
            title="Collapse sidebar"
          >
            <FiChevronsLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto dense-scrollbar">
        <NavLink to="/pipeline" className={navLinkClass}>
          <FiGrid className="w-4.5 h-4.5 shrink-0" />
          {!collapsed && <span>Pipeline</span>}
        </NavLink>

        {isManager && (
          <NavLink to="/analytics" className={navLinkClass}>
            <FiBarChart2 className="w-4.5 h-4.5 shrink-0" />
            {!collapsed && <span>Analytics</span>}
          </NavLink>
        )}

        <NavLink to="/dashboard" className={navLinkClass}>
          <FiHome className="w-4.5 h-4.5 shrink-0" />
          {!collapsed && <span>My Dashboard</span>}
        </NavLink>

        {isAdmin && (
          <NavLink to="/admin" className={navLinkClass}>
            <FiSettings className="w-4.5 h-4.5 shrink-0" />
            {!collapsed && <span>Admin</span>}
          </NavLink>
        )}
      </nav>

      {/* AI Assistant Quick Trigger / Section */}
      <div className="px-3 py-2 border-t border-border/40">
        <button
          onClick={() => {
            const btn = document.getElementById('ai-drawer-trigger');
            if (btn) btn.click();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent/15 transition-all"
        >
          <div className="flex items-center gap-2">
            <FiZap className="w-4 h-4 text-accent shrink-0 animate-pulse" />
            {!collapsed && <span className="text-xs font-semibold">AI Assistant</span>}
          </div>
          {!collapsed && <span className="text-[10px] bg-accent/20 px-1.5 py-0.5 rounded text-accent font-mono">INSIGHTS</span>}
        </button>
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="p-3 border-t border-border/50 bg-bg-secondary flex flex-col gap-2">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-bg-tertiary/40 border border-border/30">
            <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-text-primary truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-text-muted capitalize truncate">{user?.role || 'associate'}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-danger hover:bg-danger/10 transition-colors w-full ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Logout"
        >
          <FiLogOut className="w-4.5 h-4.5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-1 p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
            title="Expand sidebar"
          >
            <FiChevronsRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
