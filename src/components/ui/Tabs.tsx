'use client';

import React from 'react';

interface TabOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  options: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  options,
  activeTab,
  onChange,
  className = ''
}) => {
  return (
    <div className={`flex border-b border-border-color space-x-1 p-1 bg-bg-card/50 rounded-lg ${className}`}>
      {options.map((option) => {
        const isActive = option.id === activeTab;
        return (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              isActive
                ? 'bg-input-bg text-brand-primary border-b-2 border-brand-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary hover:bg-input-bg/30'
            }`}
          >
            {option.icon && <span className="inline-flex">{option.icon}</span>}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
