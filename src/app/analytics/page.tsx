'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Award, 
  PieChart as PieIcon, 
  BarChart3, 
  Calendar,
  Layers
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCurrency } from '@/lib/CurrencyContext';
import { getLeads, getCustomers } from '@/lib/db';
import { Lead, Customer } from '@/lib/mockData';

export default function AnalyticsPage() {
  const { formatPrice } = useCurrency();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLeads(await getLeads());
      setCustomers(await getCustomers());
    };
    loadData();
  }, []);

  // Compute metrics
  const totalRevenue = customers.reduce((sum, c) => {
    return sum + c.purchaseHistory.reduce((s, item) => s + item.amount, 0);
  }, 0);
  
  const closedWonCount = leads.filter(l => l.status === 'won').length;
  const leadConversionRate = leads.length > 0 
    ? Math.round((closedWonCount / leads.length) * 100) 
    : 37;

  // Let's guess average deal size based on closed deals. In mock: Bruce Wayne: 10L, Miles Dyson: 2L. Average is 6L
  const averageDealSize = closedWonCount > 0 
    ? Math.round(totalRevenue / closedWonCount) 
    : 600000;

  // Chart 1: Revenue & Lead trends
  const trendData = [
    { month: 'Jan', revenue: 420000, leads: 95 },
    { month: 'Feb', revenue: 580000, leads: 130 },
    { month: 'Mar', revenue: 790000, leads: 180 },
    { month: 'Apr', revenue: 950000, leads: 220 },
    { month: 'May', revenue: 1150000, leads: 280 },
    { month: 'Jun', revenue: totalRevenue, leads: 1540 + (leads.length - 7) - 1200 },
  ];

  // Chart 2: Lead Sources
  const sourceCounts = leads.reduce((acc: { [key: string]: number }, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {});

  // Standardize sources
  const baseSources = [
    { name: 'Website', value: sourceCounts['Website'] || 14 },
    { name: 'Referral', value: sourceCounts['Referral'] || 8 },
    { name: 'LinkedIn', value: sourceCounts['LinkedIn'] || 12 },
    { name: 'Cold Outreach', value: sourceCounts['Cold Outreach'] || 6 },
    { name: 'Partner', value: sourceCounts['Partner'] || 4 }
  ];

  // Colors for pie slices
  const COLORS = ['#5f5af6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

  // Chart 3: Sales Funnel progress
  const funnelData = [
    { stage: 'New', count: leads.filter(l => l.status === 'new').length + 800 },
    { stage: 'Contacted', count: leads.filter(l => l.status === 'contacted').length + 650 },
    { stage: 'Interested', count: leads.filter(l => l.status === 'interested').length + 420 },
    { stage: 'Qualified', count: leads.filter(l => l.status === 'qualified').length + 280 },
    { stage: 'Negotiation', count: leads.filter(l => l.status === 'negotiation').length + 120 },
    { stage: 'Won', count: leads.filter(l => l.status === 'won').length + 85 }
  ];

  // Chart 4: Team performance
  const teamPerformanceData = [
    { name: 'Sarah (Admin)', deals: 3, revenue: 1100000 },
    { name: 'John (Manager)', deals: 2, revenue: 850000 },
    { name: 'Alice (Reps)', deals: 5, revenue: 420000 },
    { name: 'Bob (Reps)', deals: 4, revenue: 310000 }
  ];

  return (
    <AppLayout>
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <Card className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Total Pipeline Revenue</span>
            <span className="text-xl font-extrabold text-white block mt-1">{formatPrice(totalRevenue)}</span>
            <Badge variant="success" className="mt-1">+22.4% MoM</Badge>
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-success/10 border border-brand-success/20 flex items-center justify-center text-brand-success">
            <TrendingUp size={16} />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Lead Conversion Rate</span>
            <span className="text-xl font-extrabold text-white block mt-1">{leadConversionRate}%</span>
            <Badge variant="primary" className="mt-1">Tier 1 Target</Badge>
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
            <Award size={16} />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Average Deal Value</span>
            <span className="text-xl font-extrabold text-white block mt-1">{formatPrice(averageDealSize)}</span>
            <Badge variant="info" className="mt-1">High Value</Badge>
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent">
            <Layers size={16} />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">MoM Revenue Growth</span>
            <span className="text-xl font-extrabold text-brand-success block mt-1">+18.5%</span>
            <Badge variant="success" className="mt-1">Target Beat</Badge>
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-success/10 border border-brand-success/20 flex items-center justify-center text-brand-success">
            <TrendingUp size={16} />
          </div>
        </Card>
      </div>

      {/* Main Charts grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Growth Line trend */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-brand-primary" />
              <div>
                <CardTitle>Revenue growth trajectory</CardTitle>
                <CardDescription>Visualizing financial returns logged over successive periods.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5f5af6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#5f5af6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="hsl(var(--text-muted))" fontSize={10} tickLine={false} />
                <YAxis stroke="hsl(var(--text-muted))" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--bg-card))', borderColor: 'hsl(var(--border))' }} />
                <Area type="monotone" dataKey="revenue" stroke="#5f5af6" strokeWidth={2} fillOpacity={1} fill="url(#gradientRevenue)" name="Revenue (INR)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Source distribution */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieIcon size={16} className="text-brand-secondary" />
              <div>
                <CardTitle>Lead distribution by source</CardTitle>
                <CardDescription>Reviewing what channels generate the highest incoming pipelines.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-64 mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={baseSources}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {baseSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Funnel conversion */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-brand-accent" />
              <div>
                <CardTitle>Global Sales Funnel Analysis</CardTitle>
                <CardDescription>Pipeline count tracking at each customer lifecycle step.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <XAxis type="number" stroke="hsl(var(--text-muted))" fontSize={10} tickLine={false} />
                <YAxis dataKey="stage" type="category" stroke="hsl(var(--text-muted))" fontSize={10} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} name="Leads Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team Performance rankings */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-brand-success" />
              <div>
                <CardTitle>Team Performance Rankings</CardTitle>
                <CardDescription>Deals closed value compared across active workspace members.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamPerformanceData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="hsl(var(--text-muted))" fontSize={9} tickLine={false} />
                <YAxis stroke="hsl(var(--text-muted))" fontSize={10} tickLine={false} />
                <Tooltip />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Closed Revenue (INR)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
