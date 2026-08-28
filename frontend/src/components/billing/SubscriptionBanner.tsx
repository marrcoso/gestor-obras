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
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold shadow-md flex flex-wrap items-center justify-between gap-2.5 animate-fadeIn sticky top-0 z-40">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={13} className="text-white" />
          </div>
          <span className="text-[11px] sm:text-xs leading-tight">
            {is_past_due
              ? 'Sua mensalidade está em aberto. Regularize seu pagamento para evitar bloqueios.'
              : 'Seu período de acesso expirou. Faça uma assinatura para continuar gerenciando suas obras.'}
          </span>
        </div>

        <button
          onClick={() => navigate('/planos')}
          className="px-2.5 sm:px-3 py-1 bg-white text-rose-700 hover:bg-rose-50 rounded-lg font-bold text-[10px] sm:text-[11px] uppercase tracking-wider transition-all flex items-center gap-1 flex-shrink-0 shadow-sm cursor-pointer active:scale-95 ml-auto"
        >
          <Sparkles size={12} />
          <span>Ativar Plano</span>
          <ChevronRight size={12} />
        </button>
      </div>
    );
  }

  // Banner de Trial (Período de Testes)
  if (is_trial) {
    return (
      <div className="bg-gradient-to-r from-[#0369a1] via-[#0284c7] to-[#0ea5e9] text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-medium shadow-sm flex flex-wrap items-center justify-between gap-2 sticky top-0 z-40 border-b border-sky-400/30">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-white">
            <Clock size={13} />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] sm:text-xs leading-tight">
            <span className="font-bold">Período de Testes:</span>
            <span>
              Restam <strong>{formatDaysRemaining(dias_restantes)}</strong> de avaliação do Plano Starter.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          <button
            onClick={() => navigate('/planos')}
            className="px-2.5 sm:px-3 py-1 bg-white text-sky-800 hover:bg-sky-50 rounded-md font-bold text-[10px] sm:text-[11px] uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm cursor-pointer active:scale-95"
          >
            <Crown size={12} className="text-amber-500" />
            <span>Assinar c/ 20% OFF</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-white/70 hover:text-white rounded transition-colors cursor-pointer"
            title="Fechar aviso temporariamente"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
