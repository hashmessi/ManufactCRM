import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiMenu, FiCommand } from 'react-icons/fi';
import { useLocation } from 'react-router';
import NotificationBell from './NotificationBell.jsx';
import useAuthStore from '../../store/authStore.js';

export default function Topbar({ sidebarCollapsed, setSidebarCollapsed, onAIAssistantToggle }) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Ctrl/Cmd + K shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reactive to React Router — uses location.pathname not window.location
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/pipeline')) return 'Sales Pipeline';
    if (path.includes('/analytics')) return 'Executive Analytics';
    if (path.includes('/dashboard')) return 'My Performance';
    if (path.includes('/admin')) return 'Administrative Control';
    if (path.includes('/notifications')) return 'Action Reminders';
    if (path.includes('/leads/')) return 'Lead Record';
    return 'Dashboard';
  };

  const handleQuickAdd = async () => {
    // Navigate or trigger event
    const addBtn = document.getElementById('add-lead-btn');
    if (addBtn) {
      addBtn.click();
    } else {
      window.location.href = '/pipeline?add=true';
    }
  };

  return (
    <header className="h-16 bg-bg-secondary/85 backdrop-blur-md border-b border-border/50 sticky top-0 z-20 px-6 flex items-center justify-between shadow-premium-soft transition-all duration-300">
      <div className="flex items-center gap-4">
        {/* Toggle Sidebar Button for compact display */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
            title="Expand Sidebar"
          >
            <FiMenu className="w-5 h-5" />
          </button>
        )}
        
        {/* Page Breadcrumb Title */}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-text-primary leading-tight tracking-tight">
            {getPageTitle()}
          </span>
          <span className="text-[10px] text-text-muted mt-0.5">
            ManufactCRM Workspace
          </span>
        </div>
      </div>

      {/* Global Search Input & Quick Actions */}
      <div className="flex items-center gap-4 flex-1 max-w-xl mx-8">
        <div className="relative w-full group">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
          <input
            id="global-search"
            type="text"
            placeholder="Search records, activities, metrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-14 py-1.5 bg-bg-tertiary/60 border border-border/80 rounded-lg text-xs text-text-primary outline-none focus:border-accent/80 focus:bg-bg-tertiary transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-mono text-text-muted bg-bg-secondary px-1.5 py-0.5 border border-border/60 rounded pointer-events-none">
            <FiCommand className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Notifications, Quick Actions, and Drawer Triggers */}
      <div className="flex items-center gap-3">
        {/* Quick Add Button */}
        <button
          onClick={handleQuickAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white hover:bg-accent/90 rounded-lg text-xs font-semibold shadow-premium-soft transition-all"
        >
          <FiPlus className="w-3.5 h-3.5" />
          <span>Add Lead</span>
        </button>

        {/* Global Notifications Bell */}
        <div className="p-0.5 rounded-lg border border-border/60 bg-bg-tertiary/30">
          <NotificationBell />
        </div>

        <div className="w-px h-6 bg-border/50 mx-1" />

        {/* AI Drawer Trigger */}
        <button
          id="ai-drawer-trigger"
          onClick={onAIAssistantToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-tertiary border border-border text-text-primary hover:bg-bg-tertiary/80 transition-colors text-xs font-medium"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
          <span>AI Insights</span>
        </button>
      </div>
    </header>
  );
}
