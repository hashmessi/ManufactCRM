import React, { useEffect } from 'react';
import { FiBell, FiCheck, FiClock, FiAlertCircle, FiTarget, FiUserPlus, FiInfo } from 'react-icons/fi';
import useNotificationStore from '../store/notificationStore';
import { useNavigate } from 'react-router';
import api from '../api/axios';

export default function Notifications() {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllRead, loading } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await markAsRead(notif._id);
    }
    if (notif.lead) {
      navigate(`/leads/${notif.lead}`);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'follow_up_due': return <FiClock className="text-accent-warning" />;
      case 'stale_lead': return <FiAlertCircle className="text-accent-danger" />;
      case 'target_alert': return <FiTarget className="text-success" />;
      case 'lead_assigned': return <FiUserPlus className="text-accent-info" />;
      default: return <FiInfo className="text-text-secondary" />;
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="animate-pulse space-y-4 max-w-3xl mx-auto">
        <div className="h-8 w-48 bg-bg-tertiary rounded mb-6"></div>
        {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-bg-tertiary rounded-xl"></div>)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">
      <div className="flex justify-between items-end border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1 flex items-center">
            <FiBell className="mr-3 text-accent" /> Notifications
            {unreadCount > 0 && (
              <span className="ml-3 bg-accent text-white text-xs px-2 py-0.5 rounded-full font-medium">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-text-secondary">Stay updated on your pipeline and targets.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllRead}
            className="text-sm font-medium text-accent hover:text-accent-secondary flex items-center transition-colors"
          >
            <FiCheck className="mr-1" /> Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-bg-secondary border border-border rounded-xl p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4 text-text-secondary">
              <FiBell size={24} />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-1">All caught up!</h3>
            <p className="text-text-secondary">You don't have any notifications right now.</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif._id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 rounded-xl border transition-colors cursor-pointer flex gap-4 ${
                notif.read 
                  ? 'bg-bg-secondary border-border hover:bg-bg-tertiary/50' 
                  : 'bg-bg-tertiary border-accent/30 shadow-md shadow-accent/5 hover:border-accent/50'
              }`}
            >
              <div className="mt-1">
                <div className="w-10 h-10 rounded-full bg-bg-primary border border-border flex items-center justify-center">
                  {getIcon(notif.type)}
                </div>
              </div>
              <div className="flex-1">
                <p className={`text-sm ${notif.read ? 'text-text-secondary' : 'text-text-primary font-medium'}`}>
                  {notif.message}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                  <span>{new Date(notif.createdAt).toLocaleString()}</span>
                  {notif.lead && (
                    <span className="text-accent group-hover:underline">View Lead &rarr;</span>
                  )}
                </div>
              </div>
              {!notif.read && (
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent"></div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
