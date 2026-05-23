import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FiMail, FiLock, FiLoader } from 'react-icons/fi';
import useAuthStore from '../store/authStore.js';

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
    <div className="min-h-screen gradient-bg-login dot-pattern flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent-secondary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md animate-slideUp">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-accent mb-4 shadow-lg shadow-accent/20">
            <span className="text-white text-2xl font-extrabold">M</span>
          </div>
          <h1 className="text-3xl font-extrabold gradient-text mb-2">
            ManufactCRM
          </h1>
          <p className="text-text-muted text-sm tracking-wide">
            BDA Team Intelligence Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-text-primary mb-1">Welcome back</h2>
          <p className="text-sm text-text-muted mb-6">Sign in to access your pipeline</p>

          <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-text-muted mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
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
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
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
  );
}
