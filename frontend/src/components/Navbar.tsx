import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { HardHat, Building2, Wifi, WifiOff, RefreshCw, LogOut, Smartphone, Monitor } from 'lucide-react';
import { offlineQueue } from '../services/offlineQueue.js';
import { api } from '../services/api.js';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const { user, tenant, obras, selectedObra, setSelectedObra, isOnline, refreshObras, logout } = useAuth();
  const [syncing, setSyncing] = React.useState(false);
  const pendingCount = offlineQueue.count();

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
            <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>ERP LEVE DE OBRAS</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tenant?.nome_fantasia || 'Construtora'}</p>
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
                fontSize: '13px',
                width: 'auto',
                maxWidth: '260px',
                borderRadius: '8px',
                borderColor: 'var(--border-light)'
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
            border: '1px solid var(--border-light)',
            display: 'flex',
            gap: '4px'
          }}
        >
          <button
            onClick={() => setCurrentView('field')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: currentView === 'field' ? 'var(--primary)' : 'transparent',
              color: currentView === 'field' ? '#fff' : 'var(--text-muted)'
            }}
          >
            <Smartphone size={14} />
            Canteiro (Campo)
          </button>

          <button
            onClick={() => setCurrentView('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: currentView !== 'field' ? 'var(--primary)' : 'transparent',
              color: currentView !== 'field' ? '#fff' : 'var(--text-muted)'
            }}
          >
            <Monitor size={14} />
            Gestão (Web)
          </button>
        </div>

        {/* Indicador Online / Offline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isOnline ? (
            <span className="badge badge-success" style={{ fontSize: '11px', padding: '4px 8px' }}>
              <Wifi size={12} /> Online
            </span>
          ) : (
            <span className="badge badge-danger" style={{ fontSize: '11px', padding: '4px 8px' }}>
              <WifiOff size={12} /> Offline
            </span>
          )}

          {pendingCount > 0 && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '11px', gap: '4px' }}
              title="Sincronizar lançamentos locais com o servidor"
            >
              <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
              {pendingCount} pendente(s)
            </button>
          )}
        </div>

        {/* Perfil & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid var(--border)', paddingLeft: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', lineHeight: 1.1 }}>{user?.nome}</p>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: user?.perfil === 'ADMIN' ? 'var(--warning)' : '#60a5fa'
              }}
            >
              {user?.perfil === 'ADMIN' ? '👑 GESTOR / ENG.' : '👷 MESTRE DE OBRAS'}
            </span>
          </div>

          <button
            onClick={logout}
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
