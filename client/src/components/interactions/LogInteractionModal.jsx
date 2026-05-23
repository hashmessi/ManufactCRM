import React, { useState } from 'react';
import { FiX, FiPhone, FiMail, FiUsers, FiMessageCircle, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const types = [
  { id: 'call', icon: <FiPhone />, label: 'Call' },
  { id: 'email', icon: <FiMail />, label: 'Email' },
  { id: 'meeting', icon: <FiUsers />, label: 'Meeting' },
  { id: 'whatsapp', icon: <FiMessageCircle />, label: 'WhatsApp' },
  { id: 'other', icon: <FiFileText />, label: 'Other' },
];

export default function LogInteractionModal({ leadId, onClose, onLogged }) {
  const [formData, setFormData] = useState({
    type: 'call',
    date: new Date().toISOString().slice(0, 16),
    duration: '',
    outcome: '',
    nextAction: '',
    nextFollowUp: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.outcome.trim()) {
      toast.error('Outcome is required');
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        lead: leadId,
        ...formData,
        duration: formData.duration ? Number(formData.duration) : undefined
      };
      
      const res = await api.post('/interactions', payload);
      toast.success('Interaction logged successfully');
      if (onLogged) onLogged(res.data.interaction);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log interaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-bg-secondary border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-border flex justify-between items-center bg-bg-tertiary/50">
          <h2 className="text-lg font-semibold text-text-primary">Log Interaction</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto custom-scrollbar flex-1">
          <div className="mb-5">
            <label className="block text-sm font-medium text-text-secondary mb-2">Type</label>
            <div className="grid grid-cols-5 gap-2">
              {types.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t.id })}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-colors ${
                    formData.type === t.id 
                      ? 'bg-accent/20 border-accent text-accent' 
                      : 'bg-bg-tertiary border-border text-text-secondary hover:border-accent/50'
                  }`}
                >
                  <div className="mb-1">{t.icon}</div>
                  <span className="text-xs">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Date & Time</label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-text-primary focus:border-accent outline-none"
                required
              />
            </div>
            {formData.type === 'call' && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Duration (mins)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-text-primary focus:border-accent outline-none"
                />
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-1">Outcome / Notes *</label>
            <textarea
              rows="3"
              value={formData.outcome}
              onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
              className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-text-primary focus:border-accent outline-none resize-none"
              placeholder="What was discussed?"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-1">Next Action</label>
            <input
              type="text"
              value={formData.nextAction}
              onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
              className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-text-primary focus:border-accent outline-none"
              placeholder="e.g. Send updated proposal"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-1">Update Follow-up Date (Optional)</label>
            <input
              type="date"
              value={formData.nextFollowUp}
              onChange={(e) => setFormData({ ...formData, nextFollowUp: e.target.value })}
              className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-text-primary focus:border-accent outline-none"
            />
          </div>
        </form>

        <div className="p-4 border-t border-border flex justify-end gap-3 bg-bg-tertiary/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-accent hover:bg-accent-secondary text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-accent/20 disabled:opacity-70"
          >
            {loading ? 'Logging...' : 'Log Interaction'}
          </button>
        </div>
      </div>
    </div>
  );
}
