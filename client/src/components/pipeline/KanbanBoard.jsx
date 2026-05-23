import React, { useState } from 'react';
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
import StageColumn from './StageColumn.jsx';
import LeadCard from './LeadCard.jsx';
import useLeadStore from '../../store/leadStore.js';

const STAGE_COLORS = {
  'New': '#3b82f6',
  'Contacted': '#8b5cf6',
  'Qualified': '#6366f1',
  'Proposal Sent': '#f59e0b',
  'Negotiation': '#f97316',
  'Won': '#10b981',
  'Lost': '#ef4444',
};

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="kanban-board" id="kanban-board">
        {stages.map((stage) => {
          const stageLeads = getLeadsByStage(stage);
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
                color={STAGE_COLORS[stage]}
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
  );
}
