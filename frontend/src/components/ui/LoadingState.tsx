import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  minHeight?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Carregando dados...',
  minHeight = '240px',
  className = ''
}) => {
  return (
    <div
      className={`card-constructo ${className}`}
      style={{
        minHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: 'var(--text-dim)'
      }}
    >
      <Loader2 size={32} className="animate-spin" color="var(--primary)" />
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
        {message}
      </span>
    </div>
  );
};
