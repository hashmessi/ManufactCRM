import React, { useState } from 'react';
import { FiTrendingUp, FiTarget, FiActivity } from 'react-icons/fi';
import RepCard from './RepCard';

export default function TeamDashboard({ teamData = [] }) {
  const [expandedRep, setExpandedRep] = useState(null);

  // Sort team data by deals closed (descending)
  const sortedData = [...teamData].sort((a, b) => b.dealsClosed - a.dealsClosed);

  return (
    <div className="bg-bg-secondary border border-border rounded-xl shadow-lg overflow-hidden flex flex-col">
      <div className="p-5 border-b border-border bg-bg-tertiary/50">
        <h2 className="text-lg font-semibold text-text-primary flex items-center">
          <FiTarget className="mr-2 text-accent" /> Team Leaderboard
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg-tertiary text-text-secondary text-xs uppercase tracking-wider">
              <th className="p-4 font-medium">Rank</th>
              <th className="p-4 font-medium">Rep Name</th>
              <th className="p-4 font-medium text-right">Leads</th>
              <th className="p-4 font-medium text-right">Deals Won</th>
              <th className="p-4 font-medium text-right">Revenue</th>
              <th className="p-4 font-medium text-right">Target Achieved</th>
              <th className="p-4 font-medium text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedData.map((rep, idx) => {
              const achievementPercent = rep.target > 0 ? Math.round((rep.revenue / rep.target) * 100) : 0;
              let statusColor = 'text-accent-success bg-accent-success/10 border-accent-success/20';
              let statusText = 'On Track';
              
              if (achievementPercent < 60) {
                statusColor = 'text-accent-danger bg-accent-danger/10 border-accent-danger/20';
                statusText = 'Behind';
              } else if (achievementPercent < 80) {
                statusColor = 'text-accent-warning bg-accent-warning/10 border-accent-warning/20';
                statusText = 'At Risk';
              }

              return (
                <React.Fragment key={rep.id}>
                  <tr 
                    className={`hover:bg-bg-tertiary/50 transition-colors cursor-pointer ${expandedRep === rep.id ? 'bg-bg-tertiary' : ''}`}
                    onClick={() => setExpandedRep(expandedRep === rep.id ? null : rep.id)}
                  >
                    <td className="p-4 text-text-primary font-medium">#{idx + 1}</td>
                    <td className="p-4">
                      <div className="font-medium text-text-primary">{rep.name}</div>
                    </td>
                    <td className="p-4 text-right text-text-secondary">{rep.totalLeads}</td>
                    <td className="p-4 text-right text-text-primary font-medium">{rep.dealsClosed}</td>
                    <td className="p-4 text-right text-accent font-medium">
                      ₹{rep.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end">
                        <span className="text-sm font-medium mr-2">{achievementPercent}%</span>
                        <div className="w-16 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${achievementPercent >= 100 ? 'bg-success' : 'bg-accent'}`}
                            style={{ width: `${Math.min(achievementPercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium border ${statusColor}`}>
                        {statusText}
                      </span>
                    </td>
                  </tr>
                  {expandedRep === rep.id && (
                    <tr>
                      <td colSpan="7" className="p-0 border-b border-border bg-bg-tertiary/20">
                        <div className="p-4">
                          <RepCard rep={rep} />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            
            {sortedData.length === 0 && (
              <tr>
                <td colSpan="7" className="p-8 text-center text-text-secondary">
                  No team data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
