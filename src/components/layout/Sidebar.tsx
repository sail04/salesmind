'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  GitBranch, 
  History, 
  CheckSquare, 
  BarChart3, 
  FileText, 
  Brain, 
  MessageSquare, 
  FolderSync, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  Bell,
  Sparkles
} from 'lucide-react';
import { getCurrentUser, logout } from '@/lib/auth';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const pathname = usePathname();
  const router = useRouter();
  const user = getCurrentUser();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Base list of items
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
    { name: 'Leads', path: '/leads', icon: Users, roles: ['admin', 'manager', 'employee'] },
    { name: 'Pipeline', path: '/pipeline', icon: GitBranch, roles: ['admin', 'manager', 'employee'] },
    { name: 'Customers', path: '/customers', icon: UserSquare2, roles: ['admin', 'manager', 'employee'] },
    { name: 'Activities', path: '/activities', icon: History, roles: ['admin', 'manager', 'employee'] },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare, roles: ['admin', 'manager', 'employee'] },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['admin', 'manager'] },
    { name: 'Reports', path: '/reports', icon: FileText, roles: ['admin', 'manager'] },
    { name: 'AI Insights', path: '/ai-insights', icon: Brain, roles: ['admin', 'manager'] },
    { name: 'Meeting Summarizer', path: '/meeting-summarizer', icon: FolderSync, roles: ['admin', 'manager', 'employee'] },
    { name: 'WhatsApp CRM', path: '/whatsapp-crm', icon: MessageSquare, roles: ['admin', 'manager', 'employee'] },
    { name: 'Team Management', path: '/team', icon: Sparkles, roles: ['admin', 'manager'] },
  ];

  const filteredItems = menuItems.filter(item => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen bg-bg-card border-r border-border-color transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border-color">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                SALESMIND
              </span>
              <span className="text-xxs border border-brand-primary/30 text-brand-primary px-1.5 py-0.5 rounded-full font-bold">
                v1.0
              </span>
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="mx-auto font-black text-lg bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              S
            </Link>
          )}
          
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md border border-border-color hover:bg-input-bg transition-colors cursor-pointer text-text-muted hover:text-text-primary hidden md:block"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* User Badge Info */}
        {!collapsed && user && (
          <div className="p-4 mx-4 my-3 bg-input-bg/40 rounded-lg border border-border-color/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-xs">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-semibold text-text-primary truncate">{user.name}</h4>
                <span className="text-[10px] text-brand-primary font-bold uppercase tracking-wider bg-brand-primary/10 px-2 py-0.5 rounded-full">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto pr-2">
          {filteredItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-xs font-semibold group ${
                  isActive 
                    ? 'bg-brand-primary/15 text-brand-primary border-l-2 border-brand-primary' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-input-bg/50'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-brand-primary' : 'text-text-muted group-hover:text-text-primary transition-colors'} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="p-3 border-t border-border-color space-y-1">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold group ${
            pathname === '/settings' 
              ? 'bg-brand-primary/15 text-brand-primary border-l-2 border-brand-primary' 
              : 'text-text-secondary hover:text-text-primary hover:bg-input-bg/50'
          }`}
        >
          <Settings size={18} className="text-text-muted group-hover:text-text-primary" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold text-brand-error hover:bg-brand-error/10 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
