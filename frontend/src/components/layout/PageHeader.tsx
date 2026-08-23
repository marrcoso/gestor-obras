import React from 'react';

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  className = ''
}) => {
  return (
    <section className={`flex flex-row flex-wrap items-end justify-between gap-4 pt-1 ${className}`}>
      <div className="flex flex-col gap-1 max-w-[720px]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="font-headline text-fluid-page font-extrabold text-content-main tracking-tight leading-tight">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <div className="font-body text-fluid-body text-content-muted leading-relaxed">
            {subtitle}
          </div>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 flex-wrap">
          {actions}
        </div>
      )}
    </section>
  );
};
