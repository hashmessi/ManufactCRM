import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { FiMenu, FiX, FiLogOut, FiBarChart2, FiGrid, FiHome, FiSettings } from 'react-icons/fi';
import useAuthStore from '../../store/authStore.js';
import NotificationBell from './NotificationBell.jsx';

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
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'text-accent bg-accent/10'
        : 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'text-accent bg-accent/10'
        : 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary'
    }`;

  return (
    <nav
      className="sticky top-0 z-40 glass border-b border-border/50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/pipeline" className="flex items-center gap-2 group" id="nav-logo">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
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

            {/* User info */}
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-border/50">
              <div className="text-right">
                <p className="text-sm font-medium text-text-primary leading-tight">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-text-muted capitalize">
                  {user?.role || 'associate'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
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
                <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
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
