export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  createdAt: string;
}

export interface Lead {
  leadId: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  industry: string;
  source: string;
  score: number;
  status: 'new' | 'contacted' | 'interested' | 'qualified' | 'negotiation' | 'won' | 'lost';
  assignedTo: string; // userId
  notes: string;
  createdAt: string;
}

export interface Customer {
  customerId: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  healthScore: number;
  purchaseHistory: {
    item: string;
    amount: number;
    date: string;
  }[];
  assignedTo: string;
  createdAt: string;
}

export interface Activity {
  activityId: string;
  leadId: string;
  type: 'call' | 'meeting' | 'email' | 'task' | 'note';
  description: string;
  date: string;
}

export interface Task {
  taskId: string;
  assignedTo: string;
  leadId?: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

export interface Report {
  reportId: string;
  reportType: 'revenue' | 'lead' | 'customer' | 'team';
  createdBy: string;
  createdAt: string;
  data: string; // JSON string
}

// Initial Mock Seed Data
export const mockUsers: User[] = [
  { uid: 'u1', name: 'Sarah Connor', email: 'admin@nexvora.com', role: 'admin', createdAt: '2026-01-10T08:00:00Z' },
  { uid: 'u2', name: 'John Doe', email: 'john@nexvora.com', role: 'manager', createdAt: '2026-01-15T09:00:00Z' },
  { uid: 'u3', name: 'Alice Smith', email: 'alice@nexvora.com', role: 'employee', createdAt: '2026-02-01T10:00:00Z' },
  { uid: 'u4', name: 'Bob Johnson', email: 'bob@nexvora.com', role: 'employee', createdAt: '2026-02-05T11:00:00Z' }
];

export const mockLeads: Lead[] = [
  {
    leadId: 'l1',
    name: 'Alex Rivera',
    company: 'Quantum Tech Corp',
    email: 'alex@quantumtech.io',
    phone: '+91 98765 43210',
    industry: 'Software',
    source: 'Website',
    score: 92,
    status: 'qualified',
    assignedTo: 'u3',
    notes: 'Interested in enterprise cloud integration. Needs a demo by next Tuesday.',
    createdAt: '2026-06-01T09:00:00Z'
  },
  {
    leadId: 'l2',
    name: 'Meera Patel',
    company: 'Apex Logistics',
    email: 'meera.p@apexlogistics.com',
    phone: '+91 99887 76655',
    industry: 'Logistics',
    source: 'Referral',
    score: 85,
    status: 'interested',
    assignedTo: 'u3',
    notes: 'Inquired about route planning API integration. High budget size.',
    createdAt: '2026-06-03T11:30:00Z'
  },
  {
    leadId: 'l3',
    name: 'Marcus Vance',
    company: 'Stellar FinTech',
    email: 'marcus@stellarfin.com',
    phone: '+1 415 555 2671',
    industry: 'Finance',
    source: 'LinkedIn',
    score: 64,
    status: 'contacted',
    assignedTo: 'u4',
    notes: 'Introductory call completed. Sent brochure. Waiting on response.',
    createdAt: '2026-06-05T14:15:00Z'
  },
  {
    leadId: 'l4',
    name: 'Rajesh Kumar',
    company: 'Bharat AgriTech',
    email: 'rajesh@bharatagri.in',
    phone: '+91 91234 56789',
    industry: 'Agriculture',
    source: 'Cold Outreach',
    score: 42,
    status: 'new',
    assignedTo: 'u4',
    notes: 'Generated from industry registry. Need to perform first call.',
    createdAt: '2026-06-09T10:00:00Z'
  },
  {
    leadId: 'l5',
    name: 'Diana Prince',
    company: 'Themyscira Exports',
    email: 'diana@themyscira.org',
    phone: '+30 210 123456',
    industry: 'Retail',
    source: 'Partner',
    score: 95,
    status: 'negotiation',
    assignedTo: 'u3',
    notes: 'Finalizing pricing terms. Ready to upgrade from standard to premium package.',
    createdAt: '2026-05-28T09:00:00Z'
  },
  {
    leadId: 'l6',
    name: 'Bruce Wayne',
    company: 'Wayne Enterprises',
    email: 'bruce@waynecorp.com',
    phone: '+1 Gotham 4444',
    industry: 'Conglomerate',
    source: 'Website',
    score: 99,
    status: 'won',
    assignedTo: 'u2',
    notes: 'Enterprise contract signed. Transferred to Customer database.',
    createdAt: '2026-05-15T08:00:00Z'
  },
  {
    leadId: 'l7',
    name: 'Tony Stark',
    company: 'Stark Industries',
    email: 'tony@stark.com',
    phone: '+1 Malibu 3000',
    industry: 'Defense & Energy',
    source: 'Referral',
    score: 15,
    status: 'lost',
    assignedTo: 'u4',
    notes: 'Competitor offering customized proprietary suite. Lost deal.',
    createdAt: '2026-05-20T10:00:00Z'
  }
];

export const mockCustomers: Customer[] = [
  {
    customerId: 'c_wayne',
    name: 'Bruce Wayne',
    company: 'Wayne Enterprises',
    email: 'bruce@waynecorp.com',
    phone: '+1 Gotham 4444',
    healthScore: 94,
    purchaseHistory: [
      { item: 'SalesMind Enterprise Suite - Year 1', amount: 850000, date: '2026-05-15' },
      { item: 'Custom AI Onboarding & Training', amount: 150000, date: '2026-05-20' }
    ],
    assignedTo: 'u2',
    createdAt: '2026-05-15T08:00:00Z'
  },
  {
    customerId: 'c_starlight',
    name: 'Starlight Retailers',
    company: 'Starlight Group',
    email: 'contact@starlightretail.in',
    phone: '+91 88776 65544',
    healthScore: 48,
    purchaseHistory: [
      { item: 'SalesMind Team Pro Monthly x 10', amount: 25000, date: '2026-03-01' },
      { item: 'SalesMind Team Pro Monthly x 10', amount: 25000, date: '2026-04-01' },
      { item: 'SalesMind Team Pro Monthly x 10', amount: 25000, date: '2026-05-01' }
    ],
    assignedTo: 'u3',
    createdAt: '2026-03-01T10:00:00Z'
  },
  {
    customerId: 'c_cyberdyne',
    name: 'Miles Dyson',
    company: 'Cyberdyne Systems',
    email: 'mdyson@cyberdyne.jp',
    phone: '+81 3 1234 5678',
    healthScore: 91,
    purchaseHistory: [
      { item: 'SalesMind Enterprise Suite - Annual', amount: 200000, date: '2026-04-10' }
    ],
    assignedTo: 'u4',
    createdAt: '2026-04-10T09:00:00Z'
  }
];

export const mockActivities: Activity[] = [
  { activityId: 'a1', leadId: 'l1', type: 'call', description: 'Initial contact call. Discussed requirements.', date: '2026-06-02T10:00:00Z' },
  { activityId: 'a2', leadId: 'l1', type: 'email', description: 'Sent API technical specifications brochure.', date: '2026-06-02T11:00:00Z' },
  { activityId: 'a3', leadId: 'l1', type: 'meeting', description: 'Product Demo with IT Director.', date: '2026-06-08T15:30:00Z' },
  { activityId: 'a4', leadId: 'l2', type: 'call', description: 'Incoming lead callback. Client confirmed budget.', date: '2026-06-04T10:30:00Z' },
  { activityId: 'a5', leadId: 'l3', type: 'email', description: 'Sent follow up email asking for convenience time for a short call.', date: '2026-06-06T12:00:00Z' }
];

export const mockTasks: Task[] = [
  {
    taskId: 't1',
    assignedTo: 'u3',
    leadId: 'l1',
    title: 'Prepare Custom Pricing Proposal',
    description: 'Create tailored quote incorporating volume-based cloud integration rates.',
    dueDate: '2026-06-14T17:00:00Z',
    status: 'pending',
    createdAt: '2026-06-10T09:00:00Z'
  },
  {
    taskId: 't2',
    assignedTo: 'u3',
    leadId: 'l2',
    title: 'Schedule Technical Deep-Dive Call',
    description: 'Coordinate with Solutions Architect to walk through Route Planning API.',
    dueDate: '2026-06-12T12:00:00Z',
    status: 'pending',
    createdAt: '2026-06-10T10:00:00Z'
  },
  {
    taskId: 't3',
    assignedTo: 'u4',
    leadId: 'l3',
    title: 'Follow-up on Introductory Email',
    description: 'Check back regarding brochure review and setup demo call.',
    dueDate: '2026-06-11T18:00:00Z',
    status: 'pending',
    createdAt: '2026-06-08T09:00:00Z'
  },
  {
    taskId: 't4',
    assignedTo: 'u3',
    leadId: 'l5',
    title: 'Draft Service Agreement (SLA)',
    description: 'Finalize standard support package clauses for Diana Prince.',
    dueDate: '2026-06-10T15:00:00Z',
    status: 'completed',
    createdAt: '2026-06-07T08:00:00Z'
  }
];

export const mockNotifications = [
  { id: 'n1', title: 'New Lead Capture', message: 'WhatsApp message from Rajesh Kumar created a new lead.', type: 'info', date: '2026-06-09T10:00:00Z', read: false },
  { id: 'n2', title: 'Task Due', message: 'Follow-up on Introductory Email with Marcus Vance is due today.', type: 'warning', date: '2026-06-11T08:00:00Z', read: false },
  { id: 'n3', title: 'Revenue Target Met', message: 'Deal closed with Wayne Enterprises hit Q2 Tier 1 target!', type: 'success', date: '2026-05-15T08:05:00Z', read: true },
  { id: 'n4', title: 'Lead Assigned', message: 'Lead Diana Prince assigned to Sarah Connor by Admin.', type: 'info', date: '2026-05-28T09:05:00Z', read: true }
];
