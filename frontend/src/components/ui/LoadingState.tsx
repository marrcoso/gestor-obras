import React from 'react';

export interface LoadingStateProps {
  message?: string;
  minHeight?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Carregando...',
  minHeight = '240px',
  className = ''
}) => {
  return (
    <div
      style={{ minHeight }}
      className={`flex flex-col items-center justify-center gap-3 p-6 text-center text-content-muted ${className}`}
    >
      <div className="w-8 h-8 border-3 border-tech/30 border-t-tech rounded-full animate-spin" />
      <span className="font-body text-xs md:text-sm font-medium text-content-dim">
        {message}
      </span>
    </div>
  );
};
