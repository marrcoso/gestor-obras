import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = '',
  style
}) => {
  return (
    <div
      className={`card-constructo ${className}`}
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        backgroundColor: 'var(--bg-card)',
        ...style
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-surface-low)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-dim)'
        }}
      >
        <Icon size={26} />
      </div>

      <div style={{ maxWidth: '420px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
          {title}
        </h4>
        {description && (
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.4' }}>
            {description}
          </p>
        )}
      </div>

      {action && <div style={{ marginTop: '8px' }}>{action}</div>}
    </div>
  );
};
