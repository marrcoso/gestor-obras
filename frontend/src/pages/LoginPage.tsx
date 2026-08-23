import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { HardHat, ShieldCheck, Smartphone, Sun, Moon } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login, loginDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isRegister] = useState(false);

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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        backgroundColor: 'var(--bg-app)',
        position: 'relative'
      }}
    >
      {/* Top Bar Theme Switcher */}
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <button
          onClick={toggleTheme}
          className="btn-constructo btn-secondary-slate"
          style={{ padding: '8px 12px', fontSize: '12px', gap: '6px' }}
          title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
        >
          {theme === 'dark' ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#3b82f6" />}
          <span>{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              backgroundColor: 'var(--primary)',
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(249, 115, 22, 0.3)'
            }}
          >
            <HardHat size={32} />
          </div>
          <h1 className="heading-hero">
            ERP LEVE CONSTRUTORA
          </h1>
          <p className="text-subtitle" style={{ marginTop: '4px' }}>
            Fluxo de Caixa Segregado, SINAPI & Canteiro Mobile
          </p>
        </div>

        {/* Card Principal */}
        <div className="card-constructo" style={{ padding: '28px' }}>
          {error && (
            <div
              style={{
                backgroundColor: 'var(--status-late-bg)',
                color: 'var(--status-late)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '18px'
              }}
            >
              {error}
            </div>
          )}

          {/* Atalhos de Acesso Instantâneo Demo */}
          <div style={{ marginBottom: '24px' }}>
            <span
              className="text-mono-tag"
              style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}
            >
              ACESSO RÁPIDO DE DEMONSTRAÇÃO (1 CLIQUE):
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleDemo('ADMIN')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-surface-low)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f59e0b'
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', lineHeight: '1.2' }}>
                    Engenheiro / Gestor Geral
                  </p>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Visão financeira completa & SINAPI
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemo('MESTRE_OBRA')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-surface-low)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--technical-blue)'
                  }}
                >
                  <Smartphone size={20} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', lineHeight: '1.2' }}>
                    Mestre de Obras (Canteiro)
                  </p>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Lançamentos de campo & diário fotográfico
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: '20px 0',
              color: 'var(--text-dim)',
              fontSize: '11px',
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.04em',
              fontWeight: 600
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
            <span>OU ENTRAR COM EMAIL</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group-constructo">
              <label className="form-label-constructo">Email Corporativo</label>
              <input
                type="email"
                className="form-input-constructo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@construtora.com"
                required
              />
            </div>

            <div className="form-group-constructo">
              <label className="form-label-constructo">Senha de Acesso</label>
              <input
                type="password"
                className="form-input-constructo"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-constructo btn-primary-orange"
              style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '14px' }}
            >
              {loading ? 'Acessando...' : 'Entrar no Sistema'}
            </button>
          </form>
        </div>

        <p
          className="text-mono-tag"
          style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-dim)', marginTop: '20px', display: 'block' }}
        >
          CONSTRUCTO PRO • MULTI-TENANT ISOLATED CENTROS DE CUSTO
        </p>
      </div>
    </div>
  );
};

