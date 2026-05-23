import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiTarget, FiDollarSign, FiUsers } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

import RevenueChart from '../components/analytics/RevenueChart';
import FunnelChart from '../components/analytics/FunnelChart';
import TeamDashboard from '../components/analytics/TeamDashboard';

export default function Analytics() {
  const [teamData, setTeamData] = useState([]);
  const [pipelineData, setPipelineData] = useState([]);
  const [summary, setSummary] = useState({
    totalLeads: 0,
    totalDeals: 0,
    totalRevenue: 0,
    avgConversion: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [teamRes, pipelineRes] = await Promise.all([
          api.get('/analytics/team'),
          api.get('/analytics/pipeline')
        ]);
        
        const team = teamRes.data.team || teamRes.data;
        const pipeline = pipelineRes.data.pipeline || pipelineRes.data;
        
        setTeamData(team);
        setPipelineData(pipeline);
        
        // Calculate totals
        const tLeads = team.reduce((acc, curr) => acc + curr.totalLeads, 0);
        const tDeals = team.reduce((acc, curr) => acc + curr.dealsClosed, 0);
        const tRevenue = team.reduce((acc, curr) => acc + curr.revenue, 0);
        const activeReps = team.filter(r => r.totalLeads > 0).length;
        const avgConv = activeReps > 0 
          ? team.reduce((acc, curr) => acc + curr.conversionRate, 0) / activeReps 
          : 0;
          
        setSummary({
          totalLeads: tLeads,
          totalDeals: tDeals,
          totalRevenue: tRevenue,
          avgConversion: Math.round(avgConv)
        });
        
      } catch (err) {
        toast.error('Failed to load analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-bg-tertiary rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-bg-tertiary rounded-xl"></div>
          <div className="h-80 bg-bg-tertiary rounded-xl"></div>
        </div>
        <div className="h-96 bg-bg-tertiary rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Analytics Dashboard</h1>
          <p className="text-text-secondary">Overview of team performance and pipeline health.</p>
        </div>
        <div className="text-sm text-text-secondary bg-bg-secondary px-3 py-1.5 rounded-lg border border-border">
          Current Month: {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-bg-secondary border border-border rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-secondary font-medium">Total Leads</h3>
            <div className="w-10 h-10 rounded-lg bg-accent-info/20 text-accent-info flex items-center justify-center">
              <FiUsers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-text-primary">{summary.totalLeads}</div>
        </div>
        
        <div className="bg-bg-secondary border border-border rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-secondary font-medium">Deals Won</h3>
            <div className="w-10 h-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
              <FiTarget className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-text-primary">{summary.totalDeals}</div>
        </div>
        
        <div className="bg-bg-secondary border border-border rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-secondary font-medium">Revenue</h3>
            <div className="w-10 h-10 rounded-lg bg-success/20 text-success flex items-center justify-center">
              <FiDollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-text-primary">₹{summary.totalRevenue.toLocaleString('en-IN')}</div>
        </div>
        
        <div className="bg-bg-secondary border border-border rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-secondary font-medium">Avg Conversion</h3>
            <div className="w-10 h-10 rounded-lg bg-accent-warning/20 text-accent-warning flex items-center justify-center">
              <FiTrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-text-primary">{summary.avgConversion}%</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
        <RevenueChart data={teamData} />
        <FunnelChart data={pipelineData} />
      </div>

      {/* Team Leaderboard */}
      <TeamDashboard teamData={teamData} />
    </div>
  );
}
