import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { FiMenu, FiX, FiLogOut, FiBarChart2, FiGrid, FiHome, FiSettings } from 'react-icons/fi';
import useAuthStore from '../../store/authStore.js';
import NotificationBell from './NotificationBell.jsx';

// Inline SVG factory/pipeline icon — matches login page logo
function FactoryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="20" width="6" height="12" rx="1" fill="#6366f1" opacity="0.7" />
      <rect x="12" y="14" width="6" height="18" rx="1" fill="#8b5cf6" opacity="0.85" />
      <rect x="20" y="8" width="6" height="24" rx="1" fill="#6366f1" />
      <rect x="28" y="4" width="6" height="28" rx="1" fill="#a78bfa" opacity="0.75" />
      <rect x="4" y="30" width="30" height="2" rx="1" fill="#4f46e5" />
    </svg>
  );
}

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getRoleRingClass(role) {
  switch (role) {
    case 'admin': return 'avatar-ring-admin';
    case 'manager': return 'avatar-ring-manager';
    default: return 'avatar-ring-associate';
  }
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isManager = user?.role === 'manager' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  const navLinkClass = ({ isActive }) =>
    `nav-link-v2 ${isActive ? 'active' : ''}`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'text-text-primary bg-accent/10'
        : 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary'
    }`;

  return (
    <nav
      className="navbar"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/pipeline" className="flex items-center gap-2.5 group" id="nav-logo">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <FactoryIcon />
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:block">
              ManufactCRM
            </span>
          </NavLink>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/pipeline" className={navLinkClass} id="nav-pipeline">
              <FiGrid className="w-4 h-4" />
              Pipeline
            </NavLink>

            {isManager && (
              <NavLink to="/analytics" className={navLinkClass} id="nav-analytics">
                <FiBarChart2 className="w-4 h-4" />
                Analytics
              </NavLink>
            )}

            <NavLink to="/dashboard" className={navLinkClass} id="nav-dashboard">
              <FiHome className="w-4 h-4" />
              My Dashboard
            </NavLink>

            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass} id="nav-admin">
                <FiSettings className="w-4 h-4" />
                Admin
              </NavLink>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <NotificationBell />

            {/* User info + Avatar with role ring */}
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-border/50">
              <div className="text-right">
                <p className="text-sm font-medium text-text-primary leading-tight">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-text-muted capitalize">
                  {user?.role || 'associate'}
                </p>
              </div>
              <div className={`avatar-ring ${getRoleRingClass(user?.role)}`}>
                {getInitials(user?.name)}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all duration-200"
              aria-label="Logout"
              id="nav-logout-btn"
            >
              <FiLogOut className="w-4 h-4" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-all duration-200"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileOpen}
              id="nav-mobile-toggle"
            >
              {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 animate-slideDown">
          <div className="px-4 py-3 space-y-1">
            <NavLink
              to="/pipeline"
              className={mobileNavLinkClass}
              onClick={() => setMobileOpen(false)}
              id="nav-mobile-pipeline"
            >
              <FiGrid className="w-5 h-5" />
              Pipeline
            </NavLink>

            {isManager && (
              <NavLink
                to="/analytics"
                className={mobileNavLinkClass}
                onClick={() => setMobileOpen(false)}
                id="nav-mobile-analytics"
              >
                <FiBarChart2 className="w-5 h-5" />
                Analytics
              </NavLink>
            )}

            <NavLink
              to="/dashboard"
              className={mobileNavLinkClass}
              onClick={() => setMobileOpen(false)}
              id="nav-mobile-dashboard"
            >
              <FiHome className="w-5 h-5" />
              My Dashboard
            </NavLink>

            {isAdmin && (
              <NavLink
                to="/admin"
                className={mobileNavLinkClass}
                onClick={() => setMobileOpen(false)}
                id="nav-mobile-admin"
              >
                <FiSettings className="w-5 h-5" />
                Admin
              </NavLink>
            )}

            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center gap-3 px-4 py-2">
                <div className={`avatar-ring ${getRoleRingClass(user?.role)}`}>
                  {getInitials(user?.name)}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{user?.name || 'User'}</p>
                  <p className="text-xs text-text-muted capitalize">{user?.role || 'associate'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
