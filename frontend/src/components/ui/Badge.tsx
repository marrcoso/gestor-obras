import React from 'react';

export interface StatusBadgeProps {
  status: string;
  className?: string;
  style?: React.CSSProperties;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', style }) => {
  const norm = (status || '').toUpperCase();

  let chipClass = 'chip-status';
  let label = norm;

  switch (norm) {
    case 'PAGO':
    case 'RECEBIDO':
    case 'CONCLUIDA':
      chipClass += ' status-pago';
      label = norm === 'CONCLUIDA' ? 'CONCLUÍDA' : norm;
      break;
    case 'PENDENTE':
    case 'PLANEJAMENTO':
      chipClass += ' status-pendente';
      break;
    case 'EM_ANDAMENTO':
      chipClass += ' status-primary';
      label = 'EM ANDAMENTO';
      break;
    case 'ATRASADO':
    case 'ATRASO':
    case 'CRITICO':
      chipClass += ' status-atraso';
      break;
    case 'CANCELADO':
    case 'PAUSADA':
      chipClass += ' status-juridico';
      break;
    default:
      chipClass += ' status-primary';
      break;
  }

  return (
    <span className={`${chipClass} ${className}`} style={style}>
      {label}
    </span>
  );
};

export interface EtapaBadgeProps {
  etapa: string;
  className?: string;
  style?: React.CSSProperties;
}

export const etapaMap: Record<string, string> = {
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

export const EtapaBadge: React.FC<EtapaBadgeProps> = ({ etapa, className = '', style }) => {
  const label = etapaMap[etapa] || etapa;

  return (
    <span
      className={`text-mono-tag ${className}`}
      style={{
        backgroundColor: 'var(--bg-surface-high)',
        color: 'var(--text-main)',
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '10px',
        ...style
      }}
    >
      {label.toUpperCase()}
    </span>
  );
};

export interface CategoryBadgeProps {
  categoria: string;
  className?: string;
  style?: React.CSSProperties;
}

export const categoriaMap: Record<string, string> = {
  MATERIAL_BASICO: 'Material Básico',
  MATERIAL_ACABAMENTO: 'Acabamento',
  MAO_DE_OBRA_DIARIA: 'Mão de Obra',
  EMPREITEIRO_TERCEIRO: 'Empreiteiro',
  EQUIPAMENTO_LOCACAO: 'Locação Máquinas',
  TRANSPORTE_FRETE: 'Frete & Caçamba',
  ALIMENTACAO_CAMPO: 'Alimentação',
  PROJETO_TAXAS: 'Projetos & Taxas',
  RECEBIMENTO_CLIENTE: 'Medição Cliente',
  OUTROS: 'Outros'
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ categoria, className = '', style }) => {
  const label = categoriaMap[categoria] || categoria.replace(/_/g, ' ');

  return (
    <span
      className={`text-mono-tag ${className}`}
      style={{
        backgroundColor: 'var(--bg-surface-low)',
        border: '1px solid var(--border)',
        color: 'var(--text-muted)',
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '10px',
        ...style
      }}
    >
      {label.toUpperCase()}
    </span>
  );
};
