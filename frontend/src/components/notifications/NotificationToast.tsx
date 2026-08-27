import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext.js';
import { AlertTriangle, DollarSign, Camera, Info, X, ExternalLink } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { activeToast, clearToast, markAsRead } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        clearToast();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [activeToast, clearToast]);

  if (!activeToast) return null;

  const getIcon = () => {
    switch (activeToast.tipo) {
      case 'INADIMPLENCIA':
        return <AlertTriangle size={18} className="text-status-late" />;
      case 'ORCAMENTO_LIMITE':
      case 'ALERTA_FINANCEIRO':
        return <DollarSign size={18} className="text-status-warning" />;
      case 'DIARIO_OBRA':
        return <Camera size={18} className="text-tech" />;
      default:
        return <Info size={18} className="text-brand" />;
    }
  };

  const handleClickAction = () => {
    markAsRead(activeToast.id);
    clearToast();
    if (activeToast.link_acao) {
      navigate(activeToast.link_acao);
    }
  };

  return (
    <div className="fixed top-20 right-4 md:right-6 z-50 max-w-sm w-full animate-slide-in-right">
      <div className="bg-card border-2 border-brand/40 shadow-2xl rounded-xl p-4 flex gap-3 relative backdrop-blur-md">
        <div className="p-2 rounded-lg bg-surface-low h-fit flex-shrink-0 border border-border">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-content-main uppercase tracking-wider">
              {activeToast.titulo}
            </span>
            <button
              onClick={clearToast}
              className="text-content-dim hover:text-content-main p-1 rounded transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <p className="text-xs text-content-muted mt-1 line-clamp-2">
            {activeToast.mensagem}
          </p>

          <div className="mt-2.5 flex items-center gap-3">
            <button
              onClick={handleClickAction}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:underline cursor-pointer"
            >
              <span>Ver detalhes</span>
              <ExternalLink size={11} />
            </button>
            <button
              onClick={() => {
                markAsRead(activeToast.id);
                clearToast();
              }}
              className="text-[11px] text-content-dim hover:text-content-muted font-medium cursor-pointer"
            >
              Marcar como lida
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
