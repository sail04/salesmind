import React from 'react';

// ==========================================
// LABEL COMPONENT
// ==========================================
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({ children, className = '', ...props }) => {
  return (
    <label className={`block text-xs font-semibold text-text-secondary mb-1.5 ${className}`} {...props}>
      {children}
    </label>
  );
};

// ==========================================
// INPUT COMPONENT
// ==========================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`w-full bg-input-bg text-text-primary placeholder:text-text-muted text-sm border ${
            error ? 'border-brand-error focus:ring-brand-error/20' : 'border-border-color focus:border-brand-primary'
          } rounded-md px-3.5 py-2 transition-all outline-none focus:ring-2 focus:ring-brand-primary/20 ${className}`}
          {...props}
        />
        {error && <span className="text-xxs text-brand-error mt-1 block">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ==========================================
// TEXTAREA COMPONENT
// ==========================================
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={`w-full bg-input-bg text-text-primary placeholder:text-text-muted text-sm border ${
            error ? 'border-brand-error focus:ring-brand-error/20' : 'border-border-color focus:border-brand-primary'
          } rounded-md px-3.5 py-2 min-h-[80px] transition-all outline-none focus:ring-2 focus:ring-brand-primary/20 resize-y ${className}`}
          {...props}
        />
        {error && <span className="text-xxs text-brand-error mt-1 block">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// ==========================================
// SELECT COMPONENT
// ==========================================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, options, children, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={`w-full bg-input-bg text-text-primary text-sm border ${
            error ? 'border-brand-error focus:ring-brand-error/20' : 'border-border-color focus:border-brand-primary'
          } rounded-md px-3 py-2 transition-all outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer ${className}`}
          {...props}
        >
          {options && options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-input-bg text-text-primary">
              {opt.label}
            </option>
          ))}
          {children}
        </select>
        {error && <span className="text-xxs text-brand-error mt-1 block">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
