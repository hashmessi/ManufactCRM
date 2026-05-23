import React from 'react';
import { useNavigate } from 'react-router';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiClock, FiUser, FiMessageSquare, FiAlertTriangle, FiMoreVertical } from 'react-icons/fi';
import ScoreBadge from '../leads/ScoreBadge.jsx';

function formatCurrency(value) {
  if (!value && value !== 0) return '₹0';
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function getDaysInStage(stageChangedAt) {
  if (!stageChangedAt) return 0;
  const now = new Date();
  const changed = new Date(stageChangedAt);
  return Math.floor((now - changed) / (1000 * 60 * 60 * 24));
}

function isOverdue(followUpDate) {
  if (!followUpDate) return false;
  return new Date(followUpDate) < new Date();
}

function formatFollowUp(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((date - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function LeadCard({ lead, isOverlay = false }) {
  const navigate = useNavigate();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead._id,
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const daysInStage = getDaysInStage(lead.stageChangedAt);
  const overdue = isOverdue(lead.nextFollowUp);
  const followUpText = formatFollowUp(lead.nextFollowUp);

  const handleClick = (e) => {
    if (isDragging) return;
    // Don't navigate if clicking the drag handle
    if (e.target.closest('[data-drag-handle]')) return;
    navigate(`/leads/${lead._id}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-card group ${isDragging ? 'is-dragging' : ''} ${
        overdue ? 'animate-pulse-glow' : ''
      }`}
      onClick={handleClick}
      id={`lead-card-${lead._id}`}
      role="button"
      tabIndex={0}
      aria-label={`Lead: ${lead.companyName}, Deal value: ${formatCurrency(lead.dealValue)}`}
    >
      {/* Top Row: Company + Drag Handle */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 mr-2">
          <h4 className="text-sm font-semibold text-text-primary truncate leading-snug">
            {lead.companyName}
          </h4>
          {lead.contactPerson?.name && (
            <p className="text-xs text-text-muted truncate mt-0.5">
              {lead.contactPerson.name}
            </p>
          )}
        </div>
        <div
          {...attributes}
          {...listeners}
          data-drag-handle="true"
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 -mr-1 -mt-1"
          aria-label="Drag handle"
        >
          <FiMoreVertical className="w-4 h-4 text-text-muted" />
        </div>
      </div>

      {/* Deal Value + Score */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-sm font-bold text-accent">
          {formatCurrency(lead.dealValue)}
        </span>
        <ScoreBadge
          score={lead.score?.totalScore ?? lead.score}
          breakdown={lead.score?.breakdown || lead.score}
        />
      </div>

      {/* Meta Row */}
      <div className="flex items-center gap-3 text-xs text-text-muted">
        {lead.assignedTo?.name && (
          <div className="flex items-center gap-1 truncate">
            <FiUser className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{lead.assignedTo.name}</span>
          </div>
        )}
        {daysInStage > 0 && (
          <div className="flex items-center gap-1">
            <FiClock className="w-3 h-3 flex-shrink-0" />
            <span>{daysInStage}d</span>
          </div>
        )}
        {lead.interactionCount > 0 && (
          <div className="flex items-center gap-1">
            <FiMessageSquare className="w-3 h-3 flex-shrink-0" />
            <span>{lead.interactionCount}</span>
          </div>
        )}
      </div>

      {/* Follow-up */}
      {followUpText && (
        <div
          className={`flex items-center gap-1.5 mt-2 pt-2 border-t border-border/30 text-xs ${
            overdue ? 'text-danger font-medium' : 'text-text-muted'
          }`}
        >
          {overdue && <FiAlertTriangle className="w-3 h-3 flex-shrink-0" />}
          <FiClock className="w-3 h-3 flex-shrink-0" />
          <span>{followUpText}</span>
        </div>
      )}
    </div>
  );
}
