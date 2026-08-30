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
  HardHat,
  Bell,
  Settings,
  ChevronRight,
  Crown
} from 'lucide-react';

interface SidebarProps {
  openNewObraModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ openNewObraModal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, billingOverview } = useAuth();

  const planBadge = billingOverview?.subscription.is_trial
    ? 'Trial'
    : billingOverview?.subscription.plano || 'Starter';

  const isCanteiroActive = location.pathname === '/campo' || location.pathname === '/field';

  const menuItems = [
    { path: '/dashboard', label: 'Painel Executivo', icon: LayoutDashboard },
    { path: '/fluxo', label: 'Fluxo de Caixa', icon: DollarSign },
    { path: '/inadimplencia', label: 'Radar de Inadimplência', icon: AlertTriangle, badge: 'Crítico' },
    { path: '/sinapi', label: 'Orçador SINAPI', icon: FileSpreadsheet },
    { path: '/diario', label: 'Diário de Fotos', icon: Camera },
    { path: '/planos', label: 'Planos & Assinatura', icon: Crown, badge: planBadge }
  ];

  return (
    <aside className="w-[280px] bg-sidebar border-r border-white/10 hidden lg:flex flex-col flex-shrink-0 h-full shadow-[4px_0_24px_rgba(0,0,0,0.25)] z-30">
      {/* Brand Header */}
      <div className="p-5 pb-4 flex items-center gap-3">
        <div className="w-[42px] h-[42px] bg-brand rounded-lg flex items-center justify-center text-white shadow-primary flex-shrink-0">
          <HardHat size={24} />
        </div>
        <div className="flex flex-col">
          <span className="font-headline text-lg font-extrabold text-white tracking-tight leading-tight">
            ERP LEVE
          </span>
          <span className="font-body text-[10px] font-bold tracking-widest text-[#ffb690] uppercase">
            CONSTRUTORA
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3.5 py-3 flex flex-col gap-1 overflow-y-auto">
        <span className="font-body text-[11px] font-bold tracking-wider text-white/40 uppercase px-3 py-2">
          Módulos de Gestão
        </span>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm transition-all w-full text-left cursor-pointer ${
                isActive
                  ? 'bg-[#38bdf8]/20 text-[#38bdf8] font-bold'
                  : 'text-white/75 font-medium hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-[#38bdf8]' : 'text-white/65'} />
                <span>{item.label}</span>
              </div>

              {item.badge && !isActive && (
                <span className="bg-status-late text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Separator for Canteiro */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={() => navigate('/campo')}
            className={`group flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm transition-all w-full text-left cursor-pointer ${
              isCanteiroActive
                ? 'bg-brand hover:bg-brand-hover text-white font-bold shadow-primary'
                : 'text-orange-400 font-semibold hover:bg-brand/10 hover:text-orange-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Smartphone
                size={18}
                className={`transition-colors ${
                  isCanteiroActive ? 'text-white' : 'text-orange-400 group-hover:text-orange-300'
                }`}
              />
              <span>App do Canteiro</span>
            </div>

            {!isCanteiroActive && (
              <span className="bg-brand text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider shadow-xs">
                CAMPO
              </span>
            )}
          </button>
        </div>

        {/* Nova Obra Action Button */}
        <div className="mt-3">
          <button
            onClick={openNewObraModal}
            className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-md bg-brand hover:bg-brand-hover text-white text-xs font-bold tracking-wider uppercase shadow-primary transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            NOVA OBRA
          </button>
        </div>
      </nav>

      {/* User Profile Card Footer - Clickable link to /usuario */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => navigate('/usuario')}
          className={`flex items-center justify-between p-2.5 rounded-lg transition-all w-full text-left cursor-pointer ${
            location.pathname === '/usuario' || location.pathname === '/perfil'
              ? 'bg-[#38bdf8]/20 text-white font-medium'
              : 'bg-white/5 hover:bg-white/10 text-white/80'
          }`}
          title="Ver perfil e configurações da construtora"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-tech/25 border border-tech/40 flex items-center justify-center text-[#38bdf8] font-bold text-sm flex-shrink-0">
              {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold text-white truncate">
                {user?.nome || 'Carlos Silva'}
              </span>
              <span className="text-[10px] text-white/45 truncate">
                {user?.perfil === 'ADMIN' ? 'Engenheiro & Dono' : user?.perfil === 'ENGENHEIRO' ? 'Engenheiro' : 'Mestre de Obras'}
              </span>
            </div>
          </div>
          <ChevronRight size={16} className="text-white/40 flex-shrink-0" />
        </button>
      </div>
    </aside>
  );
};
