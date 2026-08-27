import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { NotificationDropdown } from './notifications/NotificationDropdown.js';
import {
  Building2,
  HardHat,
  Bell,
  Sun,
  Moon,
  LogOut,
  Smartphone,
  Monitor,
  RefreshCw,
  ChevronDown,
  Plus,
  User as UserIcon
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
  const { user, obras, selectedObra, setSelectedObra, refreshObras, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [syncing, setSyncing] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const pendingCount = offlineQueue.count();

  const isField = location.pathname === '/campo' || location.pathname === '/field';

  // Fecha dropdown de notificações ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifOpen]);

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
    <header className="h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 bg-navbar/95 backdrop-blur-md border-b border-border shadow-xs">
      {/* Left: Obra Selector & Quick New Obra CTA */}
      <div className="flex items-center gap-3">
        {/* Mobile Brand Logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-[34px] h-[34px] bg-brand rounded-md flex items-center justify-center text-white">
            <HardHat size={20} />
          </div>
        </div>

        {/* Obra Active Selector Pill */}
        {obras.length > 0 ? (
          <div className="flex items-center gap-2 bg-surface-low px-3 py-1.5 rounded-md border border-border">
            <Building2 size={16} className="text-tech" />
            <select
              className="bg-transparent border-none text-content-main text-xs md:text-sm font-semibold cursor-pointer outline-none max-w-[160px] sm:max-w-[220px] appearance-none truncate"
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
            <ChevronDown size={14} className="text-content-dim" />
          </div>
        ) : (
          <span className="text-xs md:text-sm font-semibold text-content-muted">
            Nenhuma obra cadastrada
          </span>
        )}

        {/* Nova Obra CTA Button */}
        {openNewObraModal && (
          <button
            onClick={openNewObraModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand hover:bg-brand-hover text-white text-[11px] font-bold tracking-wider uppercase shadow-primary transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={14} />
            NOVA OBRA
          </button>
        )}
      </div>

      {/* Right: Actions, Sync, Theme, Notifications & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Toggle Mode: Desktop Gestão vs Mobile Canteiro */}
        <div className="flex bg-surface-low p-0.5 rounded-md border border-border gap-0.5">
          <button
            onClick={() => navigate('/campo')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
              isField ? 'bg-brand text-white shadow-xs' : 'text-content-muted hover:text-content-main'
            }`}
          >
            <Smartphone size={13} />
            <span className="hidden sm:inline">Canteiro</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
              !isField ? 'bg-tech text-white shadow-xs' : 'text-content-muted hover:text-content-main'
            }`}
          >
            <Monitor size={13} />
            <span className="hidden sm:inline">Gestão</span>
          </button>
        </div>

        {/* Offline Sync */}
        {pendingCount > 0 && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 bg-status-pending-bg text-status-pending border border-status-pending rounded-md px-2.5 py-1 text-xs font-bold transition-transform active:scale-95 cursor-pointer"
            title="Sincronizar fila offline"
          >
            <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            <span>{pendingCount}</span>
          </button>
        )}

        {/* Dark / Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-content-muted hover:text-content-main hover:bg-surface-low transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Alternar para Tema Claro' : 'Alternar para Tema Escuro'}
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
        </button>

        {/* Notifications Icon with Badge & Popover */}
        <div className="relative flex items-center" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`p-1.5 rounded-md transition-colors relative cursor-pointer ${
              isNotifOpen
                ? 'bg-brand/15 text-brand'
                : 'text-content-muted hover:text-content-main hover:bg-surface-low'
            }`}
            title="Central de Notificações"
            aria-label="Notificações"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-brand text-white text-[10px] font-extrabold flex items-center justify-center rounded-full px-1 shadow-sm animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && <NotificationDropdown onClose={() => setIsNotifOpen(false)} />}
        </div>

        {/* Logout Action */}
        <div className="border-l border-border pl-1.5">
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md text-content-dim hover:text-status-late hover:bg-status-late/10 transition-colors cursor-pointer"
            title="Sair do sistema"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
};
