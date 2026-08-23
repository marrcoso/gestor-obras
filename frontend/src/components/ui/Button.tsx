import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tech-blue' | 'whatsapp' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantClasses = {
  primary: 'bg-brand hover:bg-brand-hover text-white shadow-primary font-bold uppercase tracking-wider',
  secondary: 'bg-surface-low hover:bg-surface-container text-content-main border border-border hover:border-border-strong',
  'tech-blue': 'bg-tech hover:bg-tech-hover text-white shadow-sm',
  whatsapp: 'bg-[#25d366] hover:bg-[#20bd5a] text-white font-bold',
  outline: 'bg-transparent text-content-main border border-border hover:bg-surface-low hover:border-border-strong',
  danger: 'bg-status-late hover:bg-red-600 text-white shadow-sm',
  ghost: 'bg-transparent text-content-muted hover:bg-surface-low hover:text-content-main'
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs min-h-[32px] gap-1.5',
  md: 'px-4 py-2 text-sm min-h-[40px] gap-2',
  lg: 'px-5 py-3 text-base min-h-[48px] gap-2.5'
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-body font-semibold rounded-md transition-all active:scale-[0.98] whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
        </>
      )}
    </button>
  );
};
