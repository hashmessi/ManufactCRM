import React, { useState, useEffect } from 'react';
import { FiPlus, FiFilter, FiLoader } from 'react-icons/fi';
import KanbanBoard from '../components/pipeline/KanbanBoard.jsx';
import LeadForm from '../components/leads/LeadForm.jsx';
import useLeadStore from '../store/leadStore.js';
import useAuthStore from '../store/authStore.js';
import api from '../api/axios.js';

export default function Pipeline() {
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [users, setUsers] = useState([]);
  const [filterAssigned, setFilterAssigned] = useState('');
  const [filterScore, setFilterScore] = useState('');
  const [filterSource, setFilterSource] = useState('');

  const fetchLeads = useLeadStore((s) => s.fetchLeads);
  const loading = useLeadStore((s) => s.loading);
  const user = useAuthStore((s) => s.user);

  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin';

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (isManagerOrAdmin) {
      api
        .get('/users')
        .then((res) => setUsers(res.data.users || res.data || []))
        .catch(() => setUsers([]));
    }
  }, [isManagerOrAdmin]);

  const handleApplyFilters = () => {
    const filters = {};
    if (filterAssigned) filters.assignedTo = filterAssigned;
    if (filterScore) filters.scoreTier = filterScore;
    if (filterSource) filters.source = filterSource;
    fetchLeads(filters);
  };

  const handleClearFilters = () => {
    setFilterAssigned('');
    setFilterScore('');
    setFilterSource('');
    fetchLeads();
  };

  return (
    <div className="animate-fadeIn" id="pipeline-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Sales Pipeline</h1>
          <p className="text-sm text-text-muted mt-1">
            Drag and drop leads between stages to update their progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'border-accent text-accent' : ''}`}
            id="pipeline-filter-btn"
          >
            <FiFilter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
            id="pipeline-add-lead-btn"
          >
            <FiPlus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="card mb-6 animate-slideDown">
          <div className="flex flex-wrap items-end gap-4">
            {isManagerOrAdmin && (
              <div className="min-w-[180px]">
                <label htmlFor="filter-assigned" className="block text-xs font-medium text-text-muted mb-1">
                  Assigned Rep
                </label>
                <select
                  id="filter-assigned"
                  value={filterAssigned}
                  onChange={(e) => setFilterAssigned(e.target.value)}
                  className="input-dark text-sm"
                >
                  <option value="">All Reps</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="min-w-[150px]">
              <label htmlFor="filter-score" className="block text-xs font-medium text-text-muted mb-1">
                Score Tier
              </label>
              <select
                id="filter-score"
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value)}
                className="input-dark text-sm"
              >
                <option value="">All Scores</option>
                <option value="hot">🔴 Hot (80-100)</option>
                <option value="warm">🟡 Warm (50-79)</option>
                <option value="cold">🔵 Cold (0-49)</option>
              </select>
            </div>

            <div className="min-w-[150px]">
              <label htmlFor="filter-source" className="block text-xs font-medium text-text-muted mb-1">
                Source
              </label>
              <select
                id="filter-source"
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="input-dark text-sm"
              >
                <option value="">All Sources</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Exhibition">Exhibition</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="IndiaMart">IndiaMart</option>
                <option value="TradeIndia">TradeIndia</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleApplyFilters}
                className="btn-primary text-sm py-2"
                id="filter-apply-btn"
              >
                Apply
              </button>
              <button
                onClick={handleClearFilters}
                className="btn-secondary text-sm py-2"
                id="filter-clear-btn"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <FiLoader className="w-8 h-8 text-accent animate-spin" />
            <p className="text-sm text-text-muted">Loading pipeline...</p>
          </div>
        </div>
      ) : (
        <KanbanBoard />
      )}

      {/* Lead Form Modal */}
      {showForm && <LeadForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
