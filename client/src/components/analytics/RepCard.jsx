import React from 'react';
import { FiTrendingUp, FiTarget, FiActivity, FiBriefcase } from 'react-icons/fi';

export default function RepCard({ rep }) {
  if (!rep) return null;
  
  const achievementPercent = rep.target > 0 ? Math.round((rep.revenue / rep.target) * 100) : 0;
  
  return (
    <div className="bg-bg-primary rounded-lg p-5 border border-border">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xl">
              {rep.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text-primary">{rep.name}</h4>
              <p className="text-sm text-text-secondary capitalize">{rep.role}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">Monthly Target</span>
                <span className="font-medium text-text-primary">₹{rep.revenue.toLocaleString('en-IN')} / ₹{rep.target.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full h-2.5 bg-bg-tertiary rounded-full overflow-hidden border border-border/50">
                <div 
                  className={`h-full ${achievementPercent >= 100 ? 'bg-success' : achievementPercent >= 60 ? 'bg-accent' : 'bg-accent-danger'}`}
                  style={{ width: `${Math.min(achievementPercent, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg-tertiary rounded-lg p-3 border border-border/50">
                <div className="flex items-center text-text-secondary text-xs mb-1">
                  <FiBriefcase className="mr-1.5" /> Deals Won
                </div>
                <div className="text-lg font-semibold text-text-primary">{rep.dealsClosed}</div>
              </div>
              <div className="bg-bg-tertiary rounded-lg p-3 border border-border/50">
                <div className="flex items-center text-text-secondary text-xs mb-1">
                  <FiTrendingUp className="mr-1.5" /> Conversion
                </div>
                <div className="text-lg font-semibold text-text-primary">{rep.conversionRate}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mini Funnel */}
        <div className="flex-1 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
          <h5 className="text-sm font-medium text-text-secondary mb-3 flex items-center">
            <FiActivity className="mr-2" /> Pipeline Breakdown
          </h5>
          
          <div className="space-y-2">
            {rep.stageBreakdown && Object.entries(rep.stageBreakdown).map(([stage, count]) => {
              if (count === 0) return null;
              // Just pseudo random colors for visual variety based on stage string
              const barColor = stage === 'Won' ? 'bg-success' : stage === 'New' ? 'bg-accent-info' : 'bg-accent';
              
              return (
                <div key={stage} className="flex items-center text-sm">
                  <div className="w-24 text-text-secondary truncate">{stage}</div>
                  <div className="flex-1 mx-3">
                    <div className="h-1.5 w-full bg-bg-tertiary rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${barColor} opacity-80`} 
                        style={{ width: `${Math.max(5, (count / rep.totalLeads) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-8 text-right font-medium text-text-primary">{count}</div>
                </div>
              );
            })}
            {(!rep.stageBreakdown || Object.keys(rep.stageBreakdown).length === 0) && (
              <p className="text-sm text-text-secondary text-center py-4">No active leads</p>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
