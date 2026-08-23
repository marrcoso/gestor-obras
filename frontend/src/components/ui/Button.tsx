import React from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tech-blue' | 'outline' | 'whatsapp' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      isLoading = false,
      fullWidth = false,
      className = '',
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const variantClassMap = {
      primary: 'btn-primary-orange',
      secondary: 'btn-secondary-slate',
      'tech-blue': 'btn-tech-blue',
      outline: 'btn-outline-slate',
      whatsapp: 'btn-whatsapp',
      danger: 'btn-danger',
      ghost: 'btn-ghost'
    };

    const sizeStyleMap = {
      sm: { padding: '6px 12px', fontSize: '11px', minHeight: '32px' },
      md: { padding: '8px 16px', fontSize: '13px', minHeight: '40px' },
      lg: { padding: '12px 20px', fontSize: '15px', minHeight: '48px' }
    };

    const dangerStyle: React.CSSProperties =
      variant === 'danger'
        ? {
            backgroundColor: 'var(--status-late)',
            color: '#ffffff'
          }
        : {};

    const ghostStyle: React.CSSProperties =
      variant === 'ghost'
        ? {
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--text-muted)'
          }
        : {};

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`btn-constructo ${variantClassMap[variant]} ${className}`}
        style={{
          ...sizeStyleMap[size],
          ...dangerStyle,
          ...ghostStyle,
          width: fullWidth ? '100%' : undefined,
          opacity: disabled || isLoading ? 0.6 : 1,
          cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
          ...style
        }}
        {...props}
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            {Icon && iconPosition === 'left' && <Icon size={16} />}
            {children}
            {Icon && iconPosition === 'right' && <Icon size={16} />}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
