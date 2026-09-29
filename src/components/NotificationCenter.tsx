import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, X, ShieldAlert } from 'lucide-react';
import { UserProfile } from '../types';
import { AppToast } from '../lib/notifications';

export const NotificationBell: React.FC<{ currentUser?: UserProfile | null }> = ({ currentUser }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppToast[]>([]);

  useEffect(() => {
    const handleToast = (e: any) => {
      const toast = e.detail as AppToast;
      setNotifications((prev) => [toast, ...prev.slice(0, 19)]);
      setUnreadCount((c) => c + 1);
    };
    window.addEventListener('mlb_app_toast', handleToast);
    return () => window.removeEventListener('mlb_app_toast', handleToast);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setUnreadCount(0);
        }}
        className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-3 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <h4 className="text-xs font-bold text-slate-900">Activity Notifications</h4>
            <span className="text-[10px] text-slate-400">Recent Alerts</span>
          </div>
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No new notifications</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="font-bold text-slate-800">{n.title}</div>
                  <div className="text-slate-600 text-[11px] mt-0.5">{n.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const GlobalToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<AppToast[]>([]);

  useEffect(() => {
    const handleToast = (e: any) => {
      const toast = e.detail as AppToast;
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4500);
    };

    window.addEventListener('mlb_app_toast', handleToast);
    return () => window.removeEventListener('mlb_app_toast', handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-xl border animate-in slide-in-from-bottom-5 duration-200 ${
              isSuccess
                ? 'bg-emerald-950 text-emerald-100 border-emerald-800/80'
                : isError
                ? 'bg-rose-950 text-rose-100 border-rose-800/80'
                : isWarning
                ? 'bg-amber-950 text-amber-100 border-amber-800/80'
                : 'bg-slate-900 text-slate-100 border-slate-700'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {isError && <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-tight">{toast.title}</p>
              <p className="text-[11px] opacity-90 mt-0.5 leading-snug">{toast.message}</p>
            </div>

            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-white/60 hover:text-white shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
