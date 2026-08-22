import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { HardHat, Building2, Wifi, WifiOff, RefreshCw, LogOut, Smartphone, Monitor, Sun, Moon } from 'lucide-react';
import { offlineQueue } from '../services/offlineQueue.js';
import { api } from '../services/api.js';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, tenant, obras, selectedObra, setSelectedObra, refreshObras, logout } = useAuth();
  const [syncing, setSyncing] = React.useState(false);
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
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              backgroundColor: 'var(--primary)',
              padding: '8px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
          >
            <HardHat size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 'var(--text-md)', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>ERP LEVE DE OBRAS</h1>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{tenant?.nome_fantasia || 'Construtora'}</p>
          </div>
        </div>

        {/* Seletor de Obra Ativa */}
        {obras.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
            <Building2 size={16} color="var(--text-muted)" />
            <select
              className="form-select"
              style={{
                padding: '6px 12px',
                fontSize: 'var(--text-sm)',
                width: 'auto',
                maxWidth: '260px',
                borderRadius: '8px',
                borderColor: 'var(--border)'
              }}
              value={selectedObra?.id || ''}
              onChange={(e) => {
                const found = obras.find((o) => o.id === e.target.value);
                if (found) setSelectedObra(found);
              }}
            >
              {obras.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  🏗️ {obra.nome}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Toggle de Modo: Campo (Mobile) vs Gestão (Web) */}
        <div
          style={{
            backgroundColor: 'var(--bg-input)',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            display: 'flex',
            gap: '4px'
          }}
        >
          <button
            onClick={() => navigate('/campo')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: isField ? 'var(--primary)' : 'transparent',
              color: isField ? '#fff' : 'var(--text-muted)'
            }}
          >
            <Smartphone size={14} />
            Canteiro (Campo)
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: !isField ? 'var(--primary)' : 'transparent',
              color: !isField ? '#fff' : 'var(--text-muted)'
            }}
          >
            <Monitor size={14} />
            Gestão (Web)
          </button>
        </div>

        {/* Alternador de Tema Claro / Escuro */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary"
          style={{
            padding: '8px',
            borderRadius: '8px',
            color: theme === 'dark' ? '#f59e0b' : '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={theme === 'dark' ? 'Alternar para Tema Claro' : 'Alternar para Tema Escuro'}
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Perfil & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid var(--border)', paddingLeft: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.1 }}>{user?.nome}</p>
            <span
              style={{
                fontSize: 'var(--text-2xs)',
                fontWeight: 700,
                color: user?.perfil === 'ADMIN' ? 'var(--warning)' : 'var(--primary)'
              }}
            >
              {user?.perfil === 'ADMIN' ? '👑 GESTOR / ENG.' : '👷 MESTRE DE OBRAS'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ padding: '8px', borderRadius: '8px', color: 'var(--text-muted)' }}
            title="Sair da Conta"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
