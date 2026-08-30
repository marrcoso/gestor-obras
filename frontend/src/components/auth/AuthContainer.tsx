import React from 'react';
import { useTheme } from '../../context/ThemeContext.js';
import { Button } from '../ui/Button.js';
import { HardHat, Sun, Moon, Shield } from 'lucide-react';

interface AuthContainerProps {
  children: React.ReactNode;
  maxWidthClass?: string;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({
  children,
  maxWidthClass = 'max-w-md'
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8 bg-app relative">
      {/* Top Bar Theme Switcher & Status */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-status-paid animate-pulse" />
          <span className="text-[11px] font-mono font-semibold text-content-dim uppercase tracking-wider">
            SISTEMA ONLINE • BASE SINAPI ATIVA
          </span>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={toggleTheme}
          icon={theme === 'dark' ? Sun : Moon}
          title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
        >
          {theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}
        </Button>
      </div>

      {/* Brand Header Central */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-3 text-white shadow-primary">
          <HardHat size={32} />
        </div>
        <h1 className="font-headline text-fluid-hero font-extrabold text-content-main tracking-tight leading-tight">
          ERP LEVE CONSTRUTORA
        </h1>
        <p className="font-body text-fluid-body text-content-muted mt-1 max-w-lg mx-auto">
          Fluxo de Caixa Segregado, SINAPI Caixa & Canteiro Mobile
        </p>
      </div>

      {/* Conteúdo Centralizado */}
      <div className={`w-full ${maxWidthClass} mx-auto flex-1 flex flex-col justify-center mb-6`}>
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
          {children}
        </div>
      </div>

      {/* Rodapé Institucional e de Segurança */}
      <footer className="text-center pt-4 border-t border-border-light w-full max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-4 text-content-dim text-[11px] font-mono uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Shield size={12} className="text-status-paid" />
            Criptografia de Ponta a Ponta
          </span>
          <span>•</span>
          <span>Isolamento Multi-Tenant por Obra</span>
          <span>•</span>
          <span>Constructo Pro © {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
};
