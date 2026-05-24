import React, { useState, useEffect } from 'react';
import { FiPlus, FiFilter, FiLoader } from 'react-icons/fi';
import KanbanBoard from '../components/pipeline/KanbanBoard.jsx';
import LeadForm from '../components/leads/LeadForm.jsx';
import useLeadStore from '../store/leadStore.js';
import useAuthStore from '../store/authStore.js';
import api from '../api/axios.js';

export default function Pipeline() {
  const [showForm, setShowForm] = useState(() => window.location.search.includes('add=true'));
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
    
    // Check if query params ask us to trigger Add Lead form (from Topbar click)
    if (window.location.search.includes('add=true')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [fetchLeads]);

  useEffect(() => {
    if (isManagerOrAdmin) {
      api
        .get('/users/assignable')
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
    <div className="animate-fadeIn space-y-4" id="pipeline-page">
      {/* Controls Bar — Integrated and flat */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="text-xs text-text-muted font-medium">
          Drag and drop lead cards across stages to record visual progress.
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold bg-bg-secondary/40 border-border/80 text-text-primary hover:bg-bg-tertiary transition-all ${
              showFilters ? 'border-accent text-accent bg-accent/5' : ''
            }`}
            id="pipeline-filter-btn"
          >
            <FiFilter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
          
          <button
            id="add-lead-btn"
            onClick={() => setShowForm(true)}
            className="flex btn-primary items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="bg-bg-secondary/40 border border-border/80 rounded-xl p-4 mb-4 animate-slideDown shadow-premium-soft select-none">
          <div className="flex flex-wrap items-end gap-4">
            {isManagerOrAdmin && (
              <div className="min-w-[180px]">
                <label htmlFor="filter-assigned" className="block text-[10px] font-semibold text-text-muted mb-1 font-mono uppercase tracking-wider">
                  Assigned Rep
                </label>
                <select
                  id="filter-assigned"
                  value={filterAssigned}
                  onChange={(e) => setFilterAssigned(e.target.value)}
                  className="bg-bg-tertiary border border-border/80 rounded-lg text-xs text-text-primary outline-none focus:border-accent/80 p-2 w-full"
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
              <label htmlFor="filter-score" className="block text-[10px] font-semibold text-text-muted mb-1 font-mono uppercase tracking-wider">
                Score Tier
              </label>
              <select
                id="filter-score"
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value)}
                className="bg-bg-tertiary border border-border/80 rounded-lg text-xs text-text-primary outline-none focus:border-accent/80 p-2 w-full"
              >
                <option value="">All Scores</option>
                <option value="hot">🔴 Hot (75-100)</option>
                <option value="warm">🟡 Warm (40-74)</option>
                <option value="cold">🔵 Cold (0-39)</option>
              </select>
            </div>

            <div className="min-w-[150px]">
              <label htmlFor="filter-source" className="block text-[10px] font-semibold text-text-muted mb-1 font-mono uppercase tracking-wider">
                Source
              </label>
              <select
                id="filter-source"
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="bg-bg-tertiary border border-border/80 rounded-lg text-xs text-text-primary outline-none focus:border-accent/80 p-2 w-full"
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
                className="px-3.5 py-2 bg-accent text-white hover:bg-accent/90 rounded-lg text-xs font-semibold transition-all"
                id="filter-apply-btn"
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="px-3.5 py-2 bg-bg-tertiary border border-border text-text-primary hover:bg-bg-tertiary/80 rounded-lg text-xs font-semibold transition-all"
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
        <div className="flex items-center justify-center py-24 bg-bg-secondary/10 border border-border/40 rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <FiLoader className="w-6 h-6 text-accent animate-spin" />
            <p className="text-xs text-text-muted font-mono">Loading active pipeline...</p>
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
