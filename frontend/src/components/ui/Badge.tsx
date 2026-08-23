import React from 'react';

export interface StatusBadgeProps {
  status: 'PAGO' | 'PENDENTE' | 'ATRASADO' | 'CANCELADO' | 'RECEBIDO' | 'CRITICO' | 'ATENCAO' | 'RECENTE' | 'JURIDICO' | string;
  className?: string;
  style?: React.CSSProperties;
}

const statusColors: Record<string, string> = {
  PAGO: 'bg-status-paid',
  RECEBIDO: 'bg-status-paid',
  PENDENTE: 'bg-status-warning',
  ATENCAO: 'bg-status-warning',
  RECENTE: 'bg-status-pending',
  ATRASADO: 'bg-status-late',
  CRITICO: 'bg-status-late',
  CANCELADO: 'bg-content-dim',
  JURIDICO: 'bg-rose-900',
  DEFAULT: 'bg-tech'
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', style }) => {
  const normalized = status.toUpperCase();
  const colorClass = statusColors[normalized] || statusColors.DEFAULT;

  return (
    <span
      className={`inline-flex items-center justify-center gap-1 px-2 py-1.5 font-body text-fluid-mono font-bold uppercase tracking-wider rounded-xs text-white leading-none whitespace-nowrap shadow-xs ${colorClass} ${className}`}
      style={style}
    >
      {status}
    </span>
  );
};

export interface EtapaBadgeProps {
  etapa: string;
  className?: string;
  style?: React.CSSProperties;
}

export const formatEtapaName = (et: string) => {
  const map: Record<string, string> = {
    SERVICOS_PRELIMINARES: 'Serviços Preliminares',
    FUNDACAO_ESTRUTURA: 'Fundação & Estrutura',
    ALVENARIA_VEDACAO: 'Alvenaria',
    COBERTURA_TELHADO: 'Cobertura & Telhado',
    INSTALACOES_ELETRICA_HIDRAULICA: 'Instalações',
    REVESTIMENTO_ACABAMENTO: 'Acabamentos',
    PINTURA_VIDROS: 'Pintura & Vidros',
    ENTREGA_LIMPEZA: 'Entrega Final',
    GERAL: 'Geral'
  };
  return map[et] || et.replace(/_/g, ' ');
};

export const EtapaBadge: React.FC<EtapaBadgeProps> = ({ etapa, className = '', style }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 font-body text-[10px] font-bold uppercase tracking-wider rounded bg-tech/15 text-tech border border-tech/20 whitespace-nowrap ${className}`}
      style={style}
    >
      {formatEtapaName(etapa)}
    </span>
  );
};

export interface CategoryBadgeProps {
  categoria: string;
  tipo?: 'RECEITA' | 'DESPESA';
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  categoria,
  tipo,
  className = ''
}) => {
  return (
    <span className={`inline-flex items-center gap-1 text-xs text-content-dim ${className}`}>
      {tipo && (
        <span className={tipo === 'RECEITA' ? 'text-status-paid font-semibold' : 'text-status-late font-semibold'}>
          {tipo === 'RECEITA' ? 'Receita' : 'Despesa'} /
        </span>
      )}
      <span>{categoria.replace(/_/g, ' ')}</span>
    </span>
  );
};
