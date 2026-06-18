'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  // Styles base
  let variantClass = '';
  switch (variant) {
    case 'primary':
      variantClass = 'bg-brand-primary hover:bg-opacity-90 text-white shadow-[0_0_15px_rgba(95,90,246,0.3)] border border-brand-primary/20';
      break;
    case 'secondary':
      variantClass = 'bg-brand-secondary hover:bg-opacity-90 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)] border border-brand-secondary/20';
      break;
    case 'outline':
      variantClass = 'bg-transparent border border-border-color hover:bg-border-color hover:text-white text-text-secondary';
      break;
    case 'danger':
      variantClass = 'bg-brand-error hover:bg-opacity-90 text-white shadow-[0_0_15px_rgba(239,68,68,0.25)] border border-brand-error/20';
      break;
    case 'ghost':
      variantClass = 'bg-transparent hover:bg-input-bg text-text-secondary hover:text-text-primary';
      break;
  }

  let sizeClass = '';
  switch (size) {
    case 'sm':
      sizeClass = 'px-3 py-1.5 text-xs rounded-sm';
      break;
    case 'md':
      sizeClass = 'px-4 py-2 text-sm rounded-md font-medium';
      break;
    case 'lg':
      sizeClass = 'px-6 py-3 text-base rounded-lg font-semibold';
      break;
  }

  const isBtnDisabled = disabled || isLoading;

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] ${variantClass} ${sizeClass} ${className}`}
      disabled={isBtnDisabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!isLoading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
    </button>
  );
};

