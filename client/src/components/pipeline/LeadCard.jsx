import React from 'react';
import { useNavigate } from 'react-router';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiMoreVertical, FiCalendar, FiAlertCircle } from 'react-icons/fi';
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

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getPriority(score) {
  if (score >= 70) return { label: 'High', class: 'bg-danger/10 text-danger border-danger/20' };
  if (score >= 40) return { label: 'Medium', class: 'bg-warning/10 text-warning border-warning/20' };
  return { label: 'Low', class: 'bg-accent/10 text-accent border-accent/20' };
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
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
    ...(isOverlay && {
      transform: `${CSS.Transform.toString(transform)} scale(1.05) rotate(2deg)`,
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.5)',
      zIndex: 50,
      cursor: 'grabbing',
    })
  };

  const daysInStage = getDaysInStage(lead.stageChangedAt);
  const overdue = isOverdue(lead.nextFollowUp);
  const score = lead.score?.totalScore ?? lead.score ?? 0;
  const priority = getPriority(score);

  const handleClick = (e) => {
    if (isDragging) return;
    if (e.target.closest('[data-drag-handle]')) return;
    navigate(`/leads/${lead._id}`);
  };

  return (
    <div className="perspective-container">
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-bg-secondary/80 backdrop-blur-sm border border-border/80 rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all duration-300 shadow-premium-card perspective-card group hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:border-accent/40 ${
          isDragging ? 'opacity-40 scale-95 border-accent/80' : ''
        } ${isOverlay ? 'opacity-100 bg-bg-secondary/95 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border-accent' : ''}`}
        onClick={handleClick}
        id={`lead-card-${lead._id}`}
        role="button"
        tabIndex={0}
        aria-label={`Lead: ${lead.companyName}, Deal value: ${formatCurrency(lead.dealValue)}`}
      >
        {/* Top row: company info & custom circular score ring */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-2">
            <h4 className="font-semibold text-xs text-text-primary leading-tight truncate tracking-tight">
              {lead.companyName}
            </h4>
            {lead.contactPerson?.name && (
              <p className="text-[10px] text-text-muted mt-0.5 truncate">
                {lead.contactPerson.name}
                {lead.contactPerson.designation && ` · ${lead.contactPerson.designation}`}
              </p>
            )}
          </div>
          <div className="shrink-0 scale-90 origin-right">
            <ScoreBadge
              score={score}
              breakdown={lead.score?.breakdown || lead.score}
            />
          </div>
        </div>

        {/* Priority pill and Deal Value row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-text-primary">
            {formatCurrency(lead.dealValue)}
          </span>
          <span className={`text-[10px] px-2 py-0.5 border rounded-full font-semibold font-mono tracking-wider uppercase scale-90 ${priority.class}`}>
            {priority.label}
          </span>
        </div>

        {/* Bottom row: owner profile, days, and follow-up alerts */}
        <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-1.5">
          <div className="flex items-center gap-2">
            {lead.assignedTo?.name && (
              <>
                <div className="w-5 h-5 rounded-full bg-accent-secondary/20 text-accent-secondary flex items-center justify-center font-bold text-[9px] border border-accent-secondary/10 shrink-0">
                  {getInitials(lead.assignedTo.name)}
                </div>
                <span className="text-[10px] text-text-muted font-medium">
                  {lead.assignedTo.name.split(' ')[0]}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Due date indicator with warning icon/badge */}
            {lead.nextFollowUp && (
              <div 
                className={`flex items-center gap-1 text-[10px] font-mono font-medium ${
                  overdue ? 'text-danger animate-pulse' : 'text-text-muted'
                }`}
                title={overdue ? 'Follow-up overdue!' : 'Next scheduled follow-up'}
              >
                {overdue ? <FiAlertCircle className="w-3 h-3" /> : <FiCalendar className="w-3 h-3" />}
                <span>{formatDate(lead.nextFollowUp)}</span>
              </div>
            )}

            {daysInStage > 0 && (
              <span className="text-[10px] text-text-muted font-mono bg-bg-tertiary px-1.5 py-0.5 rounded border border-border/30 shrink-0">
                {daysInStage}d
              </span>
            )}

            {/* Drag Handle Menu trigger */}
            <div
              {...attributes}
              {...listeners}
              data-drag-handle="true"
              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-0.5 -mr-1"
              aria-label="Drag handle"
            >
              <FiMoreVertical className="w-3.5 h-3.5 text-text-muted hover:text-text-primary" />
            </div>
          </div>
        </div>

        {/* Hover reveal: industry tag */}
        {lead.industry && (
          <div className="overflow-hidden max-h-0 group-hover:max-h-8 transition-all duration-300 mt-2">
            <span className="inline-block text-[9px] font-semibold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded">
              {lead.industry}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
