import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { FormInput } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';
import { HardHat, ShieldCheck, Smartphone, Sun, Moon } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login, loginDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Redireciona se já autenticado
  useEffect(() => {
    if (user) {
      navigate(user.perfil === 'MESTRE_OBRA' ? '/campo' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Form State
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, senha);
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (perfil: 'ADMIN' | 'MESTRE_OBRA') => {
    setLoading(true);
    setError('');
    try {
      await loginDemo(perfil);
      navigate(perfil === 'MESTRE_OBRA' ? '/campo' : '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar demonstração.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-app relative">
      {/* Top Bar Theme Switcher */}
      <div className="absolute top-5 right-5">
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleTheme}
          icon={theme === 'dark' ? Sun : Moon}
          title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
        >
          {theme === 'dark' ? 'Claro' : 'Escuro'}
        </Button>
      </div>

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-primary">
            <HardHat size={32} />
          </div>
          <h1 className="font-headline text-fluid-hero font-extrabold text-content-main tracking-tight leading-tight">
            ERP LEVE CONSTRUTORA
          </h1>
          <p className="font-body text-fluid-body text-content-muted mt-1">
            Fluxo de Caixa Segregado, SINAPI & Canteiro Mobile
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-card border border-border rounded-xl p-6 md:p-7 shadow-sm">
          {error && (
            <div className="bg-status-late-bg text-status-late border border-status-late/30 p-3 rounded-lg text-xs md:text-sm font-medium mb-4">
              {error}
            </div>
          )}

          {/* Atalhos de Acesso Instantâneo Demo */}
          <div className="mb-6">
            <span className="font-body text-[11px] font-bold text-content-dim block mb-2 uppercase tracking-wider">
              ACESSO RÁPIDO DE DEMONSTRAÇÃO (1 CLIQUE):
            </span>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleDemo('ADMIN')}
                disabled={loading}
                className="flex items-center gap-3 p-3 bg-surface-low border border-border rounded-lg text-left transition-all hover:bg-surface-container hover:border-border-strong cursor-pointer disabled:opacity-50"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-bold text-content-main leading-tight">
                    Engenheiro / Gestor Geral
                  </p>
                  <span className="text-[11px] text-content-muted">
                    Visão financeira completa & SINAPI
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemo('MESTRE_OBRA')}
                disabled={loading}
                className="flex items-center gap-3 p-3 bg-surface-low border border-border rounded-lg text-left transition-all hover:bg-surface-container hover:border-border-strong cursor-pointer disabled:opacity-50"
              >
                <div className="w-9 h-9 rounded-lg bg-tech/15 text-tech flex items-center justify-center flex-shrink-0">
                  <Smartphone size={20} />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-bold text-content-main leading-tight">
                    Mestre de Obras (Canteiro)
                  </p>
                  <span className="text-[11px] text-content-muted">
                    Lançamentos de campo & diário fotográfico
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5 my-5 text-content-dim text-[11px] font-body font-bold uppercase tracking-wider">
            <div className="flex-1 h-px bg-border" />
            <span>OU ENTRAR COM EMAIL</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <FormInput
              label="Email Corporativo"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@construtora.com"
              required
            />

            <FormInput
              label="Senha de Acesso"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              className="mt-1.5"
            >
              Entrar no Sistema
            </Button>
          </form>
        </div>

        <p className="font-body text-[10px] font-bold text-content-dim tracking-widest text-center mt-5 uppercase">
          CONSTRUCTO PRO • MULTI-TENANT ISOLATED CENTROS DE CUSTO
        </p>
      </div>
    </div>
  );
};
