import { isFirebaseConfigured, firestore } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  setDoc
} from 'firebase/firestore';
import { 
  mockLeads, 
  mockCustomers, 
  mockActivities, 
  mockTasks, 
  mockNotifications,
  Lead, 
  Customer, 
  Activity, 
  Task 
} from './mockData';

// LocalStorage Keys
const LEADS_KEY = 'salesmind_leads';
const CUSTOMERS_KEY = 'salesmind_customers';
const ACTIVITIES_KEY = 'salesmind_activities';
const TASKS_KEY = 'salesmind_tasks';
const NOTIFICATIONS_KEY = 'salesmind_notifications';

// Seed LocalStorage helper
const getLocalData = <T>(key: string, initial: T[]): T[] => {
  if (typeof window === 'undefined') return initial;
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

const setLocalData = <T>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

// INITIALIZE SEEDS
export const initLocalDatabase = () => {
  getLocalData(LEADS_KEY, mockLeads);
  getLocalData(CUSTOMERS_KEY, mockCustomers);
  getLocalData(ACTIVITIES_KEY, mockActivities);
  getLocalData(TASKS_KEY, mockTasks);
  getLocalData(NOTIFICATIONS_KEY, mockNotifications);
};

// ==========================================
// LEADS FUNCTIONS
// ==========================================

export const getLeads = async (): Promise<Lead[]> => {
  if (isFirebaseConfigured && firestore) {
    try {
      const snap = await getDocs(collection(firestore, 'leads'));
      return snap.docs.map(d => ({ leadId: d.id, ...d.data() } as Lead));
    } catch (e) {
      console.warn("Firestore error, falling back to local storage:", e);
    }
  }
  return getLocalData(LEADS_KEY, mockLeads);
};

export const getLead = async (leadId: string): Promise<Lead | null> => {
  if (isFirebaseConfigured && firestore) {
    try {
      const docRef = doc(firestore, 'leads', leadId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { leadId: snap.id, ...snap.data() } as Lead;
      }
    } catch (e) {
      console.warn(e);
    }
  }
  const leads = getLocalData(LEADS_KEY, mockLeads);
  return leads.find(l => l.leadId === leadId) || null;
};

export const saveLead = async (lead: Partial<Lead> & { leadId?: string }): Promise<Lead> => {
  const isNew = !lead.leadId;
  const leadId = lead.leadId || 'l_' + Math.random().toString(36).substr(2, 9);
  
  const leadToSave: Lead = {
    leadId,
    name: lead.name || 'New Lead',
    company: lead.company || '',
    email: lead.email || '',
    phone: lead.phone || '',
    industry: lead.industry || 'General',
    source: lead.source || 'Website',
    score: lead.score !== undefined ? lead.score : Math.floor(Math.random() * 40) + 40, // default mid score
    status: lead.status || 'new',
    assignedTo: lead.assignedTo || 'u3',
    notes: lead.notes || '',
    createdAt: lead.createdAt || new Date().toISOString()
  };

  if (isFirebaseConfigured && firestore) {
    try {
      await setDoc(doc(firestore, 'leads', leadId), leadToSave);
      
      // Auto-log activity for creation
      if (isNew) {
        await logActivity(leadId, 'note', `Lead created for ${leadToSave.name} (${leadToSave.company})`);
      } else {
        await logActivity(leadId, 'note', `Lead details updated for ${leadToSave.name}`);
      }
      return leadToSave;
    } catch (e) {
      console.warn("Firestore write error, using LocalStorage:", e);
    }
  }

  // Local Storage
  const leads = getLocalData(LEADS_KEY, mockLeads);
  const index = leads.findIndex(l => l.leadId === leadId);
  if (index >= 0) {
    leads[index] = leadToSave;
  } else {
    leads.push(leadToSave);
    await logActivity(leadId, 'note', `Lead created for ${leadToSave.name} (${leadToSave.company})`);
  }
  setLocalData(LEADS_KEY, leads);
  return leadToSave;
};

export const deleteLead = async (leadId: string): Promise<void> => {
  if (isFirebaseConfigured && firestore) {
    try {
      await deleteDoc(doc(firestore, 'leads', leadId));
      return;
    } catch (e) {
      console.warn(e);
    }
  }
  const leads = getLocalData(LEADS_KEY, mockLeads);
  const filtered = leads.filter(l => l.leadId !== leadId);
  setLocalData(LEADS_KEY, filtered);
};

// ==========================================
// CUSTOMERS FUNCTIONS
// ==========================================

export const getCustomers = async (): Promise<Customer[]> => {
  if (isFirebaseConfigured && firestore) {
    try {
      const snap = await getDocs(collection(firestore, 'customers'));
      return snap.docs.map(d => ({ customerId: d.id, ...d.data() } as Customer));
    } catch (e) {
      console.warn(e);
    }
  }
  return getLocalData(CUSTOMERS_KEY, mockCustomers);
};

export const saveCustomer = async (cust: Partial<Customer> & { customerId?: string }): Promise<Customer> => {
  const customerId = cust.customerId || 'c_' + Math.random().toString(36).substr(2, 9);
  
  const customerToSave: Customer = {
    customerId,
    name: cust.name || 'New Customer',
    company: cust.company || '',
    email: cust.email || '',
    phone: cust.phone || '',
    healthScore: cust.healthScore !== undefined ? cust.healthScore : 75,
    purchaseHistory: cust.purchaseHistory || [],
    assignedTo: cust.assignedTo || 'u3',
    createdAt: cust.createdAt || new Date().toISOString()
  };

  if (isFirebaseConfigured && firestore) {
    try {
      await setDoc(doc(firestore, 'customers', customerId), customerToSave);
      return customerToSave;
    } catch (e) {
      console.warn(e);
    }
  }

  const customers = getLocalData(CUSTOMERS_KEY, mockCustomers);
  const index = customers.findIndex(c => c.customerId === customerId);
  if (index >= 0) {
    customers[index] = customerToSave;
  } else {
    customers.push(customerToSave);
  }
  setLocalData(CUSTOMERS_KEY, customers);
  return customerToSave;
};

// ==========================================
// ACTIVITIES FUNCTIONS
// ==========================================

export const getActivities = async (leadId?: string): Promise<Activity[]> => {
  const allActs = getLocalData(ACTIVITIES_KEY, mockActivities);
  if (leadId) {
    return allActs.filter(a => a.leadId === leadId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  return allActs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const logActivity = async (leadId: string, type: Activity['type'], description: string): Promise<Activity> => {
  const newActivity: Activity = {
    activityId: 'act_' + Math.random().toString(36).substr(2, 9),
    leadId,
    type,
    description,
    date: new Date().toISOString()
  };

  if (isFirebaseConfigured && firestore) {
    try {
      await addDoc(collection(firestore, 'activities'), newActivity);
      return newActivity;
    } catch (e) {
      console.warn(e);
    }
  }

  const acts = getLocalData(ACTIVITIES_KEY, mockActivities);
  acts.push(newActivity);
  setLocalData(ACTIVITIES_KEY, acts);
  return newActivity;
};

// ==========================================
// TASKS FUNCTIONS
// ==========================================

export const getTasks = async (userId?: string): Promise<Task[]> => {
  const allTasks = getLocalData(TASKS_KEY, mockTasks);
  if (userId) {
    return allTasks.filter(t => t.assignedTo === userId);
  }
  return allTasks;
};

export const saveTask = async (task: Partial<Task> & { taskId?: string }): Promise<Task> => {
  const taskId = task.taskId || 't_' + Math.random().toString(36).substr(2, 9);
  const taskToSave: Task = {
    taskId,
    assignedTo: task.assignedTo || 'u3',
    leadId: task.leadId || undefined,
    title: task.title || 'Follow up task',
    description: task.description || '',
    dueDate: task.dueDate || new Date(Date.now() + 86400000).toISOString(),
    status: task.status || 'pending',
    createdAt: task.createdAt || new Date().toISOString()
  };

  if (isFirebaseConfigured && firestore) {
    try {
      await setDoc(doc(firestore, 'tasks', taskId), taskToSave);
      return taskToSave;
    } catch (e) {
      console.warn(e);
    }
  }

  const tasks = getLocalData(TASKS_KEY, mockTasks);
  const index = tasks.findIndex(t => t.taskId === taskId);
  if (index >= 0) {
    tasks[index] = taskToSave;
  } else {
    tasks.push(taskToSave);
  }
  setLocalData(TASKS_KEY, tasks);
  return taskToSave;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  if (isFirebaseConfigured && firestore) {
    try {
      await deleteDoc(doc(firestore, 'tasks', taskId));
      return;
    } catch (e) {
      console.warn(e);
    }
  }
  const tasks = getLocalData(TASKS_KEY, mockTasks);
  const filtered = tasks.filter(t => t.taskId !== taskId);
  setLocalData(TASKS_KEY, filtered);
};

// ==========================================
// NOTIFICATIONS FUNCTIONS
// ==========================================

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  date: string;
  read: boolean;
}

export const getNotifications = (): NotificationItem[] => {
  return getLocalData(NOTIFICATIONS_KEY, mockNotifications);
};

export const markNotificationRead = (id: string) => {
  const notes = getLocalData(NOTIFICATIONS_KEY, mockNotifications);
  const index = notes.findIndex(n => n.id === id);
  if (index >= 0) {
    notes[index].read = true;
    setLocalData(NOTIFICATIONS_KEY, notes);
  }
};

export const addNotification = (title: string, message: string, type: string = 'info') => {
  const notes = getLocalData(NOTIFICATIONS_KEY, mockNotifications);
  const newNote = {
    id: 'n_' + Math.random().toString(36).substr(2, 9),
    title,
    message,
    type,
    date: new Date().toISOString(),
    read: false
  };
  notes.unshift(newNote);
  setLocalData(NOTIFICATIONS_KEY, notes);
};
