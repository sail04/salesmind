'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Sparkles, 
  User, 
  Phone, 
  Mail, 
  Building,
  Target,
  BrainCircuit,
  Loader2,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Label, Select, Textarea } from '@/components/ui/Input';
import { getLeads, saveLead, deleteLead, getActivities, logActivity } from '@/lib/db';
import { analyzeLeadScore } from '@/lib/gemini';
import { Lead, Activity, mockUsers } from '@/lib/mockData';
import { getCurrentUser } from '@/lib/auth';

export default function LeadsPage() {
  const router = useRouter();
  const currentUser = useMemo(() => getCurrentUser(), []);
  const [leads, setLeads] = useState<Lead[]>([]);

  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadActivities, setLeadActivities] = useState<Activity[]>([]);
  
  // Search and Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [scoringLeadId, setScoringLeadId] = useState<string | null>(null);

  // Form Fields
  const [formLeadId, setFormLeadId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formIndustry, setFormIndustry] = useState('Software');
  const [formSource, setFormSource] = useState('Website');
  const [formStatus, setFormStatus] = useState<Lead['status']>('new');
  const [formAssignedTo, setFormAssignedTo] = useState('u3');
  const [formNotes, setFormNotes] = useState('');

  const loadLeads = async () => {
    const data = await getLeads();
    setLeads(data);
    
    // Auto-update selected lead reference
    if (selectedLead) {
      const updated = data.find(l => l.leadId === selectedLead.leadId);
      if (updated) setSelectedLead(updated);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  // Sync selected lead activities
  useEffect(() => {
    const fetchActivities = async () => {
      if (selectedLead) {
        const acts = await getActivities(selectedLead.leadId);
        setLeadActivities(acts);
      }
    };
    fetchActivities();
  }, [selectedLead]);

  // Handle Filtering
  useEffect(() => {
    let result = leads;
    
    // Role filter: Employee only views assigned leads
    if (currentUser && currentUser.role === 'employee') {
      result = result.filter(l => l.assignedTo === currentUser.uid);
    }

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(l => 
        l.name.toLowerCase().includes(s) || 
        l.company.toLowerCase().includes(s) || 
        l.email.toLowerCase().includes(s)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(l => l.status === statusFilter);
    }

    if (industryFilter !== 'all') {
      result = result.filter(l => l.industry === industryFilter);
    }

    setFilteredLeads(result);
  }, [leads, search, statusFilter, industryFilter, currentUser]);

  const openCreateModal = () => {
    setFormMode('create');
    setFormLeadId('');
    setFormName('');
    setFormCompany('');
    setFormEmail('');
    setFormPhone('');
    setFormIndustry('Software');
    setFormSource('Website');
    setFormStatus('new');
    setFormAssignedTo('u3');
    setFormNotes('');
    setIsFormOpen(true);
  };

  const openEditModal = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormMode('edit');
    setFormLeadId(lead.leadId);
    setFormName(lead.name);
    setFormCompany(lead.company);
    setFormEmail(lead.email);
    setFormPhone(lead.phone);
    setFormIndustry(lead.industry);
    setFormSource(lead.source);
    setFormStatus(lead.status);
    setFormAssignedTo(lead.assignedTo);
    setFormNotes(lead.notes);
    setIsFormOpen(true);
  };

  const handleDelete = async (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this lead?")) {
      await deleteLead(leadId);
      if (selectedLead?.leadId === leadId) setSelectedLead(null);
      loadLeads();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const leadData: Partial<Lead> = {
      name: formName,
      company: formCompany,
      email: formEmail,
      phone: formPhone,
      industry: formIndustry,
      source: formSource,
      status: formStatus,
      assignedTo: formAssignedTo,
      notes: formNotes
    };

    if (formMode === 'edit') {
      leadData.leadId = formLeadId;
      const originalLead = leads.find(l => l.leadId === formLeadId);
      if (originalLead && originalLead.status !== formStatus) {
        // Log status change activity
        await logActivity(formLeadId, 'note', `Status moved from ${originalLead.status} to ${formStatus}`);
      }
    }

    await saveLead(leadData);
    setIsFormOpen(false);
    loadLeads();
  };

  const triggerLeadScoring = async (lead: Lead) => {
    setScoringLeadId(lead.leadId);
    try {
      const acts = await getActivities(lead.leadId);
      const res = await analyzeLeadScore(lead, acts);
      
      // Save updated score to lead
      await saveLead({
        ...lead,
        score: res.score,
        notes: lead.notes + `\n\n[AI Insights] Score: ${res.score}/100. Conversion Probability: ${res.conversionProbability}%. Reason: ${res.reasoning}`
      });
      
      await logActivity(lead.leadId, 'note', `AI Lead Scoring computed a score of ${res.score}/100.`);
      await loadLeads();
    } catch (err) {
      console.error(err);
    } finally {
      setScoringLeadId(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 50) return 'warning';
    return 'error';
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'won': return 'success';
      case 'lost': return 'error';
      case 'negotiation': return 'warning';
      case 'qualified': return 'primary';
      case 'interested': return 'secondary';
      case 'contacted': return 'info';
      case 'new':
      default: return 'gray';
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)]">
        {/* Left Side: Leads List & Table */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* Top Bar controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex flex-1 items-center gap-3 w-full">
              <div className="relative flex-1">
                <Input
                  placeholder="Search leads name, company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-bg-card border-border-color"
                />
                <Search size={14} className="absolute left-3 top-3 text-text-muted" />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={13} className="text-text-muted hidden md:block" />
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'new', label: 'New Lead' },
                    { value: 'contacted', label: 'Contacted' },
                    { value: 'interested', label: 'Interested' },
                    { value: 'qualified', label: 'Qualified' },
                    { value: 'negotiation', label: 'Negotiation' },
                    { value: 'won', label: 'Won' },
                    { value: 'lost', label: 'Lost' }
                  ]}
                  className="w-32 py-1.5 text-xs bg-bg-card"
                />
              </div>
            </div>
            
            {currentUser && currentUser.role !== 'employee' && (
              <Button variant="primary" size="md" onClick={openCreateModal} leftIcon={<Plus size={16} />}>
                Add Lead
              </Button>
            )}
          </div>

          {/* Leads Grid/Table */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLeads.length === 0 ? (
                <div className="col-span-full py-16 text-center text-xs text-text-muted glass-panel border border-border-color rounded-lg">
                  No leads found. Match your search query or add a new lead.
                </div>
              ) : (
                filteredLeads.map((lead) => (
                  <Card
                    key={lead.leadId}
                    hoverable
                    onClick={() => setSelectedLead(lead)}
                    className={`cursor-pointer transition-all border ${
                      selectedLead?.leadId === lead.leadId ? 'border-brand-primary/60 bg-brand-primary/5' : 'border-border-color'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-text-primary">{lead.name}</h3>
                          <Badge variant={getStatusColor(lead.status)}>{lead.status}</Badge>
                        </div>
                        <p className="text-xxs text-text-muted flex items-center gap-1">
                          <Building size={10} /> {lead.company || 'Private'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Lead Score Badge */}
                        <div className="text-right">
                          <span className="text-[9px] text-text-muted uppercase font-bold tracking-wider block">AI Score</span>
                          <Badge variant={getScoreColor(lead.score)} glow className="mt-0.5">
                            {lead.score}/100
                          </Badge>
                        </div>
                        
                        {currentUser?.role !== 'employee' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => openEditModal(lead, e)}
                              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-input-bg transition-all cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={(e) => handleDelete(lead.leadId, e)}
                              className="p-1 rounded text-text-muted hover:text-brand-error hover:bg-brand-error/10 transition-all cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border-color/30 text-[10px] text-text-secondary">
                      <div>
                        <span className="text-text-muted">Source:</span> {lead.source}
                      </div>
                      <div>
                        <span className="text-text-muted">Assigned:</span>{' '}
                        {mockUsers.find(u => u.uid === lead.assignedTo)?.name || 'Unassigned'}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Lead Detail Drawer Panel */}
        {selectedLead && (
          <div className="w-full lg:w-96 glass-panel border border-border-color rounded-xl flex flex-col justify-between overflow-hidden">
            {/* Header info */}
            <div className="p-4 border-b border-border-color bg-bg-card/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary">{selectedLead.name}</h3>
                <span className="text-[10px] text-text-muted block mt-0.5">{selectedLead.company}</span>
              </div>
              <Badge variant={getScoreColor(selectedLead.score)} glow>Score {selectedLead.score}/100</Badge>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Actions panel */}
              <div className="bg-brand-primary/5 p-3 rounded-lg border border-brand-primary/10">
                <h4 className="text-[10px] font-bold text-brand-primary uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <BrainCircuit size={12} /> Gemini Intelligence
                </h4>
                <p className="text-xxs text-text-secondary leading-relaxed mb-3">
                  Analyze activity velocity, email exchanges, and previous target history to calculate quality parameters.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full text-xxs py-1.5"
                  onClick={() => triggerLeadScoring(selectedLead)}
                  isLoading={scoringLeadId === selectedLead.leadId}
                  leftIcon={<Sparkles size={11} />}
                >
                  Trigger AI Lead Scoring
                </Button>
              </div>

              {/* Contact Information */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Contact Info</h4>
                <div className="space-y-2 text-xxs text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-text-muted" />
                    <span>{selectedLead.email || 'No Email'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-text-muted" />
                    <span>{selectedLead.phone || 'No Phone'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building size={12} className="text-text-muted" />
                    <span>Industry: {selectedLead.industry}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Lead Notes</h4>
                <div className="bg-input-bg/30 p-3 rounded border border-border-color text-xxs text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {selectedLead.notes || 'No notes logged yet.'}
                </div>
              </div>

              {/* Activities timeline */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Touchpoint Timeline</h4>
                <div className="space-y-3 pl-2 border-l border-border-color/50">
                  {leadActivities.length === 0 ? (
                    <p className="text-xxs text-text-muted">No interactions logged.</p>
                  ) : (
                    leadActivities.map((act) => (
                      <div key={act.activityId} className="relative pl-4 text-xxs leading-snug">
                        <div className="absolute left-[-13px] top-1 w-2.5 h-2.5 rounded-full bg-input-bg border border-border-color flex items-center justify-center text-[6px] font-bold text-text-muted">
                          {act.type[0].toUpperCase()}
                        </div>
                        <p className="text-text-secondary font-medium">{act.description}</p>
                        <span className="text-[9px] text-text-muted">
                          {new Date(act.date).toLocaleDateString()} at {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-3 border-t border-border-color bg-bg-card/30 flex justify-between gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xxs py-1.5"
                onClick={() => router.push(`/activities?leadId=${selectedLead.leadId}`)}
              >
                Log Interaction
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xxs py-1.5"
                onClick={() => router.push('/pipeline')}
              >
                View in Pipeline
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT LEAD DIALOG FORM */}
      <Dialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={formMode === 'create' ? 'Add New Lead' : 'Edit Lead Details'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="leadName">Contact Name</Label>
              <Input
                id="leadName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Sarah Connor"
                required
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                placeholder="Cyberdyne Systems"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="sarah@cyberdyne.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+1 555-0199"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select
                id="industry"
                value={formIndustry}
                onChange={(e) => setFormIndustry(e.target.value)}
                options={[
                  { value: 'Software', label: 'Software' },
                  { value: 'Logistics', label: 'Logistics' },
                  { value: 'Finance', label: 'Finance' },
                  { value: 'Retail', label: 'Retail' },
                  { value: 'Manufacturing', label: 'Manufacturing' },
                  { value: 'Conglomerate', label: 'Conglomerate' }
                ]}
              />
            </div>
            <div>
              <Label htmlFor="source">Source</Label>
              <Select
                id="source"
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
                options={[
                  { value: 'Website', label: 'Website' },
                  { value: 'Referral', label: 'Referral' },
                  { value: 'LinkedIn', label: 'LinkedIn' },
                  { value: 'Cold Outreach', label: 'Cold Outreach' },
                  { value: 'Partner', label: 'Partner' }
                ]}
              />
            </div>
            <div>
              <Label htmlFor="status">Pipeline Status</Label>
              <Select
                id="status"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                options={[
                  { value: 'new', label: 'New Lead' },
                  { value: 'contacted', label: 'Contacted' },
                  { value: 'interested', label: 'Interested' },
                  { value: 'qualified', label: 'Qualified' },
                  { value: 'negotiation', label: 'Negotiation' },
                  { value: 'won', label: 'Won' },
                  { value: 'lost', label: 'Lost' }
                ]}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="assignedTo">Assigned Employee</Label>
            <Select
              id="assignedTo"
              value={formAssignedTo}
              onChange={(e) => setFormAssignedTo(e.target.value)}
              options={mockUsers.map(u => ({ value: u.uid, label: `${u.name} (${u.role})` }))}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes & Overview</Label>
            <Textarea
              id="notes"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Provide background context on client requirements..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border-color">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Lead Details
            </Button>
          </div>
        </form>
      </Dialog>
    </AppLayout>
  );
}
