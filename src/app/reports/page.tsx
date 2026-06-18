'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Table as TableIcon,
  Calendar,
  Layers,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import { getLeads, getCustomers, getTasks } from '@/lib/db';
import { Lead, Customer, Task } from '@/lib/mockData';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'revenue' | 'lead' | 'customer' | 'team'>('lead');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLeads(await getLeads());
      setCustomers(await getCustomers());
      setTasks(await getTasks());
    };
    loadData();
  }, []);

  // Generate CSV data from datasets
  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map(header => {
        const escaped = ('' + row[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    let filename = `salesmind_${reportType}_report.csv`;
    let csvData = '';

    if (reportType === 'lead') {
      const formattedLeads = leads.map(l => ({
        ID: l.leadId,
        Name: l.name,
        Company: l.company,
        Email: l.email,
        Phone: l.phone,
        Industry: l.industry,
        Source: l.source,
        Score: l.score,
        Status: l.status,
        Created: l.createdAt
      }));
      csvData = convertToCSV(formattedLeads);
    } else if (reportType === 'customer') {
      const formattedCust = customers.map(c => ({
        ID: c.customerId,
        Name: c.name,
        Company: c.company,
        Email: c.email,
        Phone: c.phone,
        HealthScore: c.healthScore,
        PurchasesCount: c.purchaseHistory.length,
        TotalRevenueValue: c.purchaseHistory.reduce((s, p) => s + p.amount, 0),
        Created: c.createdAt
      }));
      csvData = convertToCSV(formattedCust);
    } else if (reportType === 'revenue') {
      const purchases = customers.flatMap(c => 
        c.purchaseHistory.map(p => ({
          Customer: c.name,
          Company: c.company,
          ItemName: p.item,
          AmountINR: p.amount,
          TransactionDate: p.date
        }))
      );
      csvData = convertToCSV(purchases);
    } else if (reportType === 'team') {
      const formattedTeam = [
        { Name: 'Sarah Connor', Role: 'Admin', LeadsAssigned: leads.filter(l => l.assignedTo === 'u1').length, TasksCompleted: tasks.filter(t => t.assignedTo === 'u1' && t.status === 'completed').length },
        { Name: 'John Doe', Role: 'Manager', LeadsAssigned: leads.filter(l => l.assignedTo === 'u2').length, TasksCompleted: tasks.filter(t => t.assignedTo === 'u2' && t.status === 'completed').length },
        { Name: 'Alice Smith', Role: 'Employee', LeadsAssigned: leads.filter(l => l.assignedTo === 'u3').length, TasksCompleted: tasks.filter(t => t.assignedTo === 'u3' && t.status === 'completed').length },
        { Name: 'Bob Johnson', Role: 'Employee', LeadsAssigned: leads.filter(l => l.assignedTo === 'u4').length, TasksCompleted: tasks.filter(t => t.assignedTo === 'u4' && t.status === 'completed').length }
      ];
      csvData = convertToCSV(formattedTeam);
    }

    // Trigger file download
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    setTimeout(() => setIsExporting(false), 800);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)]">
        {/* Left column: Report Type selectors */}
        <div className="w-full lg:w-80 space-y-6 flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle>Report Configurations</CardTitle>
              <CardDescription>Select the data report module to isolate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 mt-4">
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1.5">Select Report</span>
                <Select
                  value={reportType}
                  onChange={(e: any) => setReportType(e.target.value)}
                  options={[
                    { value: 'lead', label: 'Lead Intake Summary' },
                    { value: 'customer', label: 'Customer Health Profiles' },
                    { value: 'revenue', label: 'Closed Revenue Audit' },
                    { value: 'team', label: 'Team Activity Breakdown' }
                  ]}
                  className="bg-bg-card border-border-color"
                />
              </div>

              <div className="space-y-2 pt-4 border-t border-border-color/50">
                <Button 
                  variant="primary" 
                  className="w-full py-2.5 text-xs"
                  onClick={handleExportCSV}
                  isLoading={isExporting}
                  leftIcon={<Download size={14} />}
                >
                  Export CSV / Excel
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full py-2.5 text-xs"
                  onClick={handlePrintPDF}
                  leftIcon={<FileText size={14} />}
                >
                  Export to PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Print Preview container */}
        <div className="flex-1 glass-panel border border-border-color rounded-xl overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-border-color bg-bg-card/40 flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <TableIcon size={14} className="text-brand-primary" /> Generated Report Preview
            </span>
            <Badge variant="success">Active Database</Badge>
          </div>

          {/* Table Preview */}
          <div className="flex-1 overflow-auto p-4 printable-section">
            <div className="min-w-[700px]">
              {/* Header Title for Printing */}
              <div className="hidden print-header mb-6">
                <h1 className="text-xl font-bold text-black">SALESMIND SYSTEM REPORT</h1>
                <p className="text-xs text-gray-500">Nexvora CRM Database Snapshot — {new Date().toLocaleDateString()}</p>
                <hr className="my-4 border-gray-300" />
              </div>

              {reportType === 'lead' && (
                <table className="w-full text-xxs border-collapse text-left text-text-secondary">
                  <thead>
                    <tr className="border-b border-border-color text-text-primary font-semibold">
                      <th className="py-2.5 pr-4">Lead ID</th>
                      <th className="py-2.5 pr-4">Name</th>
                      <th className="py-2.5 pr-4">Company</th>
                      <th className="py-2.5 pr-4">Industry</th>
                      <th className="py-2.5 pr-4">Source</th>
                      <th className="py-2.5 pr-4">Score</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color/40">
                    {leads.map(l => (
                      <tr key={l.leadId} className="hover:bg-input-bg/10">
                        <td className="py-2.5 pr-4 font-mono text-[10px]">{l.leadId}</td>
                        <td className="py-2.5 pr-4 text-white font-semibold">{l.name}</td>
                        <td className="py-2.5 pr-4">{l.company}</td>
                        <td className="py-2.5 pr-4">{l.industry}</td>
                        <td className="py-2.5 pr-4">{l.source}</td>
                        <td className="py-2.5 pr-4 font-bold">{l.score}</td>
                        <td className="py-2.5 capitalize">{l.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {reportType === 'customer' && (
                <table className="w-full text-xxs border-collapse text-left text-text-secondary">
                  <thead>
                    <tr className="border-b border-border-color text-text-primary font-semibold">
                      <th className="py-2.5 pr-4">Customer ID</th>
                      <th className="py-2.5 pr-4">Contact</th>
                      <th className="py-2.5 pr-4">Company</th>
                      <th className="py-2.5 pr-4">Health</th>
                      <th className="py-2.5 pr-4">Purchases</th>
                      <th className="py-2.5">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color/40">
                    {customers.map(c => {
                      const total = c.purchaseHistory.reduce((s, p) => s + p.amount, 0);
                      return (
                        <tr key={c.customerId} className="hover:bg-input-bg/10">
                          <td className="py-2.5 pr-4 font-mono text-[10px]">{c.customerId}</td>
                          <td className="py-2.5 pr-4 text-white font-semibold">{c.name}</td>
                          <td className="py-2.5 pr-4">{c.company}</td>
                          <td className="py-2.5 pr-4">{c.healthScore}/100</td>
                          <td className="py-2.5 pr-4">{c.purchaseHistory.length}</td>
                          <td className="py-2.5 font-bold text-brand-success">₹{total.toLocaleString('en-IN')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {reportType === 'revenue' && (
                <table className="w-full text-xxs border-collapse text-left text-text-secondary">
                  <thead>
                    <tr className="border-b border-border-color text-text-primary font-semibold">
                      <th className="py-2.5 pr-4">Customer</th>
                      <th className="py-2.5 pr-4">Company</th>
                      <th className="py-2.5 pr-4">Product / Item</th>
                      <th className="py-2.5 pr-4">Date</th>
                      <th className="py-2.5">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color/40">
                    {customers.flatMap(c => 
                      c.purchaseHistory.map((p, idx) => (
                        <tr key={`${c.customerId}-${idx}`} className="hover:bg-input-bg/10">
                          <td className="py-2.5 pr-4 text-white font-semibold">{c.name}</td>
                          <td className="py-2.5 pr-4">{c.company}</td>
                          <td className="py-2.5 pr-4">{p.item}</td>
                          <td className="py-2.5 pr-4">{p.date}</td>
                          <td className="py-2.5 font-bold text-brand-success">₹{p.amount.toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {reportType === 'team' && (
                <table className="w-full text-xxs border-collapse text-left text-text-secondary">
                  <thead>
                    <tr className="border-b border-border-color text-text-primary font-semibold">
                      <th className="py-2.5 pr-4">Team Member</th>
                      <th className="py-2.5 pr-4">Workspace Role</th>
                      <th className="py-2.5 pr-4">Active Leads Assigned</th>
                      <th className="py-2.5">Tasks Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color/40">
                    <tr className="hover:bg-input-bg/10">
                      <td className="py-2.5 pr-4 text-white font-semibold">Sarah Connor</td>
                      <td className="py-2.5 pr-4">Admin</td>
                      <td className="py-2.5 pr-4">{leads.filter(l => l.assignedTo === 'u1').length}</td>
                      <td className="py-2.5">{tasks.filter(t => t.assignedTo === 'u1' && t.status === 'completed').length}</td>
                    </tr>
                    <tr className="hover:bg-input-bg/10">
                      <td className="py-2.5 pr-4 text-white font-semibold">John Doe</td>
                      <td className="py-2.5 pr-4">Manager</td>
                      <td className="py-2.5 pr-4">{leads.filter(l => l.assignedTo === 'u2').length}</td>
                      <td className="py-2.5">{tasks.filter(t => t.assignedTo === 'u2' && t.status === 'completed').length}</td>
                    </tr>
                    <tr className="hover:bg-input-bg/10">
                      <td className="py-2.5 pr-4 text-white font-semibold">Alice Smith</td>
                      <td className="py-2.5 pr-4">Employee</td>
                      <td className="py-2.5 pr-4">{leads.filter(l => l.assignedTo === 'u3').length}</td>
                      <td className="py-2.5">{tasks.filter(t => t.assignedTo === 'u3' && t.status === 'completed').length}</td>
                    </tr>
                    <tr className="hover:bg-input-bg/10">
                      <td className="py-2.5 pr-4 text-white font-semibold">Bob Johnson</td>
                      <td className="py-2.5 pr-4">Employee</td>
                      <td className="py-2.5 pr-4">{leads.filter(l => l.assignedTo === 'u4').length}</td>
                      <td className="py-2.5">{tasks.filter(t => t.assignedTo === 'u4' && t.status === 'completed').length}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
