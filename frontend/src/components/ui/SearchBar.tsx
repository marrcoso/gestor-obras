import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  onClear,
  className = '',
  style
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`} style={style}>
      <Search
        size={16}
        className="absolute left-3 text-content-dim pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-input border border-border rounded-md pl-9 pr-8 py-2 font-body text-fluid-body text-content-main w-full min-h-[38px] transition-all outline-none focus:border-tech focus:ring-2 focus:ring-tech/20 placeholder:text-content-dim/70 text-xs md:text-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          className="absolute right-2.5 p-1 text-content-dim hover:text-content-main cursor-pointer"
          aria-label="Limpar busca"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
