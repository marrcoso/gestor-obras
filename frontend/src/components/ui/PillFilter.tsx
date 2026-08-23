import React from 'react';

export interface PillFilterItem {
  key: string;
  label: string;
  count?: number;
}

export interface PillFilterProps {
  items: PillFilterItem[];
  selectedKey: string;
  onSelect: (key: string) => void;
  className?: string;
}

export const PillFilter: React.FC<PillFilterProps> = ({
  items,
  selectedKey,
  onSelect,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-1 ${className}`}>
      {items.map((item) => {
        const isActive = selectedKey === item.key;

        return (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`px-3.5 py-1.5 rounded-full font-body text-fluid-mono font-bold tracking-wide uppercase transition-all cursor-pointer whitespace-nowrap text-xs border ${
              isActive
                ? 'bg-sidebar text-white border-sidebar dark:bg-tech dark:border-tech shadow-xs'
                : 'bg-surface-low text-content-main border-border hover:bg-surface-container hover:border-border-strong'
            }`}
          >
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                isActive ? 'bg-white/20 text-white' : 'bg-surface-high text-content-muted'
              }`}>
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
