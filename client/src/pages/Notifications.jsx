import React, { useEffect } from 'react';
import { FiBell, FiCheck, FiClock, FiAlertCircle, FiTarget, FiUserPlus, FiInfo } from 'react-icons/fi';
import useNotificationStore from '../store/notificationStore';
import { useNavigate } from 'react-router';
import EmptyState from '../components/shared/EmptyState';

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

  const getIconConfig = (type) => {
    switch (type) {
      case 'follow_up_due':   return { icon: <FiClock className="w-4 h-4" />,      color: 'text-warning',  bg: 'bg-warning/10 border-warning/20' };
      case 'stale_lead':      return { icon: <FiAlertCircle className="w-4 h-4" />, color: 'text-danger',   bg: 'bg-danger/10 border-danger/20'  };
      case 'target_alert':    return { icon: <FiTarget className="w-4 h-4" />,      color: 'text-success',  bg: 'bg-success/10 border-success/20' };
      case 'lead_assigned':   return { icon: <FiUserPlus className="w-4 h-4" />,    color: 'text-info',     bg: 'bg-info/10 border-info/20'      };
      default:                return { icon: <FiInfo className="w-4 h-4" />,        color: 'text-text-muted', bg: 'bg-bg-tertiary border-border'  };
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-3">
        <div className="h-10 w-56 bg-bg-tertiary/40 rounded-xl mb-6" />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-20 bg-bg-tertiary/30 border border-border/40 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fadeIn">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-lg font-semibold text-text-primary tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted">
            Follow-up alerts, pipeline updates, and team activity.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-primary bg-bg-secondary border border-border/60 px-3 py-1.5 rounded-lg transition-all hover:border-border"
          >
            <FiCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="bg-bg-secondary/40 border border-border/60 rounded-xl">
            <EmptyState
              icon={<FiBell className="w-5 h-5 text-text-muted" />}
              title="You're all caught up"
              subtitle="No new notifications right now. We'll alert you when there's pipeline activity."
            />
          </div>
        ) : (
          notifications.map(notif => {
            const iconConfig = getIconConfig(notif.type);
            return (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`group flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  notif.read
                    ? 'bg-bg-secondary/30 border-border/40 hover:bg-bg-secondary/60 hover:border-border'
                    : 'bg-bg-secondary/60 border-accent/20 hover:border-accent/40 shadow-sm'
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick(notif)}
                aria-label={`Notification: ${notif.message}`}
              >
                {/* Icon Container */}
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${iconConfig.bg} ${iconConfig.color}`}>
                  {iconConfig.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${notif.read ? 'text-text-muted' : 'text-text-primary font-medium'}`}>
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] text-text-muted font-mono">
                      {formatTime(notif.createdAt)}
                    </span>
                    {notif.lead && (
                      <span className="text-[11px] text-accent group-hover:underline font-medium">
                        View lead →
                      </span>
                    )}
                  </div>
                </div>

                {/* Unread indicator */}
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
