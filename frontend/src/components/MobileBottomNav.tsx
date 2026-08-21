import React from 'react';
import { Smartphone, DollarSign, Camera, AlertTriangle, LayoutDashboard } from 'lucide-react';

interface MobileBottomNavProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentView, setCurrentView }) => {
  const tabs = [
    { id: 'field', label: 'Canteiro', icon: Smartphone },
    { id: 'fluxo', label: 'Caixa', icon: DollarSign },
    { id: 'diario', label: 'Fotos', icon: Camera },
    { id: 'inadimplencia', label: 'Cobrança', icon: AlertTriangle },
    { id: 'dashboard', label: 'Gestão', icon: LayoutDashboard }
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '8px 4px',
        zIndex: 50
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              color: isActive ? 'var(--primary)' : 'var(--text-dim)',
              fontSize: '11px',
              fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
              flex: 1,
              padding: '4px 0'
            }}
          >
            <Icon size={20} color={isActive ? 'var(--primary)' : 'var(--text-dim)'} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
