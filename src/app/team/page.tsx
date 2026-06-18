'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  DollarSign, 
  Mail, 
  Shield, 
  Award,
  Sparkles
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCurrency } from '@/lib/CurrencyContext';
import { getLeads, getTasks } from '@/lib/db';
import { Lead, Task, mockUsers } from '@/lib/mockData';

export default function TeamManagementPage() {
  const { formatPrice } = useCurrency();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLeads(await getLeads());
      setTasks(await getTasks());
    };
    loadData();
  }, []);

  // Custom detailed mock performance stats
  const memberPerformances = [
    { 
      uid: 'u1', 
      name: 'Sarah Connor', 
      role: 'admin', 
      email: 'admin@nexvora.com',
      revenue: 1100000, 
      conversion: 45,
      tasksCompleted: 8,
      activeLeads: 0
    },
    { 
      uid: 'u2', 
      name: 'John Doe', 
      role: 'manager', 
      email: 'john@nexvora.com',
      revenue: 850000, 
      conversion: 40,
      tasksCompleted: 14,
      activeLeads: 1
    },
    { 
      uid: 'u3', 
      name: 'Alice Smith', 
      role: 'employee', 
      email: 'alice@nexvora.com',
      revenue: 420000, 
      conversion: 35,
      tasksCompleted: 9,
      activeLeads: 3
    },
    { 
      uid: 'u4', 
      name: 'Bob Johnson', 
      role: 'employee', 
      email: 'bob@nexvora.com',
      revenue: 310000, 
      conversion: 30,
      tasksCompleted: 11,
      activeLeads: 3
    }
  ];

  return (
    <AppLayout>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <Card className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Total Sales Reps</span>
            <span className="text-xl font-extrabold text-white block mt-1">4 Active</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
            <Users size={16} />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Top Performer</span>
            <span className="text-xl font-extrabold text-brand-success block mt-1">Sarah Connor</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-success/10 border border-brand-success/20 flex items-center justify-center text-brand-success">
            <Award size={16} />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Team Conversion Avg</span>
            <span className="text-xl font-extrabold text-white block mt-1">37.5%</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent">
            <TrendingUp size={16} />
          </div>
        </Card>
      </div>

      {/* Grid of Team Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {memberPerformances.map((rep) => {
          // Dynamic calculation of tasks completed and leads count if present in state
          const dynamicTasksDone = tasks.filter(t => t.assignedTo === rep.uid && t.status === 'completed').length;
          const dynamicLeadsCount = leads.filter(l => l.assignedTo === rep.uid).length;
          
          const totalTasks = rep.tasksCompleted + dynamicTasksDone;
          const assignedLeadsCount = rep.activeLeads || dynamicLeadsCount;

          return (
            <Card key={rep.uid} hoverable className="flex flex-col justify-between">
              <div>
                {/* Header card info */}
                <div className="flex items-start justify-between border-b border-border-color pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {rep.name}
                      {rep.revenue > 800000 && (
                        <Sparkles size={12} className="text-brand-warning animate-pulse" />
                      )}
                    </h3>
                    <p className="text-xxs text-text-muted flex items-center gap-1 mt-1">
                      <Mail size={11} /> {rep.email}
                    </p>
                  </div>
                  <Badge variant={rep.role === 'admin' ? 'success' : rep.role === 'manager' ? 'primary' : 'gray'}>
                    {rep.role}
                  </Badge>
                </div>

                {/* Score panel */}
                <div className="grid grid-cols-3 gap-2.5 bg-input-bg/10 p-3 rounded-lg border border-border-color/40 text-center mb-4">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-text-muted font-bold block">Closed Value</span>
                    <span className="text-xs font-black text-brand-success block mt-1">
                      {formatPrice(rep.revenue)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-text-muted font-bold block">Conversion</span>
                    <span className="text-xs font-black text-white block mt-1">
                      {rep.conversion}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-text-muted font-bold block">Active Leads</span>
                    <span className="text-xs font-black text-white block mt-1">
                      {assignedLeadsCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress items */}
              <div className="space-y-3 pt-2 text-xxs text-text-secondary">
                <div className="flex justify-between items-center">
                  <span>Assigned Tasks Checklist</span>
                  <span className="font-bold text-white">{totalTasks} Completed</span>
                </div>
                <div className="w-full bg-border-color h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-primary rounded-full"
                    style={{ width: `${Math.min((totalTasks / 15) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
}
