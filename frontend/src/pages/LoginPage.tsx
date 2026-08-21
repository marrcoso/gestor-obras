import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { HardHat, ShieldCheck, Smartphone, ArrowRight, Building2, Sun, Moon } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login, loginDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isRegister, setIsRegister] = useState(false);

  // Redireciona se já autenticado
  useEffect(() => {
    if (user) {
      navigate(user.perfil === 'MESTRE_OBRA' ? '/campo' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Form State
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nomeConstrutora, setNomeConstrutora] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        // Registro
      } else {
        await login(email, senha);
      }
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
        padding: '20px',
        backgroundColor: 'var(--bg-dark)',
        position: 'relative'
      }}
    >
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <button
          onClick={toggleTheme}
          className="btn btn-secondary"
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            color: theme === 'dark' ? '#f59e0b' : '#3b82f6',
            gap: '6px'
          }}
          title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <span style={{ fontSize: '12px' }}>{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
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
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#fff',
              boxShadow: 'var(--shadow-primary)'
            }}
          >
            <HardHat size={32} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>ERP LEVE DE OBRAS</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Fluxo de Caixa Segregado, SINAPI & Canteiro Mobile
          </p>
        </div>

        {/* Card Principal */}
        <div className="glass-card" style={{ padding: '28px' }}>
          {error && (
            <div className="badge badge-danger" style={{ display: 'block', padding: '8px 12px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {/* Atalhos de Acesso Instantâneo Demo */}
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
              ⚡ Acesso Rápido de Demonstração (1 Clique):
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => handleDemo('ADMIN')}
                disabled={loading}
                className="btn btn-secondary"
                style={{
                  justifyContent: 'flex-start',
                  padding: '12px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <ShieldCheck size={18} color="#f59e0b" />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
                    Entrar como Dono / Engenheiro
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
                className="btn btn-secondary"
                style={{
                  justifyContent: 'flex-start',
                  padding: '12px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <Smartphone size={18} color="#60a5fa" />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
                    Entrar como Mestre de Obras
                  </p>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Visão de campo / fotos e cupons
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
              fontSize: '12px'
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
            <span>ou entrar com email</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Corporativo</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Senha de Acesso</label>
              <input
                type="password"
                className="form-input"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '8px' }}
            >
              {loading ? 'Acessando...' : 'Entrar no Sistema'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-dim)', marginTop: '20px' }}>
          ERP Leve de Obras • Multi-Tenant SaaS B2B
        </p>
      </div>
    </div>
  );
};
