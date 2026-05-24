import React, { useState, useEffect } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';
import useLeadStore from '../../store/leadStore.js';
import api from '../../api/axios.js';

const SOURCES = [
  'Website',
  'Referral',
  'Cold Call',
  'Exhibition',
  'LinkedIn',
  'IndiaMart',
  'TradeIndia',
  'Other',
];

const INDUSTRIES = [
  'Automotive',
  'Pharmaceuticals',
  'FMCG',
  'Textiles',
  'Chemicals',
  'Electronics',
  'Steel & Metals',
  'Plastics',
  'Food Processing',
  'Engineering',
  'Other',
];

export default function LeadForm({ lead = null, onClose }) {
  const createLead = useLeadStore((s) => s.createLead);
  const updateLead = useLeadStore((s) => s.updateLead);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditing = !!lead;

  const [form, setForm] = useState({
    companyName: lead?.companyName || '',
    industry: lead?.industry || '',
    contactPersonName: lead?.contactPerson?.name || '',
    contactPersonEmail: lead?.contactPerson?.email || '',
    contactPersonPhone: lead?.contactPerson?.phone || '',
    contactPersonDesignation: lead?.contactPerson?.designation || '',
    dealValue: lead?.dealValue || '',
    source: lead?.source || '',
    assignedTo: lead?.assignedTo?._id || lead?.assignedTo || '',
    nextFollowUp: lead?.nextFollowUp
      ? new Date(lead.nextFollowUp).toISOString().split('T')[0]
      : '',
    notes: lead?.notes || '',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // /users/assignable is accessible to all authenticated roles
        const response = await api.get('/users/assignable');
        setUsers(response.data.users || response.data || []);
      } catch (err) {
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!form.contactPersonName.trim()) newErrors.contactPersonName = 'Contact name is required';
    if (!form.assignedTo) newErrors.assignedTo = 'Assigned To is required';
    if (form.contactPersonEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactPersonEmail)) {
      newErrors.contactPersonEmail = 'Invalid email format';
    }
    if (form.dealValue && isNaN(Number(form.dealValue))) {
      newErrors.dealValue = 'Deal value must be a number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Build contactPerson — only include non-empty fields so the email
      // validator is not triggered on blank optional inputs
      const contactPerson = {};
      if (form.contactPersonName.trim()) contactPerson.name = form.contactPersonName.trim();
      if (form.contactPersonEmail.trim()) contactPerson.email = form.contactPersonEmail.trim();
      if (form.contactPersonPhone.trim()) contactPerson.phone = form.contactPersonPhone.trim();
      if (form.contactPersonDesignation.trim()) contactPerson.designation = form.contactPersonDesignation.trim();

      const payload = {
        companyName: form.companyName.trim(),
        dealValue: form.dealValue ? Number(form.dealValue) : 0,
      };
      // Only include optional string fields if non-empty (prevents enum/validator issues)
      if (form.industry) payload.industry = form.industry;
      if (form.source) payload.source = form.source;
      if (form.notes.trim()) payload.notes = form.notes.trim();
      if (Object.keys(contactPerson).length > 0) payload.contactPerson = contactPerson;
      if (form.assignedTo) payload.assignedTo = form.assignedTo;
      if (form.nextFollowUp) payload.nextFollowUp = form.nextFollowUp;

      if (isEditing) {
        await updateLead(lead._id, payload);
      } else {
        await createLead(payload);
      }
      onClose();
    } catch (err) {
      // Error handled by store
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} id="lead-form-modal">
      <div className="modal-content max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-text-primary">
            {isEditing ? 'Edit Lead' : 'Add New Lead'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close modal"
            id="lead-form-close-btn"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" id="lead-form">
          {/* Company Name */}
          <div>
            <label htmlFor="lead-companyName" className="block text-sm font-medium text-text-muted mb-1">
              Company Name *
            </label>
            <input
              id="lead-companyName"
              name="companyName"
              type="text"
              value={form.companyName}
              onChange={handleChange}
              className="input-dark"
              placeholder="Enter company name"
              disabled={loading}
            />
            {errors.companyName && (
              <p className="text-xs text-danger mt-1">{errors.companyName}</p>
            )}
          </div>

          {/* Industry */}
          <div>
            <label htmlFor="lead-industry" className="block text-sm font-medium text-text-muted mb-1">
              Industry
            </label>
            <select
              id="lead-industry"
              name="industry"
              value={form.industry}
              onChange={handleChange}
              className="input-dark"
              disabled={loading}
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Contact Person Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lead-contactPersonName" className="block text-sm font-medium text-text-muted mb-1">
                Contact Name *
              </label>
              <input
                id="lead-contactPersonName"
                name="contactPersonName"
                type="text"
                value={form.contactPersonName}
                onChange={handleChange}
                className="input-dark"
                placeholder="Full name"
                disabled={loading}
              />
              {errors.contactPersonName && (
                <p className="text-xs text-danger mt-1">{errors.contactPersonName}</p>
              )}
            </div>
            <div>
              <label htmlFor="lead-contactPersonDesignation" className="block text-sm font-medium text-text-muted mb-1">
                Designation
              </label>
              <input
                id="lead-contactPersonDesignation"
                name="contactPersonDesignation"
                type="text"
                value={form.contactPersonDesignation}
                onChange={handleChange}
                className="input-dark"
                placeholder="e.g. Purchase Manager"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lead-contactPersonEmail" className="block text-sm font-medium text-text-muted mb-1">
                Email
              </label>
              <input
                id="lead-contactPersonEmail"
                name="contactPersonEmail"
                type="email"
                value={form.contactPersonEmail}
                onChange={handleChange}
                className="input-dark"
                placeholder="email@company.com"
                disabled={loading}
              />
              {errors.contactPersonEmail && (
                <p className="text-xs text-danger mt-1">{errors.contactPersonEmail}</p>
              )}
            </div>
            <div>
              <label htmlFor="lead-contactPersonPhone" className="block text-sm font-medium text-text-muted mb-1">
                Phone
              </label>
              <input
                id="lead-contactPersonPhone"
                name="contactPersonPhone"
                type="tel"
                value={form.contactPersonPhone}
                onChange={handleChange}
                className="input-dark"
                placeholder="+91 XXXXX XXXXX"
                disabled={loading}
              />
            </div>
          </div>

          {/* Deal Value + Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lead-dealValue" className="block text-sm font-medium text-text-muted mb-1">
                Deal Value (₹)
              </label>
              <input
                id="lead-dealValue"
                name="dealValue"
                type="number"
                value={form.dealValue}
                onChange={handleChange}
                className="input-dark"
                placeholder="e.g. 500000"
                min="0"
                disabled={loading}
              />
              {errors.dealValue && (
                <p className="text-xs text-danger mt-1">{errors.dealValue}</p>
              )}
            </div>
            <div>
              <label htmlFor="lead-source" className="block text-sm font-medium text-text-muted mb-1">
                Source
              </label>
              <select
                id="lead-source"
                name="source"
                value={form.source}
                onChange={handleChange}
                className="input-dark"
                disabled={loading}
              >
                <option value="">Select source</option>
                {SOURCES.map((src) => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assigned To + Follow Up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lead-assignedTo" className="block text-sm font-medium text-text-muted mb-1">
                Assign To
              </label>
              <select
                id="lead-assignedTo"
                name="assignedTo"
                value={form.assignedTo}
                onChange={handleChange}
                className="input-dark"
                disabled={loading}
              >
                <option value="">Select rep</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
              {errors.assignedTo && (
                <p className="text-xs text-danger mt-1">{errors.assignedTo}</p>
              )}
            </div>
            <div>
              <label htmlFor="lead-nextFollowUp" className="block text-sm font-medium text-text-muted mb-1">
                Next Follow-Up
              </label>
              <input
                id="lead-nextFollowUp"
                name="nextFollowUp"
                type="date"
                value={form.nextFollowUp}
                onChange={handleChange}
                className="input-dark"
                disabled={loading}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="lead-notes" className="block text-sm font-medium text-text-muted mb-1">
              Notes
            </label>
            <textarea
              id="lead-notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="input-dark min-h-[80px] resize-y"
              placeholder="Additional notes about this lead..."
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
              id="lead-form-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
              id="lead-form-submit-btn"
            >
              {loading && <FiLoader className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Update Lead' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
