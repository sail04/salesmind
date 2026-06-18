'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Clock, 
  Award, 
  CheckCircle,
  TrendingUp,
  FileText
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getCurrentUser } from '@/lib/auth';
import { getLeads, getTasks } from '@/lib/db';
import { Lead, Task } from '@/lib/mockData';

export default function ProfilePage() {
  const user = getCurrentUser();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLeads(await getLeads());
      setTasks(await getTasks());
    };
    loadData();
  }, []);

  if (!user) return null;

  const myLeads = leads.filter(l => l.assignedTo === user.uid);
  const myTasks = tasks.filter(t => t.assignedTo === user.uid);
  const myCompletedTasks = myTasks.filter(t => t.status === 'completed').length;
  const myPendingTasks = myTasks.filter(t => t.status === 'pending').length;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-black text-2xl text-white border border-brand-primary/20 shadow-lg">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {user.name}
              <Badge variant="primary" className="uppercase">{user.role}</Badge>
            </h2>
            <p className="text-xs text-text-muted mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* KPI 1: Leads */}
          <Card className="text-center">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">My Assigned Leads</span>
            <span className="text-2xl font-extrabold text-white block mt-1">{myLeads.length}</span>
            <span className="text-[9px] text-text-muted block mt-1">Under current tracking</span>
          </Card>

          {/* KPI 2: Completed Tasks */}
          <Card className="text-center">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Tasks Completed</span>
            <span className="text-2xl font-extrabold text-brand-success block mt-1">{myCompletedTasks}</span>
            <span className="text-[9px] text-text-muted block mt-1">Out of {myTasks.length} total</span>
          </Card>

          {/* KPI 3: Pending Tasks */}
          <Card className="text-center">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Follow-ups Pending</span>
            <span className="text-2xl font-extrabold text-brand-warning block mt-1">{myPendingTasks}</span>
            <span className="text-[9px] text-text-muted block mt-1">Awaiting interaction</span>
          </Card>
        </div>

        {/* Workspace Credentials card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-brand-primary" />
              <div>
                <CardTitle>Workspace Role Privileges</CardTitle>
                <CardDescription>Review security permissions assigned to your role tier.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="mt-4 space-y-3.5 text-xxs text-text-secondary">
            {user.role === 'admin' && (
              <div className="space-y-2 bg-input-bg/20 p-4 rounded border border-border-color">
                <span className="font-bold text-white block text-xs mb-1">✓ Full System Administrator Access</span>
                <p>You can manage users, re-allocate teams, customize leads, audit revenue, configure Gemini API engines, and review database details.</p>
              </div>
            )}
            {user.role === 'manager' && (
              <div className="space-y-2 bg-input-bg/20 p-4 rounded border border-border-color">
                <span className="font-bold text-white block text-xs mb-1">✓ Team Manager Access</span>
                <p>You can allocate tasks to agents, generate files and spreadsheets, track pipeline analytics, and review client statuses.</p>
              </div>
            )}
            {user.role === 'employee' && (
              <div className="space-y-2 bg-input-bg/20 p-4 rounded border border-border-color">
                <span className="font-bold text-white block text-xs mb-1">✓ Sales Representative Access</span>
                <p>You can review leads assigned to you, update deal pipeline positions, schedule follow-ups, and log interaction history.</p>
              </div>
            )}

            <div className="pt-4 border-t border-border-color/40 flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-1.5">
                <Clock size={12} /> Account Created:
              </span>
              <span className="font-bold text-white">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
