import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Clock, AlertTriangle, Sparkles, X, ChevronRight, Crown } from 'lucide-react';
import { formatDaysRemaining } from '../../utils/formatters.js';

export const SubscriptionBanner: React.FC = () => {
  const { billingOverview } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (!billingOverview || dismissed) {
    return null;
  }

  const { subscription } = billingOverview;
  const { is_trial, is_expired, is_past_due, is_canceled, dias_restantes = 0 } = subscription;

  // Se a assinatura estiver ativa e não for trial, não exibe banner
  if (subscription.status === 'ACTIVE' && !is_trial) {
    return null;
  }

  // Banner de Expirado ou Cancelado
  if (is_expired || is_canceled || is_past_due) {
    return (
      <div className="w-full flex-shrink-0 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold shadow-md border-b border-rose-400/30 animate-fadeIn z-40">
        <div className="w-full flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Side: Icon + Texts */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 shadow-xs">
              <AlertTriangle size={13} className="text-white" />
            </div>

            {/* Mobile View (< sm) */}
            <div className="flex items-center gap-1.5 min-w-0 sm:hidden text-[11px] leading-tight truncate">
              <span className="font-bold bg-white/20 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide flex-shrink-0">
                {is_past_due ? 'Pendente' : 'Expirado'}
              </span>
              <span className="truncate">
                {is_past_due ? 'Mensalidade em aberto' : 'Acesso expirado'}
              </span>
            </div>

            {/* Desktop View (>= sm) */}
            <div className="hidden sm:block text-xs leading-normal">
              <span>
                {is_past_due
                  ? 'Sua mensalidade está em aberto. Regularize seu pagamento para evitar bloqueios.'
                  : 'Seu período de acesso expirou. Faça uma assinatura para continuar gerenciando suas obras.'}
              </span>
            </div>
          </div>

          {/* Right Side: CTA Button */}
          <button
            onClick={() => navigate('/planos')}
            className="px-2.5 sm:px-3 py-1 bg-white text-rose-700 hover:bg-rose-50 rounded-lg font-bold text-[10px] sm:text-[11px] uppercase tracking-wider transition-all flex items-center gap-1 flex-shrink-0 shadow-sm cursor-pointer active:scale-95"
          >
            <Sparkles size={12} className="flex-shrink-0" />
            <span className="sm:hidden">{is_past_due ? 'Pagar' : 'Ativar'}</span>
            <span className="hidden sm:inline">{is_past_due ? 'Regularizar Assinatura' : 'Ativar Plano'}</span>
            <ChevronRight size={12} className="hidden sm:inline flex-shrink-0" />
          </button>
        </div>
      </div>
    );
  }

  // Banner de Trial (Período de Testes do Plano Starter)
  if (is_trial) {
    return (
      <div className="w-full flex-shrink-0 bg-gradient-to-r from-[#0369a1] via-[#0284c7] to-[#0ea5e9] text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-medium shadow-sm border-b border-sky-400/30 animate-fadeIn z-40">
        <div className="w-full flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Side: Icon + Texts */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-white shadow-xs">
              <Clock size={13} />
            </div>

            {/* Mobile View (< sm): Compact & single-line safe */}
            <div className="flex items-center gap-1.5 min-w-0 sm:hidden text-[11px] leading-tight">
              <span className="font-bold bg-white/20 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide flex-shrink-0">
                Starter
              </span>
              <span className="truncate">
                Restam <strong>{formatDaysRemaining(dias_restantes)}</strong>
              </span>
            </div>

            {/* Desktop View (>= sm): Full rich message */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs leading-normal">
              <span className="font-bold">Período de Testes:</span>
              <span>
                Restam <strong>{formatDaysRemaining(dias_restantes)}</strong> de avaliação do Plano Starter.
              </span>
            </div>
          </div>

          {/* Right Side: CTA Button + Dismiss Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => navigate('/planos')}
              className="px-2.5 sm:px-3 py-1 bg-white text-sky-800 hover:bg-sky-50 rounded-md font-bold text-[10px] sm:text-[11px] uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm cursor-pointer active:scale-95 flex-shrink-0"
            >
              <Crown size={12} className="text-amber-500 flex-shrink-0" />
              <span className="sm:hidden">Assinar</span>
              <span className="hidden sm:inline">Assinar c/ 20% OFF</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer flex-shrink-0"
              title="Fechar aviso temporariamente"
              aria-label="Fechar aviso"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
