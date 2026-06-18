'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, User, Check, Globe } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { useCurrency } from '@/lib/CurrencyContext';
import { getNotifications, markNotificationRead, NotificationItem } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const Topbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { currency, toggleCurrency } = useCurrency();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const user = getCurrentUser();

  useEffect(() => {
    // Load notifications
    setNotifications(getNotifications());
    
    // Refresh interval for notifications
    const interval = setInterval(() => {
      setNotifications(getNotifications());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close notifications panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    setNotifications(getNotifications());
  };

  const getPageTitle = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return 'Welcome';
    
    // Capitalize first letter of path parts
    const title = parts[0].replace('-', ' ');
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  return (
    <header className="h-16 border-b border-border-color bg-bg-card/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Route Name Title */}
      <div>
        <h1 className="text-base font-bold text-text-primary flex items-center gap-2">
          {getPageTitle()}
          {getPageTitle() === 'Dashboard' && (
            <span className="w-2.5 h-2.5 bg-brand-success rounded-full animate-pulse block" />
          )}
        </h1>
      </div>

      {/* Header Utilities */}
      <div className="flex items-center gap-6">
        {/* Currency Switch Selector */}
        <div className="flex items-center gap-2 bg-input-bg/30 px-3 py-1.5 rounded-full border border-border-color/50">
          <Globe size={13} className="text-text-muted" />
          <Switch
            checked={currency === 'USD'}
            onChange={toggleCurrency}
            label={currency === 'INR' ? '₹ INR' : '$ USD'}
          />
        </div>

        {/* Notifications Center Panel */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-md border border-border-color hover:bg-input-bg transition-colors text-text-secondary hover:text-text-primary cursor-pointer"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-error text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-panel border border-border-color rounded-lg shadow-2xl z-50 overflow-hidden">
              <div className="p-3 border-b border-border-color bg-bg-card flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] text-brand-primary font-bold">{unreadCount} New</span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-border-color">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-text-muted">No notifications</div>
                ) : (
                  notifications.map((note) => (
                    <div 
                      key={note.id} 
                      className={`p-3 text-xs hover:bg-input-bg/30 transition-colors flex justify-between gap-2 ${
                        !note.read ? 'bg-brand-primary/5' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`font-bold ${!note.read ? 'text-brand-primary' : 'text-text-secondary'}`}>
                            {note.title}
                          </span>
                          <span className="text-[9px] text-text-muted">
                            {new Date(note.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-text-secondary leading-relaxed text-[11px]">{note.message}</p>
                      </div>
                      {!note.read && (
                        <button
                          onClick={() => handleMarkRead(note.id)}
                          className="self-start text-[10px] text-brand-success hover:bg-brand-success/10 p-0.5 rounded cursor-pointer"
                          title="Mark Read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-border-color text-center bg-bg-card">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    router.push('/notifications');
                  }}
                  className="text-[10px] font-bold text-brand-primary hover:underline cursor-pointer"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Quick Info */}
        {user && (
          <div className="flex items-center gap-2 border-l border-border-color pl-4">
            <div className="w-8 h-8 rounded-full bg-input-bg flex items-center justify-center text-text-secondary border border-border-color">
              <User size={15} />
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-bold block text-text-primary leading-tight">{user.name}</span>
              <span className="text-[9px] text-text-muted block leading-none capitalize">{user.role}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
