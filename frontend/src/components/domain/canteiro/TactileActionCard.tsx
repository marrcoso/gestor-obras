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
  const bgClass = variant === 'orange'
    ? 'bg-gradient-to-br from-orange-500 to-orange-700 shadow-primary'
    : 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-md';

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-5 rounded-xl text-white text-left transition-all active:scale-[0.98] cursor-pointer border-2 border-white/20 ${bgClass}`}
    >
      <div className="w-13 h-13 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        <Icon size={28} className="text-white" />
      </div>
      <div>
        <span className="font-headline text-base md:text-lg font-extrabold block leading-tight">
          {title}
        </span>
        <span className="text-xs font-medium text-white/85 block mt-0.5">
          {subtitle}
        </span>
      </div>
    </button>
  );
};
