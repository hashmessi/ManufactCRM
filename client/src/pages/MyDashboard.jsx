import React, { useEffect, useState } from 'react';
import { FiTrendingUp, FiTarget, FiClock, FiActivity } from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import ReminderSidebar from '../components/reminders/ReminderSidebar';
import InteractionTimeline from '../components/interactions/InteractionTimeline';

export default function MyDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState({
    leadsAssigned: 0,
    dealsClosed: 0,
    revenue: 0,
    target: user?.target || 0,
    recentInteractions: [],
    loading: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // We'll fetch the team analytics and filter for the current user
        // In a real app we'd have a specific endpoint for /analytics/me
        const [teamRes, interactionsRes] = await Promise.all([
          api.get('/analytics/team'),
          api.get('/interactions') // assuming this returns all interactions for user
        ]);
        
        const team = teamRes.data.team || teamRes.data;
        const myData = team.find(r => r.id === user?.id) || {
          totalLeads: 0, dealsClosed: 0, revenue: 0, target: user?.target || 0
        };
        
        const interactions = interactionsRes.data.interactions || interactionsRes.data || [];
        // Filter interactions logged by me, sort by date desc, take 10
        const myInteractions = interactions
          .filter(i => i.loggedBy === user?.id || i.loggedBy?._id === user?.id)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10);
          
        setData({
          leadsAssigned: myData.totalLeads,
          dealsClosed: myData.dealsClosed,
          revenue: myData.revenue,
          target: myData.target,
          recentInteractions: myInteractions,
          loading: false
        });
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setData(prev => ({ ...prev, loading: false }));
      }
    };
    
    if (user) fetchDashboardData();
  }, [user]);

  if (data.loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-48 bg-bg-tertiary rounded"></div>
        <div className="h-32 bg-bg-tertiary rounded-xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-bg-tertiary rounded-xl"></div>
          <div className="h-96 bg-bg-tertiary rounded-xl"></div>
        </div>
      </div>
    );
  }

  const achievementPercent = data.target > 0 ? Math.round((data.revenue / data.target) * 100) : 0;
  
  // Calculate days remaining in month
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysRemaining = lastDay.getDate() - today.getDate();
  const isMidMonthBehind = today.getDate() >= 15 && achievementPercent < 60;

  return (
    <div className="space-y-6 fade-in h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Welcome, {user?.name.split(' ')[0]}</h1>
        <p className="text-text-secondary">Here's your performance overview for {today.toLocaleString('default', { month: 'long' })}.</p>
      </div>

      {/* Main Target Progress Card */}
      <div className="bg-bg-secondary border border-border rounded-xl p-6 shadow-lg relative overflow-hidden">
        {/* Background glow effect based on performance */}
        <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none ${
          achievementPercent >= 100 ? 'bg-success' : achievementPercent >= 60 ? 'bg-accent' : 'bg-accent-danger'
        }`} />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 relative z-10">
          <div>
            <h2 className="text-lg font-medium text-text-secondary mb-1">Monthly Target Progress</h2>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-text-primary">₹{data.revenue.toLocaleString('en-IN')}</span>
              <span className="text-xl text-text-secondary mb-1">/ ₹{data.target.toLocaleString('en-IN')}</span>
            </div>
          </div>
          
          <div className="flex gap-4 mt-4 md:mt-0">
            <div className="bg-bg-tertiary rounded-lg p-3 border border-border/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-info/20 text-accent-info flex items-center justify-center">
                <FiClock />
              </div>
              <div>
                <div className="text-sm text-text-secondary">Days Left</div>
                <div className="font-semibold text-text-primary">{daysRemaining}</div>
              </div>
            </div>
            <div className="bg-bg-tertiary rounded-lg p-3 border border-border/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                <FiActivity />
              </div>
              <div>
                <div className="text-sm text-text-secondary">Deals Won</div>
                <div className="font-semibold text-text-primary">{data.dealsClosed}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between text-sm mb-2 font-medium">
            <span className={
              achievementPercent >= 100 ? 'text-success' : 
              achievementPercent >= 60 ? 'text-accent' : 'text-accent-danger'
            }>
              {achievementPercent}% Achieved
            </span>
            {isMidMonthBehind && (
              <span className="text-accent-danger flex items-center">
                <FiTarget className="mr-1" /> Behind target pace
              </span>
            )}
          </div>
          <div className="w-full h-4 bg-bg-tertiary rounded-full overflow-hidden border border-border">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${
                achievementPercent >= 100 ? 'bg-success' : 
                achievementPercent >= 60 ? 'bg-accent' : 'bg-accent-danger'
              }`}
              style={{ width: `${Math.min(achievementPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        {/* Left Column - Interactions */}
        <div className="lg:col-span-2 h-full">
          <InteractionTimeline 
            interactions={data.recentInteractions} 
            onLogClick={() => document.getElementById('pipeline-link').click()} 
          />
        </div>
        
        {/* Right Column - Reminders Sidebar embedded */}
        <div className="h-full">
          <ReminderSidebar />
        </div>
      </div>
      
      {/* Hidden link to navigate to pipeline from Log Interaction button */}
      <a id="pipeline-link" href="/pipeline" className="hidden">Pipeline</a>
    </div>
  );
}
