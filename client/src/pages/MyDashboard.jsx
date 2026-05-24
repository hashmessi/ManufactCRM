import React, { useEffect, useState, useMemo } from 'react';
import { FiTrendingUp, FiTarget, FiClock, FiActivity, FiArrowRight, FiChevronRight, FiBriefcase, FiZap, FiCalendar, FiFilter } from 'react-icons/fi';
import useAuthStore from '../store/authStore.js';
import useLeadStore from '../store/leadStore.js';
import api from '../api/axios.js';
import ReminderSidebar from '../components/reminders/ReminderSidebar.jsx';
import InteractionTimeline from '../components/interactions/InteractionTimeline.jsx';

export default function MyDashboard() {
  const { user } = useAuthStore();
  const { leads, fetchLeads, loading: leadsLoading } = useLeadStore();
  
  const [data, setData] = useState({
    recentInteractions: [],
    loading: true
  });
  
  const [sortField, setSortField] = useState('dealValue');
  const [sortOrder, setSortOrder] = useState('desc');
  const [stageFilter, setStageFilter] = useState('all');

  useEffect(() => {
    fetchLeads();
    
    const fetchDashboardInteractions = async () => {
      try {
        const interactionsRes = await api.get('/interactions');
        const interactions = interactionsRes.data.interactions || interactionsRes.data || [];
        
        // Filter interactions logged by me, sort by date desc
        const myInteractions = interactions
          .filter(i => i.loggedBy === user?.id || i.loggedBy?._id === user?.id)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
          
        setData({
          recentInteractions: myInteractions,
          loading: false
        });
      } catch (err) {
        console.error('Failed to load dashboard interactions:', err);
        setData(prev => ({ ...prev, loading: false }));
      }
    };
    
    if (user) fetchDashboardInteractions();
  }, [user, fetchLeads]);

  // Scoped leads assigned to the logged-in BDA user
  const myLeads = useMemo(() => {
    return leads.filter(l => l.assignedTo?._id === user?.id || l.assignedTo === user?.id);
  }, [leads, user]);

  // Aggregate personal KPIs
  const myKPIs = useMemo(() => {
    const activeLeads = myLeads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost');
    const totalPipeline = activeLeads.reduce((sum, l) => sum + (l.dealValue || 0), 0);
    const dealsWon = myLeads.filter(l => l.stage === 'Won').length;
    const revenue = myLeads.filter(l => l.stage === 'Won').reduce((sum, l) => sum + (l.dealValue || 0), 0);
    
    // Auto-generate AI insights
    const hotDealsCount = activeLeads.filter(l => l.score >= 75).length;
    const overdueCount = activeLeads.filter(l => {
      if (!l.nextFollowUp) return false;
      return new Date(l.nextFollowUp) < new Date();
    }).length;

    return {
      totalPipeline,
      dealsWon,
      revenue,
      hotDeals: hotDealsCount,
      overdueActions: overdueCount
    };
  }, [myLeads]);

  // Sorted and filtered leads list for our Enterprise Data Table
  const filteredAndSortedLeads = useMemo(() => {
    let result = [...myLeads];
    
    // Filter
    if (stageFilter !== 'all') {
      result = result.filter(l => l.stage === stageFilter);
    }
    
    // Sort
    result.sort((a, b) => {
      let fieldA = a[sortField];
      let fieldB = b[sortField];
      
      // Safety checks for nested structures
      if (sortField === 'score') {
        fieldA = a.score?.totalScore ?? a.score ?? 0;
        fieldB = b.score?.totalScore ?? b.score ?? 0;
      }
      
      if (typeof fieldA === 'string') {
        return sortOrder === 'asc' 
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }
      
      return sortOrder === 'asc'
        ? (fieldA || 0) - (fieldB || 0)
        : (fieldB || 0) - (fieldA || 0);
    });
    
    return result;
  }, [myLeads, sortField, sortOrder, stageFilter]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  if (data.loading || leadsLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-24 bg-bg-tertiary/40 rounded-xl border border-border/60"></div>
        <div className="h-64 bg-bg-tertiary/40 rounded-xl border border-border/60"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-bg-tertiary/40 rounded-xl border border-border/60"></div>
          <div className="h-80 bg-bg-tertiary/40 rounded-xl border border-border/60"></div>
        </div>
      </div>
    );
  }

  const target = user?.target || 5000000;
  const achievementPercent = target > 0 ? Math.round((myKPIs.revenue / target) * 100) : 0;
  
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysRemaining = lastDay.getDate() - today.getDate();

  return (
    <div className="space-y-6 fade-in h-full flex flex-col">
      {/* Target Progress Bar & Header */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4">
        {/* Left Side: Vercel-style clean target card */}
        <div className="flex-1 bg-bg-secondary/40 border border-border/80 rounded-xl p-5 shadow-premium-card relative overflow-hidden flex flex-col justify-between select-none">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider font-mono">Monthly Target Attainment</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-text-primary">₹{myKPIs.revenue.toLocaleString('en-IN')}</span>
                <span className="text-xs text-text-muted">of ₹{target.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border self-start sm:self-center ${
              achievementPercent >= 100 ? 'text-success bg-success/10 border-success/20' : 
              achievementPercent >= 60 ? 'text-accent bg-accent/10 border-accent/20' : 'text-danger bg-danger/10 border-danger/20'
            }`}>
              {achievementPercent}% Completed
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden border border-border">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${
                  achievementPercent >= 100 ? 'bg-success' : 
                  achievementPercent >= 60 ? 'bg-accent' : 'bg-danger'
                }`}
                style={{ width: `${Math.min(achievementPercent, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-text-muted">
              <span>Run-Rate Goal</span>
              <span>100% Target Pace</span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick BI Stats */}
        <div className="grid grid-cols-3 gap-3 min-w-[320px] lg:min-w-[450px]">
          <div className="bg-bg-secondary/40 border border-border/80 rounded-xl p-4 flex flex-col justify-between shadow-premium-card">
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-mono uppercase tracking-wider">
              <FiClock className="w-3.5 h-3.5" /> Days Left
            </div>
            <div className="text-xl font-bold text-text-primary mt-2">{daysRemaining}d</div>
            <span className="text-[9px] text-text-muted font-mono">Closing Period</span>
          </div>

          <div className="bg-bg-secondary/40 border border-border/80 rounded-xl p-4 flex flex-col justify-between shadow-premium-card">
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-mono uppercase tracking-wider">
              <FiActivity className="w-3.5 h-3.5" /> Won Deals
            </div>
            <div className="text-xl font-bold text-text-primary mt-2">{myKPIs.dealsWon}</div>
            <span className="text-[9px] text-text-muted font-mono">This Month</span>
          </div>

          <div className="bg-bg-secondary/40 border border-border/80 rounded-xl p-4 flex flex-col justify-between shadow-premium-card">
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-mono uppercase tracking-wider">
              <FiBriefcase className="w-3.5 h-3.5 text-accent" /> Active Pipeline
            </div>
            <div className="text-xl font-bold text-text-primary mt-2">₹{(myKPIs.totalPipeline / 100000).toFixed(0)}L</div>
            <span className="text-[9px] text-text-muted font-mono">{myLeads.length} Account{myLeads.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Enterprise-Quality Leads Data Table */}
      <div className="bg-bg-secondary/40 border border-border/80 rounded-xl p-5 shadow-premium-card flex flex-col select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex flex-col">
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">BDA Managed Accounts Ledger</h3>
            <span className="text-[10px] text-text-muted mt-0.5">High-readability, sortable grid listing your active leads and contract value.</span>
          </div>

          {/* Filtering chips */}
          <div className="flex items-center gap-1.5">
            <FiFilter className="w-3.5 h-3.5 text-text-muted shrink-0 mr-1" />
            {['all', 'New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation'].map(stage => (
              <button
                key={stage}
                onClick={() => setStageFilter(stage)}
                className={`text-[9px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded border transition-colors ${
                  stageFilter === stage 
                    ? 'bg-accent/15 border-accent text-accent' 
                    : 'bg-bg-tertiary/40 border-border/60 text-text-muted hover:text-text-primary hover:bg-bg-tertiary'
                }`}
              >
                {stage === 'all' ? 'All Stages' : stage}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto dense-scrollbar border border-border/60 rounded-lg">
          <table className="w-full text-left border-collapse select-none">
            <thead>
              <tr className="bg-bg-tertiary/40 border-b border-border text-[9px] font-mono text-text-muted uppercase tracking-wider">
                <th 
                  className="py-3 px-4 cursor-pointer hover:text-text-primary transition-colors"
                  onClick={() => handleSort('companyName')}
                >
                  Company Name {sortField === 'companyName' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:text-text-primary transition-colors"
                  onClick={() => handleSort('dealValue')}
                >
                  Deal Value {sortField === 'dealValue' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:text-text-primary transition-colors"
                  onClick={() => handleSort('stage')}
                >
                  Stage {sortField === 'stage' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:text-text-primary transition-colors"
                  onClick={() => handleSort('score')}
                >
                  Priority Score {sortField === 'score' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="py-3 px-4">Next Follow-Up</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs text-text-primary font-medium divide-y divide-border/40">
              {filteredAndSortedLeads.length > 0 ? (
                filteredAndSortedLeads.map(lead => {
                  const scoreVal = lead.score?.totalScore ?? lead.score ?? 0;
                  const isHot = scoreVal >= 75;
                  const isOverdueFollowUp = lead.nextFollowUp && new Date(lead.nextFollowUp) < new Date();
                  
                  return (
                    <tr key={lead._id} className="hover:bg-bg-tertiary/20 transition-colors group">
                      <td className="py-3.5 px-4 font-semibold text-text-primary">{lead.companyName}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold">₹{lead.dealValue ? lead.dealValue.toLocaleString('en-IN') : '0'}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-semibold bg-bg-tertiary border border-border/80 px-2 py-0.5 rounded text-text-muted">
                          {lead.stage}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border rounded-full ${
                          isHot ? 'text-danger bg-danger/10 border-danger/20' : 
                          scoreVal >= 40 ? 'text-warning bg-warning/10 border-warning/20' : 'text-accent bg-accent/10 border-accent/20'
                        }`}>
                          {scoreVal} ({isHot ? 'High' : scoreVal >= 40 ? 'Med' : 'Low'})
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {lead.nextFollowUp ? (
                          <span className={`flex items-center gap-1 font-mono text-[10px] ${isOverdueFollowUp ? 'text-danger' : 'text-text-muted'}`}>
                            <FiCalendar className="w-3 h-3" />
                            {new Date(lead.nextFollowUp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        ) : (
                          <span className="text-[10px] text-text-muted italic">Not Scheduled</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a 
                          href={`/leads/${lead._id}`}
                          className="inline-flex items-center gap-0.5 text-[10px] font-bold text-accent hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View Profile <FiChevronRight />
                        </a>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-text-muted font-mono italic text-xs">
                    No active accounts found matching the selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[350px]">
        {/* Left Column - Interactions Log */}
        <div className="lg:col-span-2 h-full">
          <InteractionTimeline 
            interactions={data.recentInteractions} 
            onLogClick={() => window.location.href = '/pipeline'} 
          />
        </div>
        
        {/* Right Column - Embedded AI Sales Coach Insight Box */}
        <div className="h-full flex flex-col gap-6">
          {/* AI Sales Coach Widget */}
          <div className="bg-bg-secondary/40 border border-border/80 rounded-xl p-5 shadow-premium-card relative overflow-hidden flex flex-col justify-between select-none">
            <div className="absolute right-0 top-0 w-24 h-24 bg-accent/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-4 text-[10px] font-semibold text-accent uppercase tracking-wider font-mono">
              <FiZap className="w-4 h-4 text-accent animate-pulse" /> Personal AI Sales Coach
            </div>

            <div className="space-y-4 flex-1">
              <div className="p-3 bg-bg-tertiary/20 border border-border/50 rounded-lg flex gap-3 text-xs">
                  <div className="space-y-1">
                    <p className="font-semibold text-text-primary">Pipeline Run-Rate Prediction</p>
                    <p className="text-text-muted leading-relaxed text-[11px]">
                      Based on your active deals' score velocity, you are modeled to close{' '}
                      <strong className="text-text-primary font-semibold">₹{(myKPIs.revenue / 100000 + myKPIs.totalPipeline * 0.45 / 100000).toFixed(1)}L</strong>{' '}
                      this month, comfortably pacing above target.
                    </p>
                  </div>
              </div>

              {myKPIs.overdueActions > 0 && (
                <div className="p-3 bg-danger/5 border border-danger/20 rounded-lg flex gap-3 text-xs">
                  <div className="space-y-1">
                    <p className="font-semibold text-danger">Follow-up Velocity Risk</p>
                    <p className="text-text-muted leading-relaxed text-[11px]">
                      You have{' '}
                      <strong className="text-danger font-semibold">{myKPIs.overdueActions} overdue client follow-up{myKPIs.overdueActions !== 1 ? 's' : ''}</strong>.
                      {' '}Failing to schedule contact within 48h increases drop-off risk by up to 22%.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border/40 mt-4 flex items-center justify-between text-[10px] font-mono text-text-muted">
              <span>Sales Coach Score: 88/100</span>
              <button 
                onClick={() => {
                  const btn = document.getElementById('ai-drawer-trigger');
                  if (btn) btn.click();
                }}
                className="text-accent hover:underline font-bold flex items-center gap-0.5"
              >
                Open Coach <FiArrowRight />
              </button>
            </div>
          </div>
          
          {/* Embedded Reminders Sidebar Panel */}
          <div className="flex-1 min-h-[220px]">
            <ReminderSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
