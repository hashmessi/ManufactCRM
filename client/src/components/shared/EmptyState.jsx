import React from 'react';

export default function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-subtitle">{subtitle}</p>
      {action && (
        <button className="btn-primary mt-4 text-sm" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
