'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { getCurrentUser } from '@/lib/auth';
import { initLocalDatabase } from '@/lib/db';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Seed local database arrays
    initLocalDatabase();
    
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-primary"></div>
        <p className="text-xs text-text-muted font-semibold tracking-widest animate-pulse">
          SALESMIND ENGINE INITIALIZING...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-app text-text-primary tech-grid relative">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      {/* Main Content Area */}
      <div 
        className="transition-all duration-300 min-h-screen flex flex-col"
        style={{ paddingLeft: collapsed ? '4rem' : '16rem' }}
      >
        {/* Topbar */}
        <Topbar />
        
        {/* Page Body content */}
        <main className="flex-1 p-6 z-10 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
export default AppLayout;
