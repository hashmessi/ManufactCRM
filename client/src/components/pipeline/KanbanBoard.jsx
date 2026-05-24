import React, { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { FiStar, FiPhone, FiCheckCircle, FiFileText, FiUsers, FiAward, FiXCircle, FiTrendingUp, FiAlertCircle, FiClock, FiCalendar } from 'react-icons/fi';
import StageColumn from './StageColumn.jsx';
import LeadCard from './LeadCard.jsx';
import useLeadStore from '../../store/leadStore.js';

const STAGE_CONFIG = {
  'New':           { color: '#94a3b8', icon: <FiStar className="w-3.5 h-3.5" />,       bg: 'rgba(100,116,139,0.05)' },
  'Contacted':     { color: '#4f8cff', icon: <FiPhone className="w-3.5 h-3.5" />,      bg: 'rgba(79,140,255,0.05)'  },
  'Qualified':     { color: '#7c5cff', icon: <FiCheckCircle className="w-3.5 h-3.5" />, bg: 'rgba(124,92,255,0.05)'  },
  'Proposal Sent': { color: '#f59e0b', icon: <FiFileText className="w-3.5 h-3.5" />,   bg: 'rgba(245,158,11,0.05)'  },
  'Negotiation':   { color: '#f97316', icon: <FiUsers className="w-3.5 h-3.5" />,      bg: 'rgba(249,115,22,0.05)'  },
  'Won':           { color: '#10b981', icon: <FiAward className="w-3.5 h-3.5" />,      bg: 'rgba(16,185,129,0.05)'  },
  'Lost':          { color: '#ef4444', icon: <FiXCircle className="w-3.5 h-3.5" />,    bg: 'rgba(239,68,68,0.05)'   },
};

function formatCompactCurrency(value) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString('en-IN')}`;
}

export default function KanbanBoard() {
  const leads = useLeadStore((s) => s.leads);
  const stages = useLeadStore((s) => s.stages);
  const updateLeadStage = useLeadStore((s) => s.updateLeadStage);
  const [activeCard, setActiveCard] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getLeadsByStage = (stage) => {
    return leads.filter((lead) => lead.stage === stage);
  };

  // Pipeline summary metrics
  const summary = useMemo(() => {
    const totalPipelineValue = leads
      .filter(l => l.stage !== 'Lost')
      .reduce((acc, l) => acc + (l.dealValue || 0), 0);

    const hotCount = leads.filter(l => {
      const score = l.score?.totalScore ?? l.score ?? 0;
      return score >= 75 && l.stage !== 'Won' && l.stage !== 'Lost';
    }).length;

    const overdueCount = leads.filter(l => {
      if (!l.nextFollowUp || l.stage === 'Won' || l.stage === 'Lost') return false;
      return new Date(l.nextFollowUp) < new Date();
    }).length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const wonThisMonth = leads
      .filter(l => l.stage === 'Won' && l.stageChangedAt && new Date(l.stageChangedAt) >= startOfMonth)
      .reduce((acc, l) => acc + (l.dealValue || 0), 0);

    return { totalPipelineValue, hotCount, overdueCount, wonThisMonth };
  }, [leads]);

  const handleDragStart = (event) => {
    const { active } = event;
    const lead = leads.find((l) => l._id === active.id);
    setActiveCard(lead || null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const leadId = active.id;
    const overId = over.id;

    // Check if dropped over a stage column
    if (stages.includes(overId)) {
      const lead = leads.find((l) => l._id === leadId);
      if (lead && lead.stage !== overId) {
        updateLeadStage(leadId, overId);
      }
      return;
    }

    // Check if dropped over another lead card
    const overLead = leads.find((l) => l._id === overId);
    if (overLead) {
      const lead = leads.find((l) => l._id === leadId);
      if (lead && lead.stage !== overLead.stage) {
        updateLeadStage(leadId, overLead.stage);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveCard(null);
  };

  return (
    <>
      {/* Pipeline Summary Bar — Overhauled to Stripe/Linear BI styling */}
      <div className="bg-bg-secondary/40 border border-border/80 rounded-xl p-4 mb-6 shadow-premium-soft flex flex-wrap md:flex-nowrap items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3 py-1 px-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <FiTrendingUp className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider font-mono">Active Pipeline</span>
            <span className="text-base font-bold text-text-primary mt-0.5">{formatCompactCurrency(summary.totalPipelineValue)}</span>
          </div>
        </div>
        
        <div className="hidden md:block w-px h-8 bg-border/50" />

        <div className="flex items-center gap-3 py-1 px-3">
          <div className="w-8 h-8 rounded-lg bg-danger/10 border border-danger/20 flex items-center justify-center text-danger">
            <FiAlertCircle className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider font-mono">Hot Prospects</span>
            <span className="text-base font-bold text-text-primary mt-0.5">{summary.hotCount} <span className="text-[10px] font-medium text-text-muted">leads</span></span>
          </div>
        </div>

        <div className="hidden md:block w-px h-8 bg-border/50" />

        <div className="flex items-center gap-3 py-1 px-3">
          <div className="w-8 h-8 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center text-warning">
            <FiClock className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider font-mono">Overdue Actions</span>
            <span className="text-base font-bold text-text-primary mt-0.5">{summary.overdueCount} <span className="text-[10px] font-medium text-text-muted">reminders</span></span>
          </div>
        </div>

        <div className="hidden md:block w-px h-8 bg-border/50" />

        <div className="flex items-center gap-3 py-1 px-3">
          <div className="w-8 h-8 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center text-success">
            <FiAward className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider font-mono">Closed Won (Month)</span>
            <span className="text-base font-bold text-text-primary mt-0.5">{formatCompactCurrency(summary.wonThisMonth)}</span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="kanban-board dense-scrollbar" id="kanban-board">
          {stages.map((stage) => {
            const stageLeads = getLeadsByStage(stage);
            const config = STAGE_CONFIG[stage] || { color: '#94a3b8', icon: null, bg: 'rgba(100,116,139,0.05)' };
            return (
              <SortableContext
                key={stage}
                id={stage}
                items={stageLeads.map((l) => l._id)}
                strategy={verticalListSortingStrategy}
              >
                <StageColumn
                  stage={stage}
                  leads={stageLeads}
                  config={config}
                />
              </SortableContext>
            );
          })}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="opacity-90 rotate-2 scale-105">
              <LeadCard lead={activeCard} isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}
