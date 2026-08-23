import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface KpiCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  icon: LucideIcon;
  variant?: 'default' | 'emerald' | 'orange' | 'red' | 'amber' | 'blue' | 'navy';
  watermark?: boolean;
  onClick?: () => void;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  watermark = true,
  onClick,
  trend,
  action,
  className = '',
  style
}) => {
  const accentClassMap = {
    default: '',
    emerald: 'accent-emerald',
    orange: 'accent-orange',
    red: 'accent-red',
    amber: 'accent-amber',
    blue: 'accent-blue',
    navy: 'card-navy'
  };

  const iconBgMap = {
    default: 'rgba(59, 130, 246, 0.12)',
    emerald: 'rgba(16, 185, 129, 0.12)',
    orange: 'rgba(249, 115, 22, 0.12)',
    red: 'rgba(239, 68, 68, 0.12)',
    amber: 'rgba(245, 158, 11, 0.12)',
    blue: 'rgba(59, 130, 246, 0.12)',
    navy: 'rgba(255, 255, 255, 0.12)'
  };

  const iconColorMap = {
    default: 'var(--technical-blue)',
    emerald: 'var(--status-paid)',
    orange: 'var(--primary)',
    red: 'var(--status-late)',
    amber: 'var(--status-pending)',
    blue: 'var(--technical-blue)',
    navy: '#38bdf8'
  };

  const isNavy = variant === 'navy';

  return (
    <div
      className={`stat-kpi-card group ${accentClassMap[variant]} ${className}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
    >
      {watermark && <Icon className="kpi-watermark-icon" color={iconColorMap[variant]} />}

      <div>
        {/* Top bar: Icon + Title + Action */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: iconBgMap[variant],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: iconColorMap[variant],
                flexShrink: 0
              }}
            >
              <Icon size={18} />
            </div>
            <span
              className="text-mono-tag"
              style={{
                color: isNavy ? 'rgba(255, 255, 255, 0.75)' : 'var(--text-muted)'
              }}
            >
              {title}
            </span>
          </div>

          {action}
        </div>

        {/* Value */}
        <div style={{ marginTop: '4px' }}>
          {typeof value === 'string' || typeof value === 'number' ? (
            <p
              className="text-kpi-value"
              style={{
                color: isNavy ? '#ffffff' : 'var(--text-main)'
              }}
            >
              {value}
            </p>
          ) : (
            value
          )}
        </div>
      </div>

      {/* Footer / Subtitle / Trend */}
      {(subtitle || trend) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            fontSize: '12px',
            color: isNavy ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-dim)',
            marginTop: '4px'
          }}
        >
          {subtitle && <div>{subtitle}</div>}

          {trend && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: trend.isPositive ? 'var(--status-paid)' : 'var(--status-late)',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              {trend.value} {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
