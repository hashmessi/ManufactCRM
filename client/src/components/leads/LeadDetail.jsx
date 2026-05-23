import React, { useState } from 'react';
import {
  FiEdit2,
  FiSave,
  FiX,
  FiCopy,
  FiCheck,
  FiCalendar,
  FiTag,
  FiDollarSign,
  FiPhone,
  FiMail,
  FiUser,
  FiBriefcase,
} from 'react-icons/fi';
import ScoreBadge from './ScoreBadge.jsx';
import useLeadStore from '../../store/leadStore.js';
import toast from 'react-hot-toast';

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

const STAGE_COLORS = {
  'New': '#3b82f6',
  'Contacted': '#8b5cf6',
  'Qualified': '#6366f1',
  'Proposal Sent': '#f59e0b',
  'Negotiation': '#f97316',
  'Won': '#10b981',
  'Lost': '#ef4444',
};

function formatCurrency(value) {
  if (!value && value !== 0) return '₹0';
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

export default function LeadDetail({ lead }) {
  const updateLead = useLeadStore((s) => s.updateLead);
  const [editing, setEditing] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    companyName: lead?.companyName || '',
    industry: lead?.industry || '',
    dealValue: lead?.dealValue || 0,
    nextFollowUp: lead?.nextFollowUp
      ? new Date(lead.nextFollowUp).toISOString().split('T')[0]
      : '',
    notes: lead?.notes || '',
    proposalSent: lead?.stage === 'Proposal Sent' || lead?.stage === 'Negotiation' || lead?.stage === 'Won',
  });

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copied!');
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateLead(lead._id, {
        companyName: form.companyName,
        industry: form.industry,
        dealValue: Number(form.dealValue),
        nextFollowUp: form.nextFollowUp || undefined,
        notes: form.notes,
      });
      setEditing(false);
    } catch (err) {
      // handled by store
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      companyName: lead?.companyName || '',
      industry: lead?.industry || '',
      dealValue: lead?.dealValue || 0,
      nextFollowUp: lead?.nextFollowUp
        ? new Date(lead.nextFollowUp).toISOString().split('T')[0]
        : '',
      notes: lead?.notes || '',
      proposalSent: false,
    });
    setEditing(false);
  };

  const currentStageIndex = STAGES.indexOf(lead?.stage);

  return (
    <div className="space-y-6 animate-fadeIn" id="lead-detail">
      {/* Company Header */}
      <div className="card-elevated">
        <div className="flex items-start justify-between mb-4">
          <div>
            {editing ? (
              <input
                value={form.companyName}
                onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
                className="input-dark text-xl font-bold mb-1"
                id="edit-companyName"
              />
            ) : (
              <h2 className="text-xl font-bold text-text-primary">{lead?.companyName}</h2>
            )}
            {lead?.industry && (
              <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                <FiBriefcase className="w-3 h-3" />
                {lead.industry}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex items-center gap-1.5 text-sm py-1.5"
                  id="lead-detail-save-btn"
                >
                  <FiSave className="w-3.5 h-3.5" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="btn-secondary text-sm py-1.5"
                  id="lead-detail-cancel-btn"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary flex items-center gap-1.5 text-sm py-1.5"
                id="lead-detail-edit-btn"
              >
                <FiEdit2 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Stage Pipeline Indicator */}
        <div className="mb-4">
          <p className="text-xs font-medium text-text-muted mb-2">Pipeline Stage</p>
          <div className="flex items-center gap-1">
            {STAGES.map((stage, idx) => {
              const isActive = idx === currentStageIndex;
              const isPast = idx < currentStageIndex;
              const color = STAGE_COLORS[stage];

              return (
                <div key={stage} className="flex-1 group relative">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: isActive || isPast ? color : '#242836',
                      opacity: isActive ? 1 : isPast ? 0.6 : 0.3,
                    }}
                  />
                  {isActive && (
                    <p
                      className="text-[10px] font-medium mt-1 text-center"
                      style={{ color }}
                    >
                      {stage}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contact Person Card */}
      <div className="card-elevated">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <FiUser className="w-4 h-4 text-accent" />
          Contact Person
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted">Name</p>
              <p className="text-sm text-text-primary font-medium">
                {lead?.contactPerson?.name || '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted">Designation</p>
              <p className="text-sm text-text-primary">
                {lead?.contactPerson?.designation || '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <FiMail className="w-3.5 h-3.5 text-text-muted" />
              <div>
                <p className="text-xs text-text-muted">Email</p>
                <p className="text-sm text-text-primary">
                  {lead?.contactPerson?.email || '—'}
                </p>
              </div>
            </div>
            {lead?.contactPerson?.email && (
              <button
                onClick={() => handleCopy(lead.contactPerson.email, 'email')}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-bg-tertiary transition-all"
                aria-label="Copy email"
                id="copy-email-btn"
              >
                {copiedField === 'email' ? (
                  <FiCheck className="w-3.5 h-3.5 text-success" />
                ) : (
                  <FiCopy className="w-3.5 h-3.5 text-text-muted" />
                )}
              </button>
            )}
          </div>
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <FiPhone className="w-3.5 h-3.5 text-text-muted" />
              <div>
                <p className="text-xs text-text-muted">Phone</p>
                <p className="text-sm text-text-primary">
                  {lead?.contactPerson?.phone || '—'}
                </p>
              </div>
            </div>
            {lead?.contactPerson?.phone && (
              <button
                onClick={() => handleCopy(lead.contactPerson.phone, 'phone')}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-bg-tertiary transition-all"
                aria-label="Copy phone"
                id="copy-phone-btn"
              >
                {copiedField === 'phone' ? (
                  <FiCheck className="w-3.5 h-3.5 text-success" />
                ) : (
                  <FiCopy className="w-3.5 h-3.5 text-text-muted" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Deal & Score Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-elevated">
          <div className="flex items-center gap-2 mb-3">
            <FiDollarSign className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-text-primary">Deal Value</h3>
          </div>
          {editing ? (
            <input
              type="number"
              value={form.dealValue}
              onChange={(e) => setForm((p) => ({ ...p, dealValue: e.target.value }))}
              className="input-dark text-lg font-bold"
              min="0"
              id="edit-dealValue"
            />
          ) : (
            <p className="text-2xl font-bold text-accent">
              {formatCurrency(lead?.dealValue)}
            </p>
          )}
          {lead?.source && (
            <div className="flex items-center gap-1.5 mt-3">
              <FiTag className="w-3 h-3 text-text-muted" />
              <span className="text-xs text-text-muted">Source: {lead.source}</span>
            </div>
          )}
        </div>

        <div className="card-elevated">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Lead Score</h3>
          <div className="flex items-center gap-4">
            <ScoreBadge
              score={lead?.score?.totalScore ?? lead?.score ?? 0}
              breakdown={lead?.score?.breakdown || lead?.score}
            />
            <div className="text-3xl font-bold text-text-primary">
              {lead?.score?.totalScore ?? lead?.score ?? 0}
              <span className="text-sm font-normal text-text-muted">/100</span>
            </div>
          </div>
          {lead?.score?.breakdown && (
            <div className="mt-4 space-y-2">
              {[
                { label: 'Deal Value', key: 'dealValueScore', max: 25 },
                { label: 'Interactions', key: 'interactionScore', max: 25 },
                { label: 'Stage Velocity', key: 'stageVelocityScore', max: 20 },
                { label: 'Response Time', key: 'responseTimeScore', max: 20 },
                { label: 'Bonus', key: 'bonusScore', max: 10 },
              ].map((item) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-text-muted">{item.label}</span>
                    <span className="text-text-primary font-medium">
                      {lead.score.breakdown[item.key] ?? 0}/{item.max}
                    </span>
                  </div>
                  <div className="progress-bar-bg h-1.5">
                    <div
                      className="progress-bar-fill gradient-accent"
                      style={{
                        width: `${((lead.score.breakdown[item.key] ?? 0) / item.max) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Follow-up Date */}
      <div className="card-elevated">
        <div className="flex items-center gap-2 mb-3">
          <FiCalendar className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-text-primary">Follow-Up Date</h3>
        </div>
        {editing ? (
          <input
            type="date"
            value={form.nextFollowUp}
            onChange={(e) => setForm((p) => ({ ...p, nextFollowUp: e.target.value }))}
            className="input-dark"
            id="edit-nextFollowUp"
          />
        ) : (
          <p className="text-sm text-text-primary">
            {lead?.nextFollowUp
              ? new Date(lead.nextFollowUp).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'No follow-up scheduled'}
          </p>
        )}
      </div>

      {/* Notes */}
      <div className="card-elevated">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Notes</h3>
        {editing ? (
          <textarea
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            className="input-dark min-h-[120px] resize-y"
            rows={5}
            id="edit-notes"
          />
        ) : (
          <p className="text-sm text-text-muted whitespace-pre-wrap leading-relaxed">
            {lead?.notes || 'No notes added yet.'}
          </p>
        )}
      </div>
    </div>
  );
}
