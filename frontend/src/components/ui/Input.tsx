import React from 'react';

export interface FormGroupProps {
  label?: React.ReactNode;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  label,
  error,
  helperText,
  required = false,
  children,
  className = ''
}) => {
  return (
    <div className={`flex flex-col gap-1.5 mb-3.5 ${className}`}>
      {label && (
        <label className="font-body text-fluid-mono font-bold uppercase tracking-wider text-content-muted">
          {label} {required && <span className="text-status-late">*</span>}
        </label>
      )}
      {children}
      {error && <span className="text-xs text-status-late font-medium">{error}</span>}
      {helperText && !error && <span className="text-xs text-content-dim">{helperText}</span>}
    </div>
  );
};

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
  helperText?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  helperText,
  required,
  className = '',
  ...props
}) => {
  const inputEl = (
    <input
      required={required}
      className={`bg-input border ${
        error ? 'border-status-late' : 'border-border'
      } rounded-md px-3.5 py-2.5 font-body text-fluid-body text-content-main w-full min-h-[42px] transition-all outline-none focus:border-tech focus:ring-2 focus:ring-tech/20 disabled:opacity-50 ${className}`}
      {...props}
    />
  );

  if (!label && !error && !helperText) return inputEl;

  return (
    <FormGroup label={label} error={error} helperText={helperText} required={required}>
      {inputEl}
    </FormGroup>
  );
};

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: React.ReactNode;
  error?: string;
  helperText?: string;
  options?: Array<{ value: string | number; label: string }>;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  error,
  helperText,
  required,
  options,
  children,
  className = '',
  ...props
}) => {
  const selectEl = (
    <select
      required={required}
      className={`bg-input border ${
        error ? 'border-status-late' : 'border-border'
      } rounded-md px-3.5 py-2.5 font-body text-fluid-body text-content-main w-full min-h-[42px] transition-all outline-none focus:border-tech focus:ring-2 focus:ring-tech/20 disabled:opacity-50 cursor-pointer ${className}`}
      {...props}
    >
      {options
        ? options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        : children}
    </select>
  );

  if (!label && !error && !helperText) return selectEl;

  return (
    <FormGroup label={label} error={error} helperText={helperText} required={required}>
      {selectEl}
    </FormGroup>
  );
};

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  error?: string;
  helperText?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  error,
  helperText,
  required,
  className = '',
  rows = 3,
  ...props
}) => {
  const textareaEl = (
    <textarea
      rows={rows}
      required={required}
      className={`bg-input border ${
        error ? 'border-status-late' : 'border-border'
      } rounded-md p-3 font-body text-fluid-body text-content-main w-full min-h-[80px] transition-all outline-none focus:border-tech focus:ring-2 focus:ring-tech/20 disabled:opacity-50 resize-y ${className}`}
      {...props}
    />
  );

  if (!label && !error && !helperText) return textareaEl;

  return (
    <FormGroup label={label} error={error} helperText={helperText} required={required}>
      {textareaEl}
    </FormGroup>
  );
};
