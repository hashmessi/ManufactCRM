import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { FiPlus } from 'react-icons/fi';
import LeadCard from './LeadCard.jsx';
import EmptyState from '../shared/EmptyState.jsx';

function formatCompactCurrency(value) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value.toLocaleString('en-IN')}`;
}

export default function StageColumn({ stage, leads, config }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  const totalValue = leads.reduce((acc, l) => acc + (l.dealValue || 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[310px] max-w-[340px] flex-shrink-0 bg-bg-secondary/20 border border-border/80 rounded-xl flex flex-col transition-all duration-300 ${
        isOver ? 'bg-bg-secondary/40 border-accent/30 shadow-premium-soft' : ''
      }`}
      id={`stage-column-${stage.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between p-4 border-b border-border/40 select-none">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-3 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: config.color }} />
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">{stage}</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-bg-tertiary border border-border/80 text-text-muted rounded-full font-mono font-bold leading-none">{leads.length}</span>
        </div>
        <span className="text-xs font-semibold text-text-muted font-mono">{formatCompactCurrency(totalValue)}</span>
      </div>

      {/* Body List */}
      <div
        className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto dense-scrollbar max-h-[calc(100vh-270px)]"
      >
        {leads.length === 0 ? (
          <EmptyState
            icon={<FiPlus className="w-4 h-4 text-text-muted" />}
            title="No leads in stage"
            subtitle="Drag a lead or add a new record"
          />
        ) : (
          leads.map((lead, index) => (
            <div
              key={lead._id}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <LeadCard lead={lead} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
