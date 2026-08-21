import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  DollarSign,
  AlertTriangle,
  FileSpreadsheet,
  Camera,
  Smartphone,
  PlusCircle
} from 'lucide-react';

interface SidebarProps {
  openNewObraModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ openNewObraModal }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', label: 'Painel Executivo', icon: LayoutDashboard },
    { path: '/fluxo', label: 'Fluxo de Caixa / Obra', icon: DollarSign },
    { path: '/inadimplencia', label: 'Radar de Inadimplência', icon: AlertTriangle, badge: 'Crítico' },
    { path: '/sinapi', label: 'Orçador SINAPI', icon: FileSpreadsheet },
    { path: '/diario', label: 'Diário de Fotos', icon: Camera },
    { path: '/campo', label: 'App do Canteiro (Mobile)', icon: Smartphone, highlight: true }
  ];

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        padding: '20px 12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <p
          style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
            color: 'var(--text-dim)',
            padding: '0 12px 8px 12px'
          }}
        >
          Menu Principal
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === '/campo' && location.pathname === '/field');

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13.5px',
                fontWeight: isActive ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                backgroundColor: isActive
                  ? 'var(--primary)'
                  : item.highlight
                  ? 'rgba(37, 99, 235, 0.08)'
                  : 'transparent',
                color: isActive ? '#fff' : item.highlight ? '#60a5fa' : 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} color={isActive ? '#fff' : item.highlight ? '#3b82f6' : 'var(--text-muted)'} />
                <span>{item.label}</span>
              </div>

              {item.badge && !isActive && (
                <span className="badge badge-danger" style={{ fontSize: '9px', padding: '2px 6px' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div>
        <button
          onClick={openNewObraModal}
          className="btn btn-primary"
          style={{ width: '100%', padding: '10px', fontSize: '13px', gap: '6px' }}
        >
          <PlusCircle size={16} />
          Nova Obra (Centro de Custo)
        </button>
      </div>
    </aside>
  );
};
