import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Smartphone, DollarSign, Camera, AlertTriangle, LayoutDashboard } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/campo', label: 'Canteiro', icon: Smartphone },
    { path: '/fluxo', label: 'Caixa', icon: DollarSign },
    { path: '/diario', label: 'Fotos', icon: Camera },
    { path: '/inadimplencia', label: 'Cobrança', icon: AlertTriangle },
    { path: '/dashboard', label: 'Gestão', icon: LayoutDashboard }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around items-center py-1.5 px-1 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] lg:hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path || (tab.path === '/campo' && location.pathname === '/field');

        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-1 bg-transparent border-none text-[11px] font-body flex-1 py-1.5 relative cursor-pointer transition-colors ${
              isActive ? 'text-brand font-bold' : 'text-content-dim font-medium hover:text-content-main'
            }`}
          >
            {isActive && (
              <div className="absolute -top-1.5 w-6 h-[3px] bg-brand rounded-full" />
            )}
            <Icon size={19} className={isActive ? 'text-brand' : 'text-content-dim'} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
