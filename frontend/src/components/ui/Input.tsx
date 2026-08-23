import React from 'react';

export interface FormGroupProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  label,
  error,
  helperText,
  required,
  children,
  className = '',
  style
}) => {
  return (
    <div className={`form-group-constructo ${className}`} style={style}>
      {label && (
        <label className="form-label-constructo" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>{label}</span>
          {required && <span style={{ color: 'var(--status-late)' }}>*</span>}
        </label>
      )}
      {children}
      {error && (
        <span style={{ fontSize: '11px', color: 'var(--status-late)', fontWeight: 600, marginTop: '2px' }}>
          {error}
        </span>
      )}
      {helperText && !error && (
        <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, required, className = '', id, ...props }, ref) => {
    const inputElement = (
      <input
        ref={ref}
        id={id}
        required={required}
        className={`form-input-constructo ${className}`}
        style={{
          borderColor: error ? 'var(--status-late)' : undefined,
          ...props.style
        }}
        {...props}
      />
    );

    if (!label && !error && !helperText) return inputElement;

    return (
      <FormGroup label={label} error={error} helperText={helperText} required={required}>
        {inputElement}
      </FormGroup>
    );
  }
);

FormInput.displayName = 'FormInput';

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string | number; label: string }[];
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, helperText, required, options, children, className = '', id, ...props }, ref) => {
    const selectElement = (
      <select
        ref={ref}
        id={id}
        required={required}
        className={`form-select-constructo ${className}`}
        style={{
          borderColor: error ? 'var(--status-late)' : undefined,
          ...props.style
        }}
        {...props}
      >
        {options ? options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        )) : children}
      </select>
    );

    if (!label && !error && !helperText) return selectElement;

    return (
      <FormGroup label={label} error={error} helperText={helperText} required={required}>
        {selectElement}
      </FormGroup>
    );
  }
);

FormSelect.displayName = 'FormSelect';

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, helperText, required, className = '', id, ...props }, ref) => {
    const textareaElement = (
      <textarea
        ref={ref}
        id={id}
        required={required}
        className={`form-textarea-constructo ${className}`}
        style={{
          borderColor: error ? 'var(--status-late)' : undefined,
          ...props.style
        }}
        {...props}
      />
    );

    if (!label && !error && !helperText) return textareaElement;

    return (
      <FormGroup label={label} error={error} helperText={helperText} required={required}>
        {textareaElement}
      </FormGroup>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';
