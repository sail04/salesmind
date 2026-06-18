'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Brain, 
  Database, 
  Bell, 
  Check, 
  Key, 
  Globe, 
  Lock,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Label, Select } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { useCurrency } from '@/lib/CurrencyContext';

export default function SettingsPage() {
  const { currency, setCurrency } = useCurrency();
  
  // Profile settings
  const [profileName, setProfileName] = useState('Sarah Connor');
  const [profileEmail, setProfileEmail] = useState('admin@nexvora.com');
  const [profileSaved, setProfileSaved] = useState(false);

  // AI & Gemini credentials
  const [geminiKey, setGeminiKey] = useState('');
  const [aiSaved, setAiSaved] = useState(false);

  // Firebase configurations
  const [firebaseApiKey, setFirebaseApiKey] = useState('');
  const [firebaseProjectId, setFirebaseProjectId] = useState('');
  const [firebaseAppId, setFirebaseAppId] = useState('');
  const [dbSaved, setDbSaved] = useState(false);

  // Toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(false);

  useEffect(() => {
    // Load current local keys
    if (typeof window !== 'undefined') {
      setGeminiKey(localStorage.getItem('salesmind_gemini_key') || '');
      setFirebaseApiKey(localStorage.getItem('salesmind_fb_api_key') || '');
      setFirebaseProjectId(localStorage.getItem('salesmind_fb_project_id') || '');
      setFirebaseAppId(localStorage.getItem('salesmind_fb_app_id') || '');
    }
  }, []);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleAISave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      if (geminiKey.trim()) {
        localStorage.setItem('salesmind_gemini_key', geminiKey.trim());
      } else {
        localStorage.removeItem('salesmind_gemini_key');
      }
    }
    setAiSaved(true);
    setTimeout(() => setAiSaved(false), 2000);
  };

  const handleDbSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('salesmind_fb_api_key', firebaseApiKey);
      localStorage.setItem('salesmind_fb_project_id', firebaseProjectId);
      localStorage.setItem('salesmind_fb_app_id', firebaseAppId);
    }
    setDbSaved(true);
    setTimeout(() => setDbSaved(false), 2000);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-10rem)] overflow-y-auto pr-1">
        {/* Left Side: Category indicators */}
        <div className="space-y-4 md:col-span-1">
          <Card className="p-3">
            <nav className="space-y-1 text-xs">
              <span className="flex items-center gap-2.5 px-3 py-2.5 rounded-md bg-brand-primary/10 text-brand-primary font-bold">
                <Settings size={15} /> Workspace Settings
              </span>
            </nav>
          </Card>

          <Card className="text-xxs text-text-secondary leading-relaxed p-4">
            <h4 className="font-bold text-white mb-2 flex items-center gap-1">
              <ShieldCheck size={12} className="text-brand-success" /> Security Advisory
            </h4>
            <p>
              Credentials and API Keys entered here are saved directly inside your local browser storage (`localStorage`) and never transmitted to external third parties.
            </p>
          </Card>
        </div>

        {/* Right Side: Tab Cards panels */}
        <div className="md:col-span-2 space-y-6">
          {/* Panel 1: Profile details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User size={16} className="text-brand-primary" />
                <div>
                  <CardTitle>Admin Profile Overview</CardTitle>
                  <CardDescription>Update your personal details and workspace avatar.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="mt-4">
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="profName">Display Name</Label>
                    <Input
                      id="profName"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="profEmail">Email Address</Label>
                    <Input
                      id="profEmail"
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2">
                    <Globe size={13} className="text-text-muted" />
                    <Switch
                      checked={currency === 'USD'}
                      onChange={(checked) => setCurrency(checked ? 'USD' : 'INR')}
                      label="Active Currency Toggle"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="sm">
                    {profileSaved ? <Check size={14} /> : 'Save Profile'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Panel 2: AI Credentials */}
          <Card glow className="border-brand-primary/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-brand-primary" />
                <div>
                  <CardTitle>Gemini Intelligence Engine Preferences</CardTitle>
                  <CardDescription>Input Google Gemini API key to activate live analysis.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="mt-4">
              <form onSubmit={handleAISave} className="space-y-4">
                <div>
                  <Label htmlFor="geminiKey" className="flex items-center justify-between">
                    <span>Google Gemini API Key</span>
                    <Badge variant={geminiKey ? 'success' : 'gray'}>
                      {geminiKey ? 'Key Entered' : 'Sandbox Fallback Mode Active'}
                    </Badge>
                  </Label>
                  <div className="relative">
                    <Input
                      id="geminiKey"
                      type="password"
                      placeholder="AIzaSy..."
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      className="pl-9"
                    />
                    <Key size={14} className="absolute left-3.5 top-3 text-text-muted" />
                  </div>
                  <p className="text-[10px] text-text-muted mt-1.5 leading-relaxed">
                    Leave empty to default to Sandbox Simulation. Obtain an API Key from Google AI Studio.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary" size="sm" leftIcon={<Sparkles size={12} />}>
                    {aiSaved ? <Check size={14} /> : 'Save AI Credentials'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Panel 3: Firebase Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database size={16} className="text-brand-success" />
                <div>
                  <CardTitle>Firebase Firestore Integration</CardTitle>
                  <CardDescription>Connect with external cloud backends.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="mt-4">
              <form onSubmit={handleDbSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fbApiKey">Firebase Web API Key</Label>
                    <Input
                      id="fbApiKey"
                      type="password"
                      placeholder="AIzaSy..."
                      value={firebaseApiKey}
                      onChange={(e) => setFirebaseApiKey(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fbProjectId">Project ID</Label>
                    <Input
                      id="fbProjectId"
                      placeholder="salesmind-crm-xxxx"
                      value={firebaseProjectId}
                      onChange={(e) => setFirebaseProjectId(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fbAppId">Firebase App ID</Label>
                  <Input
                    id="fbAppId"
                    placeholder="1:xxxxx:web:xxxxx"
                    value={firebaseAppId}
                    onChange={(e) => setFirebaseAppId(e.target.value)}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary" size="sm">
                    {dbSaved ? <Check size={14} /> : 'Link Database Config'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
