import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationsApi } from '../services/api';
import { NotificationItem } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const data = await notificationsApi.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      alert('Failed to mark all as read.');
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-600" /> Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Updates on your answers, accepted solutions, and coding practice verdicts.
          </p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 p-2 rounded-lg hover:bg-brand-50 transition"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="When developers reply to your posts or your solutions are evaluated, alerts will show here."
          icon={<Bell className="w-6 h-6" />}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n.id)}
              className={`p-4 flex items-start justify-between gap-4 transition hover:bg-slate-50 cursor-pointer ${
                !n.is_read ? 'bg-brand-50/30' : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-brand-600" />}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                  {n.link_url && (
                    <Link
                      to={n.link_url}
                      className="text-brand-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      View Link <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
