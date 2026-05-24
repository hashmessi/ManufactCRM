import React, { useState, useEffect, useMemo } from 'react';
import { FiTrendingUp, FiTrendingDown, FiTarget, FiDollarSign, FiUsers } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

import AnimatedNumber from '../components/shared/AnimatedNumber';
import Sparkline from '../components/shared/Sparkline';
import RevenueChart from '../components/analytics/RevenueChart';
import FunnelChart from '../components/analytics/FunnelChart';
import TeamDashboard from '../components/analytics/TeamDashboard';

// Generate a synthetic 7-point sparkline series from a base value
function generateSparklineData(baseValue) {
  if (!baseValue || baseValue === 0) return [0, 0, 0, 0, 0, 0, 0];
  const variance = baseValue * 0.15;
  return Array.from({ length: 7 }, (_, i) => {
    const trend = (i / 6) * baseValue * 0.1; // slight upward trend
    const noise = (Math.sin(i * 2.5) * variance * 0.5) + (Math.cos(i * 1.8) * variance * 0.3);
    return Math.max(0, Math.round(baseValue * 0.7 + trend + noise));
  });
}

function TrendIndicator({ value }) {
  if (value === 0) return null;
  const isUp = value > 0;
  return (
    <span className={`text-[10px] font-mono font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
      isUp ? 'text-success bg-success/10 border border-success/15' : 'text-danger bg-danger/10 border border-danger/15'
    }`}>
      {isUp ? <FiTrendingUp className="w-2.5 h-2.5" /> : <FiTrendingDown className="w-2.5 h-2.5" />}
      {isUp ? '+' : ''}{value}%
    </span>
  );
}

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
        
        const rawKpis = teamRes.data.kpis || [];
        const pipeline = pipelineRes.data.funnel || [];
        
        const formattedTeam = rawKpis.map(rep => ({
          id: rep.userId,
          name: rep.name || '',
          email: rep.email || '',
          role: rep.role || 'associate',
          target: rep.target || 0,
          totalLeads: rep.totalLeads || 0,
          dealsClosed: rep.dealsClosedThisMonth || 0,
          revenue: rep.monthlyRevenue || 0,
          conversionRate: rep.conversionRate || 0,
          stageBreakdown: rep.leadsByStage || {},
          avgScore: rep.avgScore || 0,
          totalDealValue: rep.totalDealValue || 0,
          revenueVsTarget: rep.revenueVsTarget,
          activity: rep.activity || {}
        }));
        
        setTeamData(formattedTeam);
        setPipelineData(pipeline);
        
        // Calculate totals
        const tLeads = formattedTeam.reduce((acc, curr) => acc + curr.totalLeads, 0);
        const tDeals = formattedTeam.reduce((acc, curr) => acc + curr.dealsClosed, 0);
        const tRevenue = formattedTeam.reduce((acc, curr) => acc + curr.revenue, 0);
        const activeReps = formattedTeam.filter(r => r.totalLeads > 0).length;
        const avgConv = activeReps > 0 
          ? formattedTeam.reduce((acc, curr) => acc + curr.conversionRate, 0) / activeReps 
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

  // KPI card configurations
  const kpiCards = useMemo(() => [
    {
      label: 'Active Pipeline Leads',
      value: summary.totalLeads,
      icon: <FiUsers className="w-4 h-4" />,
      color: '#4f8cff',
      trend: 12,
      sparkline: generateSparklineData(summary.totalLeads),
    },
    {
      label: 'Closed Deals (Month)',
      value: summary.totalDeals,
      icon: <FiTarget className="w-4 h-4" />,
      color: '#7c5cff',
      trend: 8,
      sparkline: generateSparklineData(summary.totalDeals),
    },
    {
      label: 'Closed Value Revenue',
      value: summary.totalRevenue,
      icon: <FiDollarSign className="w-4 h-4" />,
      color: '#10b981',
      trend: 15,
      prefix: '₹',
      sparkline: generateSparklineData(summary.totalRevenue),
    },
    {
      label: 'Lead Conversion Rate',
      value: summary.avgConversion,
      icon: <FiTrendingUp className="w-4 h-4" />,
      color: '#f59e0b',
      trend: -3,
      suffix: '%',
      sparkline: generateSparklineData(summary.avgConversion),
    },
  ], [summary]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-bg-tertiary/40 rounded-xl border border-border/60"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-bg-tertiary/40 rounded-xl border border-border/60"></div>
          <div className="h-80 bg-bg-tertiary/40 rounded-xl border border-border/60"></div>
        </div>
        <div className="h-96 bg-bg-tertiary/40 rounded-xl border border-border/60"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Controls / Calendar Period bar */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs text-text-muted font-medium">
          Executive performance monitoring for ManufactCRM organization.
        </div>
        <div className="text-[10px] font-semibold text-text-muted bg-bg-secondary/40 border border-border/80 px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider">
          Current Period: {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* KPI Cards — Overhauled to flat spatial BI style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="perspective-container">
            <div className="bg-bg-secondary/40 border border-border/80 rounded-xl p-5 shadow-premium-card perspective-card flex flex-col justify-between relative overflow-hidden h-36">
              {/* Top row */}
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-semibold text-text-muted font-mono uppercase tracking-wider">
                  {kpi.label}
                </span>
                <div className="flex items-center gap-2">
                  <TrendIndicator value={kpi.trend} />
                  <div 
                    className="w-6 h-6 rounded-lg bg-bg-tertiary border border-border/85 flex items-center justify-center shrink-0"
                    style={{ color: kpi.color }}
                  >
                    {kpi.icon}
                  </div>
                </div>
              </div>

              {/* Value display */}
              <div className="text-2xl font-bold text-text-primary tracking-tight my-2">
                <AnimatedNumber
                  value={kpi.value}
                  prefix={kpi.prefix || ''}
                  suffix={kpi.suffix || ''}
                />
              </div>

              {/* Sparkline trend representation */}
              <div className="absolute bottom-0 left-0 right-0 h-10 overflow-hidden pointer-events-none opacity-80">
                <Sparkline data={kpi.sparkline} color={kpi.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={teamData} />
        <FunnelChart data={pipelineData} />
      </div>

      {/* Team Leaderboard */}
      <TeamDashboard teamData={teamData} />
    </div>
  );
}
