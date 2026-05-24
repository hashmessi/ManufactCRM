import React, { useEffect, useState } from 'react';
import { FiX, FiZap, FiActivity, FiAlertCircle, FiTrendingUp, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
import useLeadStore from '../../store/leadStore.js';
import useAuthStore from '../../store/authStore.js';

export default function AIAssistantDrawer({ isOpen, onClose }) {
  const { leads, fetchLeads } = useLeadStore();
  const { user } = useAuthStore();
  const [insights, setInsights] = useState({
    hotLeads: [],
    staleLeads: [],
    recommendations: [],
    forecastValue: 0,
  });

  useEffect(() => {
    if (leads.length === 0) {
      fetchLeads();
    }
  }, [leads, fetchLeads]);

  useEffect(() => {
    // Generate actual AI insights based on the active dataset
    const activeLeads = leads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost');
    
    // 1. Hot Leads (Score >= 70)
    const hot = activeLeads
      .filter(l => l.score >= 70)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // 2. Stale Leads (Velocity risks: New/Contacted with cold scores or low activity)
    const stale = activeLeads
      .filter(l => l.score < 40 && (l.stage === 'New' || l.stage === 'Contacted'))
      .slice(0, 3);

    // 3. Forecast Value (Calculated based on stage probability weightings)
    // Won = 100%, Negotiation = 70%, Proposal Sent = 50%, Qualified = 30%, Contacted = 10%, New = 5%
    const weights = {
      'New': 0.05,
      'Contacted': 0.10,
      'Qualified': 0.30,
      'Proposal Sent': 0.50,
      'Negotiation': 0.70,
      'Won': 1.0,
      'Lost': 0.0
    };
    
    const forecast = leads.reduce((sum, lead) => {
      const weight = weights[lead.stage] || 0;
      return sum + (lead.dealValue || 0) * weight;
    }, 0);

    // 4. Generate highly relevant recommendations
    const recs = [];
    
    // Recommendation 1: High value deal with no proposal
    const highValueNoProposal = activeLeads.find(l => l.dealValue > 10000000 && l.stage !== 'Proposal Sent' && l.stage !== 'Negotiation');
    if (highValueNoProposal) {
      recs.push({
        id: 'high-val',
        type: 'warning',
        title: 'High-Value Proposal Pending',
        desc: `"${highValueNoProposal.companyName}" is qualified with a deal valuation of ₹${(highValueNoProposal.dealValue / 10000000).toFixed(1)}Cr, but no proposal is sent yet.`,
        action: 'Draft and dispatch contract'
      });
    }

    // Recommendation 2: Follow-up needed for Hot Lead
    const hotNoFollowUp = activeLeads.find(l => l.score >= 75 && !l.nextFollowUp);
    if (hotNoFollowUp) {
      recs.push({
        id: 'hot-followup',
        type: 'danger',
        title: 'Hot Deal Activity Required',
        desc: `"${hotNoFollowUp.companyName}" (Score ${hotNoFollowUp.score}) has no next follow-up date registered in the platform.`,
        action: 'Schedule client call'
      });
    } else {
      // Fallback recommendation
      recs.push({
        id: 'outreach',
        type: 'info',
        title: 'Mid-Market Nurturing Opportunity',
        desc: 'Pipeline velocity is healthy. Focus on nurturing Qualified stage prospects to drive negotiations.',
        action: 'Review qualified leads list'
      });
    }

    // Recommendation 3: Low score lead
    const lowScoreLead = activeLeads.find(l => l.score < 30);
    if (lowScoreLead) {
      recs.push({
        id: 'enrichment',
        type: 'success',
        title: 'Lead Score Improvement Action',
        desc: `"${lowScoreLead.companyName}" has a score of ${lowScoreLead.score} due to low logged interaction history.`,
        action: 'Log WhatsApp or phone update'
      });
    }

    setInsights({
      hotLeads: hot,
      staleLeads: stale,
      recommendations: recs,
      forecastValue: forecast,
    });
  }, [leads]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity animate-fadeIn"
      />
      
      <div className="fixed top-0 right-0 h-screen w-80 sm:w-96 bg-bg-secondary border-l border-border z-50 flex flex-col shadow-2xl animate-slideInRight">
        {/* Drawer Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border/50">
          <div className="flex items-center gap-2">
            <FiZap className="w-5 h-5 text-accent animate-pulse" />
            <h3 className="text-sm font-semibold text-text-primary">AI Sales Assistant</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 dense-scrollbar">
          {/* AI Sales Forecast Card */}
          <div className="bg-bg-tertiary/40 border border-border/80 rounded-xl p-4 shadow-premium-soft relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-accent/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-accent uppercase tracking-wider">
              <FiTrendingUp className="w-3.5 h-3.5" /> Probability Weighted Forecast
            </div>
            <div className="text-2xl font-bold text-text-primary">
              ₹{(insights.forecastValue / 10000000).toFixed(2)}Cr
            </div>
            <p className="text-[10px] text-text-muted mt-1">
              Estimated pipeline value calculated across active deals' closing status probability.
            </p>
          </div>

          {/* AI Recommendations Panel */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider font-mono">Contextual Recommendations</h4>
            {insights.recommendations.map(rec => (
              <div key={rec.id} className="p-3 bg-bg-tertiary/20 border border-border/50 rounded-lg flex gap-3 text-xs">
                <FiAlertCircle className="w-4.5 h-4.5 text-accent shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-text-primary">{rec.title}</p>
                  <p className="text-text-muted leading-relaxed text-[11px]">{rec.desc}</p>
                  <div className="pt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-accent hover:underline cursor-pointer">
                    <FiCheckCircle /> Action: {rec.action}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Hot Deals to Close */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider font-mono">Hot Pipeline Alerts</h4>
            {insights.hotLeads.length > 0 ? (
              insights.hotLeads.map(lead => (
                <div key={lead._id} className="p-3 bg-bg-tertiary/30 border border-border/40 rounded-lg flex justify-between items-center">
                  <div className="overflow-hidden">
                    <p className="font-semibold text-xs text-text-primary truncate">{lead.companyName}</p>
                    <p className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1">
                      <FiDollarSign className="w-3 h-3 text-success" />
                      ₹{(lead.dealValue || 0).toLocaleString('en-IN')} | {lead.stage}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full font-mono shrink-0">
                    {lead.score}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-text-muted italic">No hot deals currently detected.</p>
            )}
          </div>

          {/* Stale Velocity Risks */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider font-mono">Deal Velocity Risks</h4>
            {insights.staleLeads.length > 0 ? (
              insights.staleLeads.map(lead => (
                <div key={lead._id} className="p-3 bg-bg-tertiary/30 border border-border/40 rounded-lg flex justify-between items-center">
                  <div className="overflow-hidden">
                    <p className="font-semibold text-xs text-text-primary truncate">{lead.companyName}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      Stage: {lead.stage} | Inactivity Risk
                    </p>
                  </div>
                  <div className="text-xs font-bold text-danger bg-danger/10 border border-danger/20 px-2 py-0.5 rounded-full font-mono shrink-0">
                    {lead.score}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-text-muted italic">All active pipeline stages show healthy velocity.</p>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-bg-tertiary/30 border-t border-border/50 text-[10px] text-text-muted text-center font-mono">
          Powered by ManufactCRM Sales Intelligence Engine
        </div>
      </div>
    </>
  );
}
