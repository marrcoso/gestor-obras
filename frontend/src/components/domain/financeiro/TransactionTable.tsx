import React from 'react';
import { TransacaoFinanceira } from '../../../types/index.js';
import { CategoryBadge } from '../../ui/Badge.js';
import { EmptyState } from '../../ui/EmptyState.js';
import { Check, Clock, AlertTriangle, Paperclip, Trash2, Receipt } from 'lucide-react';

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
        icon={Receipt}
        title="Nenhum lançamento encontrado"
        description="Não há transações para os filtros selecionados ou cadastre um novo registro."
      />
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-border rounded-lg bg-card shadow-sm">
      <table className="w-full border-collapse text-left min-w-[760px]">
        <thead>
          <tr className="bg-surface-low text-content-muted font-body text-fluid-mono font-bold uppercase tracking-wider border-b-2 border-border">
            <th className="w-20 text-center py-3.5 px-4">Status</th>
            <th className="w-28 py-3.5 px-4">Data</th>
            <th className="py-3.5 px-4">Descrição & Categoria</th>
            <th className="py-3.5 px-4">Fornecedor</th>
            <th className="text-right w-40 py-3.5 px-4">Valor</th>
            <th className="w-20 text-center py-3.5 px-4">Anexo</th>
            <th className="w-16 text-center py-3.5 px-4">Ação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light">
          {transacoes.map((t) => {
            const isPago = t.status === 'PAGO';
            const isReceita = t.tipo === 'RECEITA';
            const isLate = !isPago && new Date(t.data_vencimento) < new Date();

            return (
              <tr key={t.id} className="transition-colors hover:bg-surface-low/80">
                {/* Circular Status Icon Button */}
                <td className="text-center align-middle py-3.5 px-4">
                  <button
                    onClick={() => onToggleStatus(t)}
                    className={`w-7 h-7 rounded-full inline-flex items-center justify-center border-none cursor-pointer text-white shadow-xs transition-transform active:scale-90 ${
                      isPago
                        ? 'bg-status-paid hover:bg-emerald-600'
                        : isLate
                        ? 'bg-status-late hover:bg-red-600'
                        : 'bg-status-warning hover:bg-amber-600'
                    }`}
                    title={isPago ? 'Marcar como Pendente' : 'Marcar como Pago'}
                  >
                    {isPago ? (
                      <Check size={14} />
                    ) : isLate ? (
                      <AlertTriangle size={13} />
                    ) : (
                      <Clock size={13} />
                    )}
                  </button>
                </td>

                {/* Date */}
                <td className={`font-body text-xs md:text-sm tabular-nums whitespace-nowrap py-3.5 px-4 ${
                  isLate ? 'text-status-late font-bold' : 'text-content-main'
                }`}>
                  {t.data_vencimento ? t.data_vencimento.split('-').reverse().join('/') : '—'}
                </td>

                {/* Description & Category */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-xs md:text-sm text-content-main">
                      {t.descricao}
                    </span>
                    <CategoryBadge categoria={t.categoria} tipo={t.tipo} />
                  </div>
                </td>

                {/* Supplier */}
                <td className="text-content-muted py-3.5 px-4">
                  <div className="flex flex-col">
                    <span className="text-xs md:text-sm font-medium">{t.fornecedor_beneficiario || 'Geral'}</span>
                    <span className="text-[10px] text-content-dim">
                      {t.origem_lancamento === 'MOBILE' ? '📱 Canteiro' : '💻 Escritório'}
                    </span>
                  </div>
                </td>

                {/* Value */}
                <td className={`text-right font-body text-xs md:text-sm font-bold tabular-nums py-3.5 px-4 ${
                  isReceita ? 'text-status-paid' : 'text-status-late'
                }`}>
                  {isReceita ? '+' : '-'} {formatMoney(t.valor)}
                </td>

                {/* Attachment */}
                <td className="text-center py-3.5 px-4">
                  {t.comprovante_url ? (
                    <button
                      onClick={() => onOpenComprovante(t.comprovante_url || '')}
                      className="text-tech hover:text-tech-hover cursor-pointer p-1 transition-colors"
                      title="Ver Comprovante"
                    >
                      <Paperclip size={18} />
                    </button>
                  ) : (
                    <span className="text-border-strong text-xs">—</span>
                  )}
                </td>

                {/* Delete */}
                <td className="text-center py-3.5 px-4">
                  <button
                    onClick={() => onDelete(t.id)}
                    className="text-content-dim hover:text-status-late cursor-pointer p-1 transition-colors"
                    title="Excluir Lançamento"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
