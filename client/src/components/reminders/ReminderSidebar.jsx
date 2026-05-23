import React, { useEffect, useState } from 'react';
import { FiClock, FiAlertCircle, FiCalendar, FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router';
import api from '../../api/axios';

export default function ReminderSidebar() {
  const navigate = useNavigate();
  const [overdue, setOverdue] = useState([]);
  const [stale, setStale] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const [overdueRes, staleRes] = await Promise.all([
          api.get('/reminders/overdue'),
          api.get('/reminders/stale')
        ]);
        
        setOverdue(overdueRes.data.leads || overdueRes.data || []);
        setStale(staleRes.data.leads || staleRes.data || []);
      } catch (err) {
        console.error('Failed to load reminders:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReminders();
  }, []);

  const navigateToLead = (id) => {
    navigate(`/leads/${id}`);
  };

  if (loading) {
    return (
      <div className="bg-bg-secondary border border-border rounded-xl shadow-lg p-5 h-full animate-pulse">
        <div className="h-6 w-32 bg-bg-tertiary rounded mb-6"></div>
        <div className="space-y-4">
          <div className="h-16 bg-bg-tertiary rounded-lg"></div>
          <div className="h-16 bg-bg-tertiary rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary border border-border rounded-xl shadow-lg flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border bg-bg-tertiary/30">
        <h2 className="text-lg font-semibold text-text-primary flex items-center">
          <FiAlertCircle className="mr-2 text-accent" /> Action Needed
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
        
        {/* Overdue Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center">
              <span className="w-2 h-2 rounded-full bg-accent-danger mr-2"></span> Overdue
            </h3>
            <span className="bg-bg-tertiary text-text-primary text-xs px-2 py-0.5 rounded-full font-medium">
              {overdue.length}
            </span>
          </div>
          
          {overdue.length === 0 ? (
            <p className="text-sm text-text-secondary italic pl-4">No overdue follow-ups.</p>
          ) : (
            <div className="space-y-2">
              {overdue.slice(0, 10).map(lead => (
                <div 
                  key={lead._id}
                  onClick={() => navigateToLead(lead._id)}
                  className="bg-bg-tertiary hover:bg-bg-tertiary/80 border border-border/50 rounded-lg p-3 cursor-pointer transition-colors group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-text-primary text-sm truncate pr-2 group-hover:text-accent transition-colors">
                      {lead.companyName}
                    </h4>
                    <FiChevronRight className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center text-xs text-accent-danger font-medium">
                    <FiCalendar className="mr-1" /> 
                    Due {new Date(lead.nextFollowUp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stale Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center">
              <span className="w-2 h-2 rounded-full bg-accent-warning mr-2"></span> Stale Leads
            </h3>
            <span className="bg-bg-tertiary text-text-primary text-xs px-2 py-0.5 rounded-full font-medium">
              {stale.length}
            </span>
          </div>
          
          {stale.length === 0 ? (
            <p className="text-sm text-text-secondary italic pl-4">No stale leads.</p>
          ) : (
            <div className="space-y-2">
              {stale.slice(0, 10).map(lead => {
                const daysStale = Math.floor((Date.now() - new Date(lead.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div 
                    key={lead._id}
                    onClick={() => navigateToLead(lead._id)}
                    className="bg-bg-tertiary hover:bg-bg-tertiary/80 border border-border/50 rounded-lg p-3 cursor-pointer transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-text-primary text-sm truncate pr-2 group-hover:text-accent transition-colors">
                        {lead.companyName}
                      </h4>
                      <span className="text-xs text-text-secondary">{lead.stage}</span>
                    </div>
                    <div className="flex items-center text-xs text-accent-warning font-medium">
                      <FiClock className="mr-1" /> 
                      No activity for {daysStale} days
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
