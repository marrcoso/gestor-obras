import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  className = '',
  style
}) => {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        minWidth: '220px',
        ...style
      }}
    >
      <Search
        size={16}
        color="var(--text-dim)"
        style={{
          position: 'absolute',
          left: '12px',
          pointerEvents: 'none'
        }}
      />
      <input
        type="text"
        className="form-input-constructo"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          paddingLeft: '36px',
          paddingRight: value ? '34px' : '14px',
          height: '38px',
          minHeight: '38px',
          fontSize: '13px'
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: '10px',
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Limpar busca"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
