import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FiMail, FiLock, FiLoader, FiBarChart2, FiStar, FiBell } from 'react-icons/fi';
import useAuthStore from '../store/authStore.js';

// Inline SVG factory/pipeline icon — lightweight, 6 paths max
function FactoryIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="20" width="6" height="12" rx="1" fill="#6366f1" opacity="0.7" />
      <rect x="12" y="14" width="6" height="18" rx="1" fill="#8b5cf6" opacity="0.85" />
      <rect x="20" y="8" width="6" height="24" rx="1" fill="#6366f1" />
      <rect x="28" y="4" width="6" height="28" rx="1" fill="#a78bfa" opacity="0.75" />
      <rect x="4" y="30" width="30" height="2" rx="1" fill="#4f46e5" />
    </svg>
  );
}

function Pill({ icon, label }) {
  return (
    <div className="pill">
      <span className="pill-icon">{icon}</span>
      {label}
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const token = useAuthStore((s) => s.token);
  const clearError = useAuthStore((s) => s.clearError);

  useEffect(() => {
    if (token) {
      navigate('/pipeline', { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/pipeline', { replace: true });
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <div className="login-split-layout mesh-bg relative overflow-hidden">
      {/* Decorative glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-accent-secondary/8 rounded-full blur-[120px] pointer-events-none" />

      {/* ===== LEFT PANEL — Brand Story ===== */}
      <div className="panel-left animate-fadeIn">
        {/* Logo + Wordmark */}
        <div className="logo-mark">
          <FactoryIcon />
          <span>ManufactCRM</span>
        </div>

        {/* Tagline */}
        <h1 className="login-tagline">
          The intelligence layer<br />for your BDA team.
        </h1>
        <p className="login-subtitle">
          Pipeline clarity. Deal velocity. Zero spreadsheets.
        </p>

        {/* Feature Pills */}
        <div className="feature-pills">
          <Pill icon={<FiBarChart2 className="w-4 h-4" />} label="Live pipeline tracking" />
          <Pill icon={<FiStar className="w-4 h-4" />} label="AI lead scoring" />
          <Pill icon={<FiBell className="w-4 h-4" />} label="Smart follow-up alerts" />
        </div>

        {/* Stat Callout */}
        <div className="stat-callout">
          <span className="stat-number">20+</span>
          <span className="stat-label">Active leads tracked</span>
        </div>
      </div>

      {/* ===== RIGHT PANEL — Login Form ===== */}
      <div className="panel-right">
        <div className="w-full max-w-md animate-slideUp">
          {/* Form Card */}
          <div className="glass-card p-8">
            <h2 className="text-xl font-semibold text-text-primary mb-1">Welcome back</h2>
            <p className="text-sm text-text-muted mb-6">Sign in to access your pipeline</p>

            <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
              {/* Email Field */}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-text-muted mb-1.5">
                  Email Address
                </label>
                <div className="input-group">
                  <FiMail className="input-icon w-4 h-4" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-dark pl-10"
                    placeholder="name@company.com"
                    required
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-text-muted mb-1.5">
                  Password
                </label>
                <div className="input-group">
                  <FiLock className="input-icon w-4 h-4" />
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-dark pl-10"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-danger/10 border border-danger/30 rounded-lg px-4 py-3 animate-fadeIn">
                  <p className="text-sm text-danger">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full btn-primary py-3 text-base font-semibold flex items-center justify-center gap-2"
                id="login-submit-btn"
              >
                {loading ? (
                  <>
                    <FiLoader className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border/50 text-center">
              <p className="text-xs text-text-muted">
                Secure access for authorized BDA team members only
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-text-muted/50 mt-6">
            &copy; {new Date().getFullYear()} ManufactCRM &mdash; Manufacturing Intelligence
          </p>
        </div>
      </div>
    </div>
  );
}
