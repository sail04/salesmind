'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  CheckSquare, 
  Square, 
  Trash2, 
  Calendar, 
  User, 
  Link as LinkIcon, 
  Search,
  CheckCircle2
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Label, Select, Textarea } from '@/components/ui/Input';
import { getTasks, saveTask, deleteTask, getLeads, logActivity } from '@/lib/db';
import { Task, Lead, mockUsers } from '@/lib/mockData';
import { getCurrentUser } from '@/lib/auth';

export default function TasksPage() {
  const currentUser = getCurrentUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  
  // Form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('u3');
  const [taskLead, setTaskLead] = useState('');

  const loadData = async () => {
    const dbTasks = await getTasks();
    const dbLeads = await getLeads();
    setTasks(dbTasks);
    setLeads(dbLeads);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Partial<Task> = {
      title: taskTitle,
      description: taskDesc,
      dueDate: new Date(taskDue).toISOString(),
      assignedTo: taskAssignee,
      leadId: taskLead || undefined,
      status: 'pending'
    };

    await saveTask(newTask);
    if (taskLead) {
      await logActivity(taskLead, 'task', `Task created: "${taskTitle}"`);
    }

    setIsOpen(false);
    // Reset Form
    setTaskTitle('');
    setTaskDesc('');
    setTaskDue('');
    setTaskLead('');
    loadData();
  };

  const toggleTaskStatus = async (task: Task) => {
    const updatedStatus: Task['status'] = task.status === 'completed' ? 'pending' : 'completed';
    const updated = {
      ...task,
      status: updatedStatus
    };
    await saveTask(updated);
    
    if (task.leadId) {
      await logActivity(
        task.leadId, 
        'task', 
        `Task "${task.title}" was marked as ${updatedStatus.toUpperCase()}`
      );
    }
    
    loadData();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Delete this task?")) {
      await deleteTask(taskId);
      loadData();
    }
  };

  // Filter and search computation
  const getFilteredTasks = () => {
    let result = tasks;

    // Role restrictions: Employees see only assigned tasks
    if (currentUser && currentUser.role === 'employee') {
      result = result.filter(t => t.assignedTo === currentUser.uid);
    }

    if (filter === 'pending') {
      result = result.filter(t => t.status === 'pending');
    } else if (filter === 'completed') {
      result = result.filter(t => t.status === 'completed');
    }

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(s) || 
        t.description.toLowerCase().includes(s)
      );
    }

    return result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const filtered = getFilteredTasks();

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-white">Daily Tasks</h2>
          <p className="text-xs text-text-muted mt-0.5">Track follow-ups, proposal drafts, and schedules.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-bg-card border-border-color"
            />
            <Search size={14} className="absolute left-3 top-3 text-text-muted" />
          </div>
          <Select
            value={filter}
            onChange={(e: any) => setFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Tasks' },
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' }
            ]}
            className="w-32 py-1.5 text-xs bg-bg-card"
          />
          <Button variant="primary" size="md" onClick={() => setIsOpen(true)} leftIcon={<Plus size={16} />}>
            New Task
          </Button>
        </div>
      </div>

      {/* Checklist items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tasks List */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-text-muted glass-panel border border-border-color rounded-lg">
              No tasks match the filter criteria.
            </div>
          ) : (
            filtered.map((task) => {
              const assignedUser = mockUsers.find(u => u.uid === task.assignedTo);
              const relatedLead = leads.find(l => l.leadId === task.leadId);
              const isOverdue = task.status === 'pending' && new Date(task.dueDate).getTime() < Date.now();

              return (
                <Card 
                  key={task.taskId} 
                  className={`border transition-colors ${
                    task.status === 'completed' 
                      ? 'border-border-color/35 bg-bg-card/20' 
                      : isOverdue 
                        ? 'border-brand-error/20 bg-brand-error/[0.02]' 
                        : 'border-border-color hover:border-brand-primary/40'
                  }`}
                >
                  <div className="flex items-start gap-3.5 justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => toggleTaskStatus(task)}
                        className="mt-1 cursor-pointer text-text-muted hover:text-brand-primary transition-colors"
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 size={18} className="text-brand-success" />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                      
                      <div className="space-y-1 overflow-hidden">
                        <h4 className={`text-xs font-bold text-text-primary ${
                          task.status === 'completed' ? 'line-through text-text-muted' : ''
                        }`}>
                          {task.title}
                        </h4>
                        <p className={`text-[11px] text-text-secondary leading-relaxed ${
                          task.status === 'completed' ? 'line-through text-text-muted' : ''
                        }`}>
                          {task.description}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] text-text-muted">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} className={isOverdue ? 'text-brand-error' : ''} />
                            <span className={isOverdue ? 'text-brand-error font-semibold' : ''}>
                              {new Date(task.dueDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              {isOverdue && ' (Overdue)'}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={11} />
                            {assignedUser?.name}
                          </span>
                          {relatedLead && (
                            <span className="flex items-center gap-1 text-brand-primary font-medium">
                              <LinkIcon size={11} />
                              Lead: {relatedLead.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.taskId)}
                      className="p-1.5 rounded text-text-muted hover:text-brand-error hover:bg-brand-error/10 transition-all cursor-pointer"
                      title="Delete Task"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Right Column: Mini calendar/Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Completion Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span>Completed Tasks</span>
                <span className="font-bold text-brand-success">{tasks.filter(t => t.status === 'completed').length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Pending Tasks</span>
                <span className="font-bold text-brand-warning">{tasks.filter(t => t.status === 'pending').length}</span>
              </div>
              <div className="w-full bg-border-color h-2 rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-brand-success rounded-full"
                  style={{ 
                    width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0}%` 
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CREATE TASK DIALOG */}
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Schedule Work Task"
        size="md"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <Label htmlFor="taskTitle">Task Summary</Label>
            <Input
              id="taskTitle"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Finalize pricing proposal"
              required
            />
          </div>

          <div>
            <Label htmlFor="taskDesc">Detailed Instructions</Label>
            <Textarea
              id="taskDesc"
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              placeholder="Outline specific items, links, context..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taskDue">Due Date & Time</Label>
              <Input
                id="taskDue"
                type="datetime-local"
                value={taskDue}
                onChange={(e) => setTaskDue(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="taskAssignee">Assignee</Label>
              <Select
                id="taskAssignee"
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
                options={mockUsers.map(u => ({ value: u.uid, label: u.name }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="taskLead">Link to CRM Lead (Optional)</Label>
            <Select
              id="taskLead"
              value={taskLead}
              onChange={(e) => setTaskLead(e.target.value)}
              options={[
                { value: '', label: 'Unlinked / General Task' },
                ...leads.map(l => ({ value: l.leadId, label: `${l.name} (${l.company})` }))
              ]}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border-color">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Schedule Task
            </Button>
          </div>
        </form>
      </Dialog>
    </AppLayout>
  );
}
