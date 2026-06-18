'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Plus, 
  Search, 
  Clock, 
  History,
  FileText,
  Building
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Label, Select, Textarea } from '@/components/ui/Input';
import { getActivities, logActivity, getLeads } from '@/lib/db';
import { Activity, Lead } from '@/lib/mockData';

import { Suspense } from 'react';

function ActivitiesContent() {
  const searchParams = useSearchParams();
  const leadIdQuery = searchParams.get('leadId') || '';

  const [activities, setActivities] = useState<Activity[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Interaction form
  const [selectedLeadId, setSelectedLeadId] = useState(leadIdQuery);
  const [activityType, setActivityType] = useState<Activity['type']>('call');
  const [activityDesc, setActivityDesc] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const loadData = async () => {
    const dbLeads = await getLeads();
    setLeads(dbLeads);
    const dbActivities = await getActivities();
    setActivities(dbActivities);
  };

  useEffect(() => {
    loadData();
    if (leadIdQuery) {
      setSelectedLeadId(leadIdQuery);
    }
  }, [leadIdQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !activityDesc) return;
    
    setIsLogging(true);
    try {
      await logActivity(selectedLeadId, activityType, activityDesc);
      setActivityDesc('');
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLogging(false);
    }
  };

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'call': return <Phone size={14} className="text-brand-success" />;
      case 'email': return <Mail size={14} className="text-brand-primary" />;
      case 'meeting': return <Calendar size={14} className="text-brand-secondary" />;
      case 'task': return <Clock size={14} className="text-brand-warning" />;
      case 'note':
      default: return <FileText size={14} className="text-text-muted" />;
    }
  };

  // Filter activities
  const getFilteredActivities = () => {
    let result = activities;

    if (typeFilter !== 'all') {
      result = result.filter(a => a.type === typeFilter);
    }

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(a => a.description.toLowerCase().includes(s));
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filtered = getFilteredActivities();

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
        {/* Left Columns: Activity Timeline feed */}
        <div className="lg:col-span-2 flex flex-col justify-between overflow-hidden">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
            <div className="relative flex-1 w-full">
              <Input
                placeholder="Search descriptions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-bg-card border-border-color"
              />
              <Search size={14} className="absolute left-3 top-3 text-text-muted" />
            </div>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Activities' },
                { value: 'call', label: 'Phone Calls' },
                { value: 'email', label: 'Emails' },
                { value: 'meeting', label: 'Meetings' },
                { value: 'task', label: 'Completed Tasks' },
                { value: 'note', label: 'Logs & Notes' }
              ]}
              className="w-40 py-1.5 text-xs bg-bg-card"
            />
          </div>

          {/* Timeline list */}
          <div className="flex-1 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-xs text-text-muted glass-panel border border-border-color rounded-lg">
                No activity logs match your search.
              </div>
            ) : (
              <div className="relative pl-6 border-l border-border-color/60 ml-3 space-y-6">
                {filtered.map((act) => {
                  const lead = leads.find(l => l.leadId === act.leadId);
                  
                  return (
                    <div key={act.activityId} className="relative text-xs group">
                      {/* Timeline dot */}
                      <div className="absolute left-[-32px] top-0.5 w-6.5 h-6.5 rounded-full bg-input-bg border border-border-color/80 flex items-center justify-center shadow-sm group-hover:border-brand-primary transition-colors">
                        {getIcon(act.type)}
                      </div>
                      
                      <div className="glass-panel p-3.5 border border-border-color/60 rounded-md">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-bold text-text-primary capitalize flex items-center gap-1.5">
                            {act.type} Log
                            {lead && (
                              <Badge variant="primary" className="py-0.5 px-2">
                                Lead: {lead.name}
                              </Badge>
                            )}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {new Date(act.date).toLocaleDateString()} at {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-text-secondary leading-relaxed text-xxs">{act.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interaction logger form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <History size={16} className="text-brand-primary" />
                <div>
                  <CardTitle>Log Customer Interaction</CardTitle>
                  <CardDescription>Directly document touchpoints into target CRM accounts.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="mt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="leadSelect">Target Lead / Company</Label>
                  <Select
                    id="leadSelect"
                    value={selectedLeadId}
                    onChange={(e) => setSelectedLeadId(e.target.value)}
                    options={[
                      { value: '', label: 'Select a Lead Account' },
                      ...leads.map(l => ({ value: l.leadId, label: `${l.name} (${l.company})` }))
                    ]}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="actType">Interaction Type</Label>
                    <Select
                      id="actType"
                      value={activityType}
                      onChange={(e: any) => setActivityType(e.target.value)}
                      options={[
                        { value: 'call', label: 'Phone Call' },
                        { value: 'email', label: 'Email' },
                        { value: 'meeting', label: 'Meeting' },
                        { value: 'note', label: 'Internal Note' }
                      ]}
                    />
                  </div>
                  <div className="flex items-end justify-end pb-0.5">
                    <Badge variant="info">Log Date: Today</Badge>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Touchpoint Summary</Label>
                  <Textarea
                    id="description"
                    value={activityDesc}
                    onChange={(e) => setActivityDesc(e.target.value)}
                    placeholder="Provide details: what was discussed, answers, follow-up timelines..."
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full py-2" 
                  isLoading={isLogging}
                  disabled={!selectedLeadId}
                >
                  Record Interaction
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

export default function ActivitiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-primary"></div>
        <p className="text-xs text-text-muted font-bold tracking-widest animate-pulse">LOADING STREAM...</p>
      </div>
    }>
      <ActivitiesContent />
    </Suspense>
  );
}

