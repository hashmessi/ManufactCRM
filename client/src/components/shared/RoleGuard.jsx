import React from 'react';
import useAuthStore from '../../store/authStore.js';
import { FiShield } from 'react-icons/fi';

export default function RoleGuard({ allowedRoles, children }) {
  const user = useAuthStore((state) => state.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn">
        <div className="glass-card p-12 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-danger/15 flex items-center justify-center mx-auto mb-6">
            <FiShield className="w-8 h-8 text-danger" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            Access Denied
          </h2>
          <p className="text-text-muted text-sm leading-relaxed">
            You don&apos;t have permission to view this page. This area is restricted to{' '}
            <span className="text-accent font-medium">
              {allowedRoles.join(' & ')}
            </span>{' '}
            roles only.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
