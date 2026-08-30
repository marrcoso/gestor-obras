import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { DeviceSession, deviceSessionService } from '../../services/deviceSession.js';
import { Button } from '../ui/Button.js';
import {
  Smartphone,
  ShieldCheck,
  HardHat,
  ArrowRight,
  UserCheck,
  AlertCircle,
  LogOut,
  Building
} from 'lucide-react';

interface DeviceQuickLoginCardProps {
  session: DeviceSession;
  onUseAnotherAccount: () => void;
}

export const DeviceQuickLoginCard: React.FC<DeviceQuickLoginCardProps> = ({
  session,
  onUseAnotherAccount
}) => {
  const navigate = useNavigate();
  const { quickResumeSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pega as iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleContinue = async () => {
    setLoading(true);
    setError('');
    try {
      await quickResumeSession(session);
      navigate(session.perfil === 'MESTRE_OBRA' ? '/campo' : '/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Sua sessão expirou. Por favor, acesse com sua senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleForget = () => {
    deviceSessionService.clearSession();
    onUseAnotherAccount();
  };

  const isMestre = session.perfil === 'MESTRE_OBRA';

  return (
    <div className="flex flex-col gap-5">
      {/* Header do Card de Dispositivo Reconhecido */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tech/10 text-tech border border-tech/20 text-[11px] font-bold uppercase tracking-wider mb-2.5 shadow-xs">
          <Smartphone size={13} className="text-tech animate-pulse" />
          <span>Dispositivo Reconhecido • Acesso Rápido</span>
        </div>

        <h2 className="font-headline text-fluid-section font-bold text-content-main tracking-tight">
          Bem-vindo de volta!
        </h2>
        <p className="font-body text-fluid-caption text-content-muted mt-0.5">
          Identificamos sua última sessão salva neste aparelho.
        </p>
      </div>

      {/* Alerta de Erro / Sessão Expirada */}
      {error && (
        <div className="flex items-start gap-2.5 bg-status-late-bg text-status-late border border-status-late/30 p-3 rounded-lg text-xs font-medium animate-modal-in">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{error}</p>
            <button
              type="button"
              onClick={onUseAnotherAccount}
              className="text-xs font-bold underline mt-1 block hover:opacity-80 cursor-pointer"
            >
              Digitar senha para entrar
            </button>
          </div>
        </div>
      )}

      {/* Cartão de Perfil do Usuário */}
      <div className="p-4 bg-surface-low border border-border rounded-xl flex items-center gap-3.5 shadow-xs">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center font-headline font-bold text-base shadow-xs flex-shrink-0 ${
            isMestre ? 'bg-tech text-white' : 'bg-brand text-white'
          }`}
        >
          {getInitials(session.nome) || <HardHat size={22} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-headline text-sm font-bold text-content-main truncate">
              {session.nome}
            </h3>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isMestre
                  ? 'bg-tech/15 text-tech'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              }`}
            >
              {isMestre ? 'Canteiro' : 'Gestor'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-content-muted truncate mt-0.5">
            <Building size={12} className="text-content-dim flex-shrink-0" />
            <span className="truncate">{session.nomeConstrutora}</span>
          </div>

          <p className="text-[11px] text-content-dim truncate mt-0.5">{session.email}</p>
        </div>
      </div>

      {/* Botão de 1 Toque para Entrar */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={loading}
        onClick={handleContinue}
        icon={ArrowRight}
        className="shadow-primary"
      >
        Continuar como {session.nome.split(' ')[0]}
      </Button>

      {/* Ações Secundárias */}
      <div className="flex items-center justify-between pt-2 border-t border-border-light text-xs">
        <button
          type="button"
          onClick={onUseAnotherAccount}
          className="text-tech hover:underline font-semibold flex items-center gap-1 cursor-pointer"
        >
          <UserCheck size={14} />
          Entrar com outra conta
        </button>

        <button
          type="button"
          onClick={handleForget}
          className="text-content-dim hover:text-status-late font-medium flex items-center gap-1 transition-colors cursor-pointer"
          title="Remove os dados salvos deste aparelho"
        >
          <LogOut size={13} />
          Esquecer aparelho
        </button>
      </div>
    </div>
  );
};
