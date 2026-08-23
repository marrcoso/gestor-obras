import React from 'react';
import { TransacaoFinanceira } from '../../../types/index.js';
import { StatusBadge } from '../../ui/Badge.js';
import { EmptyState } from '../../ui/EmptyState.js';
import { ArrowDownLeft, ArrowUpRight, Receipt } from 'lucide-react';

export interface RecentTransactionsFeedProps {
  transacoes: TransacaoFinanceira[];
  formatMoney: (val: number) => string;
  onViewAll?: () => void;
}

export const RecentTransactionsFeed: React.FC<RecentTransactionsFeedProps> = ({
  transacoes,
  formatMoney,
  onViewAll
}) => {
  return (
    <div
      className="card-constructo"
      style={{
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface-low)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Receipt size={18} color="var(--primary)" />
          <h3 className="heading-card" style={{ fontSize: '15px' }}>
            Últimos Lançamentos de Caixa
          </h3>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--technical-blue)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Ver Extrato Completo →
          </button>
        )}
      </div>

      {/* List */}
      {transacoes.length === 0 ? (
        <div style={{ padding: '24px' }}>
          <EmptyState
            icon={Receipt}
            title="Nenhuma movimentação recente"
            description="Lançamentos financeiros de receitas e despesas aparecerão aqui."
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {transacoes.map((item) => {
            const isReceita = item.tipo === 'RECEITA';
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 20px',
                  borderBottom: '1px solid var(--border-light)',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-low)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isReceita ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isReceita ? 'var(--status-paid)' : 'var(--status-late)'
                    }}
                  >
                    {isReceita ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>

                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {item.descricao}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        {item.data_vencimento}
                      </span>
                      <StatusBadge status={item.status} style={{ fontSize: '9px', padding: '2px 6px' }} />
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p
                    className="text-tabular"
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: isReceita ? 'var(--status-paid)' : 'var(--text-main)'
                    }}
                  >
                    {isReceita ? '+' : '-'} {formatMoney(item.valor)}
                  </p>
                  {item.fornecedor_beneficiario && (
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                      {item.fornecedor_beneficiario}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
