import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface TactileActionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  variant: 'orange' | 'blue';
  onClick: () => void;
}

export const TactileActionCard: React.FC<TactileActionCardProps> = ({
  icon: Icon,
  title,
  subtitle,
  variant,
  onClick
}) => {
  const bg = variant === 'orange'
    ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
    : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';

  return (
    <button
      onClick={onClick}
      className="btn-tactile-field"
      style={{
        background: bg,
        width: '100%'
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Icon size={28} color="#ffffff" />
      </div>
      <div>
        <span style={{ fontSize: '18px', fontWeight: 800, display: 'block' }}>
          {title}
        </span>
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.85)' }}>
          {subtitle}
        </span>
      </div>
    </button>
  );
};
