'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  className = ''
}) => {
  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer select-none ${className}`}>
      {label && <span className="text-xs font-semibold text-text-secondary">{label}</span>}
      <div
        onClick={() => onChange(!checked)}
        className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
          checked ? 'bg-brand-primary' : 'bg-input-bg border border-border-color'
        }`}
      >
        <motion.div
          animate={{ x: checked ? 18 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="w-4 h-4 rounded-full bg-white shadow-sm"
        />
      </div>
    </label>
  );
};
