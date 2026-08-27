import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export interface KpiCardProps {
  title: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  variant?: 'default' | 'blue' | 'emerald' | 'amber' | 'orange' | 'red';
  subtitle?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  onClick?: () => void;
  className?: string;
}

const iconBackgrounds = {
  default: 'bg-content-dim/10 text-content-dim',
  blue: 'bg-tech/15 text-tech',
  emerald: 'bg-status-paid/15 text-status-paid',
  amber: 'bg-status-pending/15 text-status-pending',
  orange: 'bg-status-warning/15 text-status-warning',
  red: 'bg-status-late/15 text-status-late'
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon: Icon,
  variant = 'default',
  subtitle,
  trend,
  onClick,
  className = ''
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-card border border-border rounded-lg p-4 md:p-5 shadow-sm flex flex-col justify-between gap-3 relative overflow-hidden transition-all hover:shadow-md hover:border-border-strong group} 
        ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Background Watermark Icon */}
      {Icon && (
        <Icon
          size={56}
          className="absolute top-3 right-3 text-content-dim opacity-[0.07] group-hover:opacity-[0.16] group-hover:scale-105 transition-all pointer-events-none"
        />
      )}

      {/* Header with Title & Icon */}
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconBackgrounds[variant]}`}>
            <Icon size={18} />
          </div>
        )}
        <span className="font-body text-fluid-mono font-bold uppercase tracking-wider text-content-muted">
          {title}
        </span>
      </div>

      {/* Main KPI Value */}
      <div className="flex flex-col">
        <div className="font-headline text-fluid-kpi font-extrabold text-content-main tabular-nums leading-none tracking-tight">
          {value}
        </div>

        {/* Trend Indicator */}
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`inline-flex items-center gap-0.5 text-[11px] font-bold text-white px-2 py-0.5 rounded-full ${
                trend.isPositive ? 'bg-status-paid' : 'bg-status-late'
              }`}
            >
              {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend.value}
            </span>
            {trend.label && (
              <span className="font-body text-fluid-caption text-content-dim">
                {trend.label}
              </span>
            )}
          </div>
        )}

        {/* Custom Subtitle / Action */}
        {subtitle && !trend && (
          <div className="font-body text-fluid-caption text-content-dim mt-1.5">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
