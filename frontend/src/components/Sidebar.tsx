import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  LayoutDashboard,
  DollarSign,
  AlertTriangle,
  FileSpreadsheet,
  Camera,
  Smartphone,
  Plus,
  HardHat
} from 'lucide-react';

interface SidebarProps {
  openNewObraModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ openNewObraModal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Painel Executivo', icon: LayoutDashboard, iconName: 'dashboard' },
    { path: '/fluxo', label: 'Fluxo de Caixa', icon: DollarSign, iconName: 'payments' },
    { path: '/inadimplencia', label: 'Radar de Inadimplência', icon: AlertTriangle, iconName: 'warning', badge: 'Crítico' },
    { path: '/sinapi', label: 'Orçador SINAPI', icon: FileSpreadsheet, iconName: 'calculate' },
    { path: '/diario', label: 'Diário de Fotos', icon: Camera, iconName: 'photo_camera' }
  ];

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '280px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'none',
        flexDirection: 'column',
        zIndex: 100,
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.25)'
      }}
      className="lg-sidebar"
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px 16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            backgroundColor: 'var(--primary)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.35)',
            flexShrink: 0
          }}
        >
          <HardHat size={24} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '18px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}
          >
            ERP LEVE
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#ffb690',
              textTransform: 'uppercase'
            }}
          >
            CONSTRUTORA
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          overflowY: 'auto'
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: 'rgba(255, 255, 255, 0.4)',
            textTransform: 'uppercase',
            padding: '8px 12px 4px 12px'
          }}
        >
          Módulos de Gestão
        </span>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: isActive ? 700 : 500,
                border: isActive ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.16)' : 'transparent',
                color: isActive ? '#38bdf8' : 'rgba(248, 250, 252, 0.75)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(248, 250, 252, 0.75)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} color={isActive ? '#38bdf8' : 'rgba(248, 250, 252, 0.65)'} />
                <span>{item.label}</span>
              </div>

              {item.badge && !isActive && (
                <span
                  style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-body)',
                    letterSpacing: '0.04em'
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Separator for Canteiro */}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            onClick={() => navigate('/campo')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              border: '1px solid rgba(249, 115, 22, 0.3)',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              backgroundColor: location.pathname === '/campo' || location.pathname === '/field'
                ? 'rgba(249, 115, 22, 0.2)'
                : 'rgba(249, 115, 22, 0.08)',
              color: '#fdba74',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Smartphone size={18} color="#f97316" />
              <span>App do Canteiro</span>
            </div>
            <span
              style={{
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '9px',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '4px',
                fontFamily: 'var(--font-body)',
                letterSpacing: '0.04em'
              }}
            >
              CAMPO
            </span>
          </button>
        </div>

        {/* Nova Obra Action Button */}
        <div style={{ marginTop: '12px' }}>
          <button
            onClick={openNewObraModal}
            className="btn-constructo btn-primary-orange"
            style={{ width: '100%', padding: '10px 14px', gap: '8px' }}
          >
            <Plus size={16} />
            NOVA OBRA
          </button>
        </div>
      </nav>

      {/* User Profile Card Footer */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(59, 130, 246, 0.25)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              fontWeight: 700,
              fontSize: '14px',
              flexShrink: 0
            }}
          >
            {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#ffffff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {user?.nome || 'Carlos Silva'}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.45)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {user?.perfil === 'ADMIN' ? 'Engenheiro & Dono' : 'Mestre de Obras'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

