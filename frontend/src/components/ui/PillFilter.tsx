import React from 'react';

export interface PillItem {
  key: string;
  label: string;
  count?: number;
}

export interface PillFilterProps {
  items: PillItem[];
  selectedKey: string;
  onSelect: (key: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const PillFilter: React.FC<PillFilterProps> = ({
  items,
  selectedKey,
  onSelect,
  className = '',
  style
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        ...style
      }}
    >
      {items.map((item) => {
        const isActive = selectedKey === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.key)}
            className={`pill-filter ${isActive ? 'active' : ''}`}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                style={{
                  marginLeft: '6px',
                  opacity: isActive ? 0.9 : 0.6,
                  fontSize: '10px'
                }}
              >
                ({item.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
