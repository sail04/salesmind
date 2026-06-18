'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Sparkles, 
  Phone, 
  UserPlus, 
  CheckCircle, 
  ArrowRight,
  ShieldAlert,
  Building,
  UserCheck
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getLeads, saveLead, saveTask, logActivity, addNotification } from '@/lib/db';
import { Lead } from '@/lib/mockData';

interface Message {
  id: string;
  sender: 'client' | 'system' | 'agent';
  text: string;
  timestamp: string;
}

interface ChatContact {
  id: string;
  name: string;
  company: string;
  lastMessage: string;
  timestamp: string;
  captured: boolean;
  phone: string;
  email: string;
  presets: string[];
}

export default function WhatsAppCRMPage() {
  const [contacts, setContacts] = useState<ChatContact[]>([
    {
      id: 'wc1',
      name: 'Rajesh Kumar',
      company: 'Bharat AgriTech',
      phone: '+91 91234 56789',
      email: 'rajesh@bharatagri.in',
      lastMessage: 'Looking to integrate route planning APIs. Need pricing.',
      timestamp: '10:00 AM',
      captured: false,
      presets: [
        'Hi, I am Rajesh from Bharat AgriTech, looking to integrate your route planning APIs. Call me at +91 91234 56789.',
        'Can we schedule a call regarding custom volume licenses?',
        'Sent you the specs, let me know the pricing structure.'
      ]
    },
    {
      id: 'wc2',
      name: 'Sherlock Holmes',
      company: 'Baker St Investigations',
      phone: '+44 7911 123456',
      email: 'sherlock@bakerstreet.com',
      lastMessage: 'Need high scale security logs integration for our casework database.',
      timestamp: 'Yesterday',
      captured: false,
      presets: [
        'Hi SalesMind! Sherlock here from Baker St. Need security logs integration for case file databases.',
        'Data must be encrypted. Do you support private cloud?'
      ]
    }
  ]);

  const [activeContactId, setActiveContactId] = useState('wc1');
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({
    wc1: [
      { id: 'm1', sender: 'client', text: 'Hi, I am Rajesh from Bharat AgriTech. We are looking to integrate your route planning APIs.', timestamp: '09:58 AM' },
      { id: 'm2', sender: 'agent', text: 'Hello Rajesh! I can assist you with that. Are you looking for enterprise or team plans?', timestamp: '09:59 AM' },
      { id: 'm3', sender: 'client', text: 'Looking to integrate route planning APIs. Need pricing for around 10k monthly calls. Phone: +91 91234 56789.', timestamp: '10:00 AM' }
    ],
    wc2: [
      { id: 'm4', sender: 'client', text: 'Hi SalesMind! Sherlock here from Baker St. Need security logs integration for case file databases.', timestamp: 'Yesterday' }
    ]
  });

  const [inputText, setInputText] = useState('');
  const [captureStatus, setCaptureStatus] = useState<{ [key: string]: 'idle' | 'loading' | 'success' }>({
    wc1: 'idle',
    wc2: 'idle'
  });

  const activeContact = contacts.find(c => c.id === activeContactId)!;

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: 'm_' + Math.random().toString(36).substr(2, 9),
      sender: 'agent',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMsg]
    }));

    setInputText('');

    // Update contacts list last message preview
    setContacts(prev => prev.map(c => {
      if (c.id === activeContactId) {
        return { ...c, lastMessage: inputText, timestamp: 'Just now' };
      }
      return c;
    }));
  };

  const handlePresetMessageClick = (presetText: string) => {
    const newMsg: Message = {
      id: 'm_' + Math.random().toString(36).substr(2, 9),
      sender: 'client',
      text: presetText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMsg]
    }));

    setContacts(prev => prev.map(c => {
      if (c.id === activeContactId) {
        return { ...c, lastMessage: presetText, timestamp: 'Just now' };
      }
      return c;
    }));
  };

  const captureLeadFromWhatsApp = async (contact: ChatContact) => {
    setCaptureStatus(prev => ({ ...prev, [contact.id]: 'loading' }));

    // Mock API capture trigger
    await new Promise(r => setTimeout(r, 1200));

    try {
      // 1. Create lead in local storage database
      const createdLead = await saveLead({
        name: contact.name,
        company: contact.company,
        phone: contact.phone,
        email: contact.email,
        source: 'WhatsApp',
        status: 'new',
        score: Math.floor(Math.random() * 30) + 60, // base score for WhatsApp inbound
        notes: `Captured automatically from WhatsApp message history. Last query: "${contact.lastMessage}"`
      });

      // 2. Schedule follow-up task automatically in tasks list
      await saveTask({
        title: `WhatsApp Follow-up: ${contact.name}`,
        description: `Follow up regarding incoming inquiry: "${contact.lastMessage}"`,
        dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        status: 'pending',
        leadId: createdLead.leadId
      });

      // 3. Log historical timeline action
      await logActivity(createdLead.leadId, 'call', `System automatically routed WhatsApp contact to lead card and generated a follow-up task.`);

      // 4. Fire notifications banner
      addNotification(
        'WhatsApp Lead Captured',
        `Simulated WhatsApp message from ${contact.name} (${contact.company}) created a new lead.`,
        'success'
      );

      // Update contacts capture state
      setContacts(prev => prev.map(c => {
        if (c.id === contact.id) return { ...c, captured: true };
        return c;
      }));

      setCaptureStatus(prev => ({ ...prev, [contact.id]: 'success' }));
    } catch (e) {
      console.error(e);
      setCaptureStatus(prev => ({ ...prev, [contact.id]: 'idle' }));
    }
  };

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
        {/* Left Column: WhatsApp Contact Chat Lists */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4 flex flex-col justify-between overflow-hidden">
          <Card className="flex-1 flex flex-col justify-between overflow-hidden">
            <CardHeader className="border-b border-border-color pb-3 mb-0">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-brand-success animate-pulse" />
                <div>
                  <CardTitle>Inbound Messages</CardTitle>
                  <CardDescription>Live WhatsApp routing queue.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="flex-grow overflow-y-auto divide-y divide-border-color/30 mt-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setActiveContactId(contact.id)}
                  className={`p-3 text-xs cursor-pointer transition-colors flex flex-col gap-1 ${
                    contact.id === activeContactId 
                      ? 'bg-brand-primary/10 border-l-2 border-brand-primary' 
                      : 'hover:bg-input-bg/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white block truncate">{contact.name}</span>
                    <span className="text-[9px] text-text-muted">{contact.timestamp}</span>
                  </div>
                  <span className="text-[10px] text-text-muted block font-semibold">{contact.company}</span>
                  <p className="text-[11px] text-text-secondary truncate mt-1">{contact.lastMessage}</p>
                  
                  {contact.captured && (
                    <span className="text-[9px] text-brand-success font-semibold mt-1 flex items-center gap-0.5">
                      ✓ Captured in CRM
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Center/Right: Chat Screen & Automation trigger */}
        <div className="lg:col-span-2 flex flex-col lg:flex-row gap-6 overflow-hidden">
          {/* Chat Window Panel */}
          <div className="flex-1 glass-panel border border-border-color rounded-xl flex flex-col justify-between overflow-hidden">
            {/* Header info */}
            <div className="p-4 border-b border-border-color bg-bg-card/50 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block text-sm">{activeContact.name}</span>
                <span className="text-xxs text-text-muted block mt-0.5">{activeContact.phone}</span>
              </div>
              <Badge variant="info">Active Channel</Badge>
            </div>

            {/* Chat Body messages stream */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-bg-card/15">
              {(messages[activeContactId] || []).map((msg) => {
                const isAgent = msg.sender === 'agent';
                return (
                  <div 
                    key={msg.id} 
                    className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[70%] p-3 rounded-lg text-xxs leading-relaxed ${
                        isAgent 
                          ? 'bg-brand-primary text-white rounded-tr-none' 
                          : 'bg-input-bg border border-border-color text-text-secondary rounded-tl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-[9px] text-text-muted text-right block mt-1.5 leading-none">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inbound Presets Helper Panel */}
            <div className="p-3 border-t border-border-color/30 bg-bg-card/30">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-2">
                Simulate Inbound Clients query:
              </span>
              <div className="flex flex-wrap gap-2">
                {activeContact.presets.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => handlePresetMessageClick(preset)}
                    className="px-2.5 py-1.5 rounded bg-input-bg border border-border-color hover:border-brand-success text-[10px] text-text-secondary hover:text-white transition-colors cursor-pointer text-left font-medium max-w-xs truncate"
                    title={preset}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Message panel */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-border-color bg-bg-card flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a manual WhatsApp message reply..."
                className="flex-grow bg-input-bg text-text-primary text-xs border border-border-color rounded-md px-3.5 py-2.5 outline-none focus:border-brand-primary"
              />
              <Button type="submit" variant="primary" size="md" className="py-2.5 px-3">
                <Send size={14} />
              </Button>
            </form>
          </div>

          {/* Capture CRM Automation Details */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-6 overflow-y-auto">
            <Card glow className="border-brand-success/15 bg-brand-success/[0.01]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-brand-success animate-pulse" />
                  <div>
                    <CardTitle>Lead Capture Center</CardTitle>
                    <CardDescription>WhatsApp routing pipeline engine.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="mt-4 space-y-5 text-xxs text-text-secondary">
                <p className="leading-relaxed">
                  Extract customer contact records and message intent from WhatsApp history using sales intelligence automation tools.
                </p>

                {/* Automation Steps visualizer */}
                <div className="space-y-3.5 bg-input-bg/20 p-3 rounded-lg border border-border-color/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-brand-primary/10 border border-brand-primary/25 flex items-center justify-center font-bold text-[9px]">1</div>
                    <span>Parse message query</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-brand-primary/10 border border-brand-primary/25 flex items-center justify-center font-bold text-[9px]">2</div>
                    <span>Map contact & details</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-brand-primary/10 border border-brand-primary/25 flex items-center justify-center font-bold text-[9px]">3</div>
                    <span>Schedule calendar task</span>
                  </div>
                </div>

                {activeContact.captured ? (
                  <div className="p-3 bg-brand-success/10 border border-brand-success/20 rounded-md text-brand-success font-semibold flex items-center gap-2">
                    <CheckCircle size={15} /> Lead successfully routed to CRM!
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full py-2.5 text-xxs"
                    onClick={() => captureLeadFromWhatsApp(activeContact)}
                    isLoading={captureStatus[activeContact.id] === 'loading'}
                    leftIcon={<UserPlus size={12} />}
                  >
                    Capture & Route Lead
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
