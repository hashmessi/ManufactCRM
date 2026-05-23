import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import LeadCard from './LeadCard.jsx';

export default function StageColumn({ stage, leads, color }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  return (
    <div
      className="kanban-column"
      style={{ borderTopColor: color, borderTopWidth: '3px' }}
      id={`stage-column-${stage.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {/* Header */}
      <div className="kanban-column-header">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 className="text-sm font-semibold text-text-primary">{stage}</h3>
        </div>
        <span className="text-xs font-medium text-text-muted bg-bg-tertiary px-2 py-0.5 rounded-full">
          {leads.length}
        </span>
      </div>

      {/* Droppable Body */}
      <div
        ref={setNodeRef}
        className={`kanban-column-body transition-colors duration-200 ${
          isOver ? 'bg-accent/5 border-2 border-dashed border-accent/30 rounded-lg' : ''
        }`}
      >
        {leads.length === 0 ? (
          <div className="kanban-empty">
            <p className="text-text-muted/50 text-xs">Drop leads here</p>
          </div>
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
