import React, { useState } from 'react';
import { FiPhone, FiMail, FiUsers, FiMessageCircle, FiFileText, FiPlusCircle, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import EmptyState from '../shared/EmptyState';

const TYPE_CONFIG = {
  call:      { icon: <FiPhone className="w-3.5 h-3.5" />,        color: 'text-accent-secondary', bg: 'bg-accent-secondary/10 border-accent-secondary/20' },
  email:     { icon: <FiMail className="w-3.5 h-3.5" />,         color: 'text-info',             bg: 'bg-info/10 border-info/20' },
  meeting:   { icon: <FiUsers className="w-3.5 h-3.5" />,        color: 'text-success',          bg: 'bg-success/10 border-success/20' },
  whatsapp:  { icon: <FiMessageCircle className="w-3.5 h-3.5" />, color: 'text-success',         bg: 'bg-success/10 border-success/20' },
  other:     { icon: <FiFileText className="w-3.5 h-3.5" />,     color: 'text-text-muted',       bg: 'bg-bg-tertiary border-border' },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function InteractionTimeline({ interactions = [], onLogClick }) {
  const [filter, setFilter] = useState('all');
  const [sortDesc, setSortDesc] = useState(true);

  const filtered = interactions.filter(i => filter === 'all' || i.type === filter);
  const sorted = [...filtered].sort((a, b) => {
    const d1 = new Date(a.date).getTime();
    const d2 = new Date(b.date).getTime();
    return sortDesc ? d2 - d1 : d1 - d2;
  });

  return (
    <div className="bg-bg-secondary/40 border border-border/60 rounded-xl p-5 shadow-premium-card h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Activity Timeline</h3>
          <p className="text-[11px] text-text-muted mt-0.5">
            {interactions.length} interaction{interactions.length !== 1 ? 's' : ''} logged
          </p>
        </div>
        {onLogClick && (
          <button
            onClick={onLogClick}
            className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
            id="log-interaction-btn"
          >
            <FiPlusCircle className="w-3.5 h-3.5" />
            Log
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <select
          className="input-dark text-xs py-1.5 flex-1"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter by interaction type"
        >
          <option value="all">All Types</option>
          <option value="call">Calls</option>
          <option value="email">Emails</option>
          <option value="meeting">Meetings</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="other">Other</option>
        </select>
        <button
          onClick={() => setSortDesc(!sortDesc)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-tertiary border border-border/60 text-text-muted hover:text-text-primary hover:border-border rounded-lg text-xs transition-all shrink-0"
          title={sortDesc ? 'Showing newest first' : 'Showing oldest first'}
        >
          {sortDesc ? <FiArrowDown className="w-3 h-3" /> : <FiArrowUp className="w-3 h-3" />}
          {sortDesc ? 'Newest' : 'Oldest'}
        </button>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto dense-scrollbar min-h-0">
        {sorted.length === 0 ? (
          <EmptyState
            icon={<FiFileText className="w-5 h-5 text-text-muted" />}
            title="No interactions yet"
            subtitle={filter === 'all' ? 'Log your first call, email, or meeting to track progress.' : `No ${filter}s recorded yet.`}
            action={onLogClick ? { label: 'Log Interaction', onClick: onLogClick } : undefined}
          />
        ) : (
          <div className="relative border-l border-border/40 ml-4 space-y-4 pb-2 pr-1">
            {sorted.map((item) => {
              const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.other;
              return (
                <div key={item._id} className="relative pl-6">
                  {/* Timeline dot */}
                  <div className={`absolute -left-3.5 top-1.5 w-7 h-7 rounded-full border flex items-center justify-center ${config.bg} ${config.color}`}>
                    {config.icon}
                  </div>

                  {/* Card */}
                  <div className="bg-bg-tertiary/30 border border-border/50 rounded-xl p-3.5 hover:border-border transition-all duration-150">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-[11px] font-semibold uppercase tracking-wider font-mono capitalize ${config.color}`}>
                        {item.type}
                        {item.duration ? <span className="text-text-muted font-normal normal-case tracking-normal"> · {item.duration}m</span> : null}
                      </span>
                      <span className="text-[10px] text-text-muted font-mono shrink-0">
                        {formatDate(item.date)}
                      </span>
                    </div>

                    {item.outcome && (
                      <p className="text-xs text-text-primary leading-relaxed mb-2 whitespace-pre-wrap">
                        {item.outcome}
                      </p>
                    )}

                    {item.nextAction && (
                      <div className="text-xs bg-bg-secondary/60 border border-border/40 px-2.5 py-2 rounded-lg text-text-muted mt-2">
                        <span className="font-semibold text-text-primary">Next: </span>
                        {item.nextAction}
                      </div>
                    )}

                    <div className="mt-2.5 text-[10px] text-text-muted text-right">
                      Logged by{' '}
                      <span className="font-medium text-text-primary">
                        {item.loggedBy?.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
