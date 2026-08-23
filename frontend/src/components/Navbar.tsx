import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import {
  Building2,
  HardHat,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  Smartphone,
  Monitor,
  RefreshCw,
  ChevronDown,
  Plus
} from 'lucide-react';
import { offlineQueue } from '../services/offlineQueue.js';
import { api } from '../services/api.js';

interface NavbarProps {
  openNewObraModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ openNewObraModal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, tenant, obras, selectedObra, setSelectedObra, refreshObras, logout } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const pendingCount = offlineQueue.count();

  const isField = location.pathname === '/campo' || location.pathname === '/field';

  const handleSync = async () => {
    setSyncing(true);
    try {
      const count = await api.flushOfflineQueue();
      await refreshObras();
      if (count > 0) alert(`Sincronizados ${count} itens com sucesso!`);
      else alert('Todas as ações já estão sincronizadas com o servidor.');
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        height: '64px',
        padding: '0 clamp(16px, 2vw, 24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-xs)'
      }}
      className="navbar-constructo"
    >
      {/* Left: Obra Selector & Quick New Obra CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Mobile Brand Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          className="mobile-brand-icon"
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              backgroundColor: 'var(--primary)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}
          >
            <HardHat size={20} />
          </div>
        </div>

        {/* Obra Active Selector Pill */}
        {obras.length > 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-surface-low)',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border)'
            }}
          >
            <Building2 size={16} color="var(--technical-blue)" />
            <select
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                maxWidth: '220px'
              }}
              value={selectedObra?.id || ''}
              onChange={(e) => {
                const found = obras.find((o) => o.id === e.target.value);
                if (found) setSelectedObra(found);
              }}
            >
              {obras.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  {obra.nome}
                </option>
              ))}
            </select>
            <ChevronDown size={14} color="var(--text-dim)" />
          </div>
        ) : (
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
            Nenhuma obra cadastrada
          </span>
        )}

        {/* Nova Obra CTA Button */}
        {openNewObraModal && (
          <button
            onClick={openNewObraModal}
            className="btn-constructo btn-primary-orange"
            style={{ padding: '6px 12px', minHeight: '34px', fontSize: '11px', gap: '6px' }}
          >
            <Plus size={14} />
            NOVA OBRA
          </button>
        )}
      </div>

      {/* Right: Actions, Sync, Theme, Notifications & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Toggle Mode: Desktop Gestão vs Mobile Canteiro */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface-low)',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            gap: '2px'
          }}
        >
          <button
            onClick={() => navigate('/campo')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: isField ? 'var(--primary)' : 'transparent',
              color: isField ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            <Smartphone size={13} />
            Canteiro
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: !isField ? 'var(--technical-blue)' : 'transparent',
              color: !isField ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            <Monitor size={13} />
            Gestão
          </button>
        </div>

        {/* Offline Sync */}
        {pendingCount > 0 && (
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--status-pending-bg)',
              color: 'var(--status-pending)',
              border: '1px solid var(--status-pending)',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Sincronizar fila offline"
          >
            <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            <span>{pendingCount}</span>
          </button>
        )}

        {/* Dark / Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={theme === 'dark' ? 'Alternar para Tema Claro' : 'Alternar para Tema Escuro'}
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} />}
        </button>

        {/* Notifications Icon with Badge */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <button
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Notificações"
          >
            <Bell size={18} />
          </button>
          <div
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--status-late)',
              borderRadius: '50%'
            }}
          />
        </div>

        {/* Logout Action */}
        <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '10px' }}>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Sair do sistema"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
};

