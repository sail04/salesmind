'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Sparkles, 
  Building,
  Target,
  ArrowRight,
  User,
  Info
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Select } from '@/components/ui/Input';
import { getLeads, saveLead, logActivity } from '@/lib/db';
import { Lead, mockUsers } from '@/lib/mockData';
import { getCurrentUser } from '@/lib/auth';

const COLUMNS: { id: Lead['status']; label: string; color: string }[] = [
  { id: 'new', label: 'New Lead', color: 'border-t-2 border-t-text-muted bg-text-muted/5' },
  { id: 'contacted', label: 'Contacted', color: 'border-t-2 border-t-brand-accent bg-brand-accent/5' },
  { id: 'interested', label: 'Interested', color: 'border-t-2 border-t-brand-secondary bg-brand-secondary/5' },
  { id: 'qualified', label: 'Qualified', color: 'border-t-2 border-t-brand-primary bg-brand-primary/5' },
  { id: 'negotiation', label: 'Negotiation', color: 'border-t-2 border-t-brand-warning bg-brand-warning/5' },
  { id: 'won', label: 'Won Deal', color: 'border-t-2 border-t-brand-success bg-brand-success/5' }
];

export default function PipelinePage() {
  const router = useRouter();
  const currentUser = getCurrentUser();
  const [leads, setLeads] = useState<Lead[]>([]);

  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [previewLead, setPreviewLead] = useState<Lead | null>(null);

  const loadLeads = async () => {
    const data = await getLeads();
    setLeads(data);
  };

  useEffect(() => {
    loadLeads();
  }, []);

  // Filter Leads
  const getFilteredLeads = () => {
    let result = leads;
    
    // Role restrictions: Employees see only their assigned deals
    if (currentUser && currentUser.role === 'employee') {
      result = result.filter(l => l.assignedTo === currentUser.uid);
    } else if (userFilter !== 'all') {
      result = result.filter(l => l.assignedTo === userFilter);
    }

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(l => 
        l.name.toLowerCase().includes(s) || 
        l.company.toLowerCase().includes(s)
      );
    }

    return result;
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Lead['status']) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    if (!leadId) return;

    const matchedLead = leads.find(l => l.leadId === leadId);
    if (!matchedLead) return;

    if (matchedLead.status === targetStatus) return;

    // Save updated lead status
    const updatedLead: Lead = {
      ...matchedLead,
      status: targetStatus
    };

    await saveLead(updatedLead);
    await logActivity(leadId, 'note', `Lead pipeline stage updated to: ${targetStatus.toUpperCase()}`);
    loadLeads();
  };

  const filtered = getFilteredLeads();

  return (
    <AppLayout>
      {/* Top Filter Bar Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-white">Sales Pipeline Kanban</h2>
          <p className="text-xs text-text-muted mt-0.5">Drag cards to update deals, or tap cards for quick previews.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Input
              placeholder="Search by lead or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-bg-card border-border-color"
            />
            <Search size={14} className="absolute left-3 top-3 text-text-muted" />
          </div>
          
          {currentUser && currentUser.role !== 'employee' && (
            <Select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Owners' },
                ...mockUsers.map(u => ({ value: u.uid, label: u.name }))
              ]}
              className="w-36 py-1.5 text-xs bg-bg-card"
            />
          )}
        </div>
      </div>

      {/* Kanban Board Layout */}
      <div className="flex items-start gap-4 overflow-x-auto pb-4 h-[calc(100vh-14rem)] min-w-[1000px]">
        {COLUMNS.map((column) => {
          const colLeads = filtered.filter(l => l.status === column.id);
          
          return (
            <div
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`w-80 flex-shrink-0 flex flex-col max-h-full rounded-lg border border-border-color p-3 bg-bg-card/30 ${column.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1.5 pb-1 border-b border-border-color/30">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  {column.label}
                  <Badge variant="gray" className="py-0.5 px-1.5">{colLeads.length}</Badge>
                </span>
              </div>

              {/* Column Cards List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
                {colLeads.length === 0 ? (
                  <div className="py-8 text-center text-[10px] text-text-muted border border-dashed border-border-color/40 rounded-lg select-none">
                    Drag leads here
                  </div>
                ) : (
                  colLeads.map((lead) => (
                    <div
                      key={lead.leadId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.leadId)}
                      onClick={() => setPreviewLead(lead)}
                      className="glass-panel p-3.5 border border-border-color/60 rounded-md hover:border-brand-primary/40 transition-colors shadow-sm cursor-grab active:cursor-grabbing hover:bg-input-bg/15 group relative overflow-hidden"
                    >
                      <h4 className="text-xs font-bold text-text-primary group-hover:text-brand-primary transition-colors flex items-center justify-between">
                        {lead.name}
                        <Info size={11} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <p className="text-[10px] text-text-secondary mt-1 flex items-center gap-1">
                        <Building size={10} className="text-text-muted" /> {lead.company || 'Private'}
                      </p>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border-color/20 text-[9px] text-text-muted">
                        <span className="bg-input-bg px-1.5 py-0.5 rounded text-[8px] font-bold text-text-secondary">
                          Score: {lead.score}
                        </span>
                        <span>
                          Owner: {mockUsers.find(u => u.uid === lead.assignedTo)?.name.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* QUICK PREVIEW DIALOG */}
      <Dialog
        isOpen={previewLead !== null}
        onClose={() => setPreviewLead(null)}
        title="Lead Preview"
        size="md"
      >
        {previewLead && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-bg-card p-3 rounded-lg border border-border-color">
              <div>
                <h3 className="text-sm font-bold text-white">{previewLead.name}</h3>
                <span className="text-xxs text-text-muted block mt-0.5">{previewLead.company}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-text-muted block font-bold uppercase">AI Quality</span>
                <Badge variant={previewLead.score >= 80 ? 'success' : previewLead.score >= 50 ? 'warning' : 'error'} glow className="mt-0.5">
                  {previewLead.score}/100
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xxs text-text-secondary bg-input-bg/10 p-3 rounded-lg border border-border-color/30">
              <div>
                <span className="text-text-muted block mb-0.5">Email</span>
                <span className="font-semibold text-text-primary">{previewLead.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-text-muted block mb-0.5">Phone</span>
                <span className="font-semibold text-text-primary">{previewLead.phone || 'N/A'}</span>
              </div>
              <div className="mt-2">
                <span className="text-text-muted block mb-0.5">Industry</span>
                <span className="font-semibold text-text-primary">{previewLead.industry}</span>
              </div>
              <div className="mt-2">
                <span className="text-text-muted block mb-0.5">Source</span>
                <span className="font-semibold text-text-primary">{previewLead.source}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Status & Notes</span>
              <p className="text-xxs text-text-secondary leading-relaxed bg-input-bg/30 p-3 rounded border border-border-color whitespace-pre-wrap">
                {previewLead.notes || 'No description notes logged.'}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border-color">
              <Button variant="outline" size="sm" onClick={() => setPreviewLead(null)}>
                Close Preview
              </Button>
              <Button variant="primary" size="sm" onClick={() => { setPreviewLead(null); router.push('/leads'); }}>
                Edit Full Profile
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </AppLayout>
  );
}
