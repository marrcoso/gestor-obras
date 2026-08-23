import React from 'react';
import { Obra } from '../../../types/index.js';
import { StatusBadge } from '../../ui/Badge.js';
import { Building2, ArrowUpRight, Calendar, Camera } from 'lucide-react';

export interface ObraCardProps {
  obra: Obra;
  onSelect: (obra: Obra) => void;
  formatMoney: (val: number) => string;
}

export const ObraCard: React.FC<ObraCardProps> = ({ obra, onSelect, formatMoney }) => {
  const percentConsumido = obra.orcamento_previsto > 0
    ? Math.min(100, Math.round(((obra.total_despesas || 0) / obra.orcamento_previsto) * 100))
    : 0;

  const isOverBudget = percentConsumido > 90;

  return (
    <div
      className="card-constructo"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
        cursor: 'pointer',
        borderLeft: isOverBudget ? '4px solid var(--status-late)' : '4px solid var(--technical-blue)'
      }}
      onClick={() => onSelect(obra)}
    >
      <div>
        {/* Header: Title + Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--technical-blue)',
                flexShrink: 0
              }}
            >
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="heading-card" style={{ fontSize: '15px' }}>
                {obra.nome}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                Cliente: {obra.cliente_nome}
              </span>
            </div>
          </div>

          <StatusBadge status={obra.status} />
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Orçamento Consumido</span>
            <span
              style={{
                fontWeight: 700,
                color: isOverBudget ? 'var(--status-late)' : 'var(--text-main)'
              }}
            >
              {percentConsumido}%
            </span>
          </div>
          <div
            style={{
              height: '6px',
              width: '100%',
              backgroundColor: 'var(--bg-surface-high)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${percentConsumido}%`,
                backgroundColor: isOverBudget ? 'var(--status-late)' : 'var(--primary)',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Financial Details Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginTop: '16px',
            padding: '10px',
            backgroundColor: 'var(--bg-surface-low)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)'
          }}
        >
          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
              Saldo Caixa
            </span>
            <p
              className="text-tabular"
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: (obra.saldo_atual || 0) >= 0 ? 'var(--status-paid)' : 'var(--status-late)'
              }}
            >
              {formatMoney(obra.saldo_atual || 0)}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
              Previsto
            </span>
            <p className="text-tabular" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
              {formatMoney(obra.orcamento_previsto || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-light)',
          paddingTop: '10px',
          fontSize: '11px',
          color: 'var(--text-dim)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={13} />
          <span>Início: {obra.data_inicio}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--technical-blue)', fontWeight: 600 }}>
          <span>Gerenciar</span>
          <ArrowUpRight size={14} />
        </div>
      </div>
    </div>
  );
};
