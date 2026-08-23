import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`p-8 md:p-12 text-center flex flex-col items-center justify-center gap-3 bg-surface-low/50 rounded-lg border border-dashed border-border ${className}`}>
      <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-content-dim">
        <Icon size={24} />
      </div>
      <div className="max-w-md">
        <h4 className="font-headline text-base font-bold text-content-main">
          {title}
        </h4>
        {description && (
          <p className="font-body text-fluid-body text-content-muted mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
