import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext.js';
import {
  AlertTriangle,
  DollarSign,
  Camera,
  Calendar,
  Info,
  CheckCircle2,
  X,
  Trash2
} from 'lucide-react';

interface NotificationDropdownProps {
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { notificacoes, unreadCount, markAsRead, clearAll, dismissNotification } = useNotifications();

  const handleItemClick = (id: string, linkAcao?: string) => {
    markAsRead(id);
    onClose();
    if (linkAcao) {
      navigate(linkAcao);
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'INADIMPLENCIA':
        return <AlertTriangle size={15} className="text-status-late" />;
      case 'ORCAMENTO_LIMITE':
      case 'ALERTA_FINANCEIRO':
        return <DollarSign size={15} className="text-status-warning" />;
      case 'PRAZO_OBRA':
        return <Calendar size={15} className="text-amber-500" />;
      case 'DIARIO_OBRA':
        return <Camera size={15} className="text-tech" />;
      default:
        return <Info size={15} className="text-brand" />;
    }
  };

  return (
    <div
      className="absolute right-0 top-12 w-[320px] sm:w-[360px] bg-card border border-border shadow-xl rounded-xl z-50 overflow-hidden flex flex-col max-h-[440px] animate-fade-in"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-3 border-b border-border bg-surface-low/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-headline text-xs font-bold uppercase tracking-wider text-content-main">
            Notificações
          </span>
          {unreadCount > 0 && (
            <span className="bg-brand text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        {notificacoes.length > 0 && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-content-muted hover:text-status-late p-1 rounded hover:bg-surface-low transition-colors cursor-pointer"
            title="Limpar todas as notificações"
          >
            <Trash2 size={12} />
            <span>Limpar</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/50">
        {notificacoes.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-content-dim">
            <CheckCircle2 size={24} className="text-status-paid opacity-60" />
            <span className="text-xs font-semibold text-content-main">Tudo em dia!</span>
            <span className="text-[11px] text-content-muted">Nenhum alerta pendente no momento.</span>
          </div>
        ) : (
          notificacoes.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item.id, item.link_acao)}
              className={`p-3 flex items-start gap-2.5 transition-colors cursor-pointer hover:bg-surface-low relative group ${
                !item.lida ? 'bg-brand/5' : ''
              }`}
            >
              {/* Unread indicator dot */}
              {!item.lida && (
                <div className="absolute left-1 top-4 w-1.5 h-1.5 rounded-full bg-brand" />
              )}

              <div className="p-1.5 rounded-md bg-surface-low border border-border flex-shrink-0 mt-0.5">
                {getIcon(item.tipo)}
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-xs truncate ${!item.lida ? 'font-bold text-content-main' : 'font-semibold text-content-muted'}`}>
                    {item.titulo}
                  </span>
                </div>

                <p className="text-[11px] text-content-muted mt-0.5 line-clamp-2 leading-snug">
                  {item.mensagem}
                </p>

                {item.prioridade === 'URGENTE' && (
                  <span className="inline-block mt-1 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-status-late/15 text-status-late border border-status-late/25">
                    Urgente
                  </span>
                )}
              </div>

              {/* Dismiss Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissNotification(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-content-dim hover:text-content-main rounded transition-opacity cursor-pointer absolute top-2.5 right-2"
                title="Dispensar"
              >
                <X size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
