import React from 'react';
import { TransacaoFinanceira } from '../../../types/index.js';
import { StatusBadge, CategoryBadge } from '../../ui/Badge.js';
import { EmptyState } from '../../ui/EmptyState.js';
import { Paperclip, Trash2, Check, Clock, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export interface TransactionTableProps {
  transacoes: TransacaoFinanceira[];
  formatMoney: (val: number) => string;
  onToggleStatus: (item: TransacaoFinanceira) => void;
  onDelete: (id: string) => void;
  onOpenComprovante: (url: string) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transacoes,
  formatMoney,
  onToggleStatus,
  onDelete,
  onOpenComprovante
}) => {
  if (transacoes.length === 0) {
    return (
      <EmptyState
        title="Nenhum lançamento encontrado"
        description="Não há transações cadastradas com os filtros selecionados para esta obra."
      />
    );
  }

  return (
    <div className="table-constructo-wrapper">
      <table className="table-constructo">
        <thead>
          <tr>
            <th style={{ width: '110px' }}>TIPO</th>
            <th>DESCRIÇÃO / FORNECEDOR</th>
            <th>CATEGORIA</th>
            <th style={{ width: '120px' }}>VENCIMENTO</th>
            <th style={{ textAlign: 'right', width: '130px' }}>VALOR</th>
            <th style={{ width: '110px' }}>STATUS</th>
            <th style={{ textAlign: 'center', width: '120px' }}>AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {transacoes.map((t) => {
            const isReceita = t.tipo === 'RECEITA';
            const isPago = t.status === 'PAGO';

            return (
              <tr key={t.id}>
                {/* Tipo */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: isReceita ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isReceita ? 'var(--status-paid)' : 'var(--status-late)',
                        flexShrink: 0
                      }}
                    >
                      {isReceita ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: isReceita ? 'var(--status-paid)' : 'var(--status-late)'
                      }}
                    >
                      {isReceita ? 'RECEITA' : 'DESPESA'}
                    </span>
                  </div>
                </td>

                {/* Descrição */}
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t.descricao}</span>
                    {t.fornecedor_beneficiario && (
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        {t.fornecedor_beneficiario}
                      </span>
                    )}
                  </div>
                </td>

                {/* Categoria */}
                <td>
                  <CategoryBadge categoria={t.categoria} />
                </td>

                {/* Vencimento */}
                <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t.data_vencimento}
                </td>

                {/* Valor */}
                <td style={{ textAlign: 'right' }}>
                  <span
                    className="text-tabular"
                    style={{
                      fontWeight: 700,
                      color: isReceita ? 'var(--status-paid)' : 'var(--text-main)',
                      fontSize: '13px'
                    }}
                  >
                    {formatMoney(t.valor)}
                  </span>
                </td>

                {/* Status */}
                <td>
                  <StatusBadge status={t.status} />
                </td>

                {/* Ações */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    {/* Toggle Pago */}
                    <button
                      onClick={() => onToggleStatus(t)}
                      title={isPago ? 'Marcar como Pendente' : 'Marcar como Pago'}
                      style={{
                        backgroundColor: isPago ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface-high)',
                        color: isPago ? 'var(--status-paid)' : 'var(--text-dim)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        padding: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {isPago ? <Check size={14} /> : <Clock size={14} />}
                    </button>

                    {/* Comprovante */}
                    {t.comprovante_url && (
                      <button
                        onClick={() => onOpenComprovante(t.comprovante_url!)}
                        title="Ver Comprovante"
                        style={{
                          backgroundColor: 'rgba(59, 130, 246, 0.12)',
                          color: 'var(--technical-blue)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          padding: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Paperclip size={14} />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(t.id)}
                      title="Excluir Lançamento"
                      style={{
                        backgroundColor: 'transparent',
                        color: 'var(--text-dim)',
                        border: '1px solid transparent',
                        borderRadius: '6px',
                        padding: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-late)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
