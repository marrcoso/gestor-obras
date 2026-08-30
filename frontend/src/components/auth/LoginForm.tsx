import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { deviceSessionService, DeviceSession } from '../../services/deviceSession.js';
import { DeviceQuickLoginCard } from './DeviceQuickLoginCard.js';
import { FormInput } from '../ui/Input.js';
import { Button } from '../ui/Button.js';
import { Lock, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [savedSession, setSavedSession] = useState<DeviceSession | null>(null);
  const [showFullForm, setShowFullForm] = useState(false);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Carrega sessão salva no aparelho ao montar
  useEffect(() => {
    const session = deviceSessionService.getSession();
    if (session) {
      setSavedSession(session);
      setEmail(session.email);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      setError('Por favor, informe seu e-mail e senha.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(email, senha, rememberDevice);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  // Se houver uma sessão salva e o usuário não pediu para ver o formulário completo
  if (savedSession && !showFullForm) {
    return (
      <DeviceQuickLoginCard
        session={savedSession}
        onUseAnotherAccount={() => setShowFullForm(true)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Botão para voltar ao Card do Dispositivo Reconhecido */}
        {savedSession && showFullForm && (
          <button
            type="button"
            onClick={() => setShowFullForm(false)}
            className="inline-flex items-center gap-1.5 text-xs text-tech font-bold hover:underline mb-4 cursor-pointer"
          >
            <ArrowLeft size={14} />
            Voltar para {savedSession.nome.split(' ')[0]}
          </button>
        )}

        {/* Header do Card de Login */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold">
              <Lock size={16} />
            </div>
            <h2 className="font-headline text-fluid-section font-bold text-content-main tracking-tight">
              Acessar Plataforma
            </h2>
          </div>
          <p className="font-body text-fluid-caption text-content-muted">
            Entre com suas credenciais corporativas para acessar o ERP de Obras.
          </p>
        </div>

        {/* Alerta de Erro */}
        {error && (
          <div className="flex items-start gap-2.5 bg-status-late-bg text-status-late border border-status-late/30 p-3 rounded-lg text-xs font-medium mb-4 animate-modal-in">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <FormInput
            label="Email Corporativo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu.email@construtora.com"
            autoComplete="email"
            required
            autoFocus={!savedSession}
          />

          <FormInput
            label="Senha de Acesso"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            autoFocus={Boolean(savedSession)}
          />

          {/* Opção Lembrar deste Dispositivo */}
          <label className="flex items-center gap-2 text-xs text-content-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="rounded border-border text-brand focus:ring-brand"
            />
            <span>Lembrar deste dispositivo para acessos rápidos</span>
          </label>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            className="mt-1 shadow-primary"
          >
            Entrar no Sistema
          </Button>
        </form>
      </div>

      {/* Link para Página de Cadastro */}
      <div className="text-center pt-5 mt-5 border-t border-border-light">
        <p className="font-body text-fluid-caption text-content-muted">
          Ainda não cadastrou sua construtora?{' '}
          <Link
            to="/cadastro"
            className="text-brand font-bold hover:underline inline-flex items-center gap-1 ml-1 cursor-pointer"
          >
            Criar conta grátis (7 dias)
            <ArrowRight size={13} />
          </Link>
        </p>
      </div>
    </div>
  );
};
