'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  Clock, 
  AlertTriangle,
  Info,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getNotifications, markNotificationRead } from '@/lib/db';
import { NotificationItem } from '@/lib/db';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const loadNotifications = () => {
    setNotifications(getNotifications());
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = () => {
    notifications.forEach(n => {
      if (!n.read) markNotificationRead(n.id);
    });
    loadNotifications();
  };

  const handleClear = () => {
    if (confirm("Clear notification history?")) {
      localStorage.setItem('salesmind_notifications', JSON.stringify([]));
      loadNotifications();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={14} className="text-brand-warning" />;
      case 'success': return <TrendingUp size={14} className="text-brand-success" />;
      case 'info':
      default: return <Info size={14} className="text-brand-primary" />;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Notification Logs <Bell size={15} />
            </h2>
            <p className="text-xs text-text-muted mt-0.5">Isolate daily task alerts, deal updates, and system achievements.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              Mark All Read
            </Button>
            <Button variant="ghost" size="sm" className="text-brand-error hover:bg-brand-error/10" onClick={handleClear}>
              <Trash2 size={13} className="mr-1" /> Clear History
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="divide-y divide-border-color p-0">
            {notifications.length === 0 ? (
              <div className="p-16 text-center text-xs text-text-muted">
                No notifications logged.
              </div>
            ) : (
              notifications.map((note) => (
                <div 
                  key={note.id} 
                  className={`p-4 hover:bg-input-bg/10 transition-colors flex items-start justify-between gap-4 ${
                    !note.read ? 'bg-brand-primary/5' : ''
                  }`}
                >
                  <div className="flex gap-3 items-start flex-1 text-xs">
                    <div className="w-8 h-8 rounded-full bg-input-bg flex items-center justify-center border border-border-color flex-shrink-0 mt-0.5">
                      {getIcon(note.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-bold ${!note.read ? 'text-white' : 'text-text-secondary'}`}>
                          {note.title}
                        </span>
                        {!note.read && <Badge variant="primary">New</Badge>}
                      </div>
                      <p className="text-text-secondary mt-1 text-xxs leading-relaxed">{note.message}</p>
                      <span className="text-[10px] text-text-muted mt-2 block flex items-center gap-1">
                        <Clock size={10} /> 
                        {new Date(note.date).toLocaleDateString()} at {new Date(note.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {!note.read && (
                    <button
                      onClick={() => {
                        markNotificationRead(note.id);
                        loadNotifications();
                      }}
                      className="p-1.5 rounded hover:bg-input-bg text-brand-success hover:text-white transition-colors cursor-pointer"
                      title="Mark as Read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
