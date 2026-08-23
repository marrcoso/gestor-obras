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
        padding: '6px 4px 8px 4px',
        zIndex: 50,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)'
      }}
      className="mobile-bottom-nav"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path || (tab.path === '/campo' && location.pathname === '/field');

        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
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
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.01em',
              cursor: 'pointer',
              flex: 1,
              padding: '6px 0',
              position: 'relative'
            }}
          >
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: '-6px',
                  width: '24px',
                  height: '3px',
                  backgroundColor: 'var(--primary)',
                  borderRadius: '2px'
                }}
              />
            )}
            <Icon size={19} color={isActive ? 'var(--primary)' : 'var(--text-dim)'} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

