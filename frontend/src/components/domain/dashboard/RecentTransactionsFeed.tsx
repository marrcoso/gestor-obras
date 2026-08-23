import React from 'react';
import { TransacaoFinanceira } from '../../../types/index.js';
import { StatusBadge } from '../../ui/Badge.js';
import { Receipt, ArrowRight } from 'lucide-react';

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
    <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-surface-low flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt size={18} className="text-brand" />
          <h3 className="font-headline text-base font-bold text-content-main">
            Últimos Lançamentos
          </h3>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-tech hover:text-tech-hover flex items-center gap-1 cursor-pointer transition-colors"
          >
            Ver Fluxo <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* List Header */}
      <div className="bg-surface-low px-4 py-2.5 border-b border-border flex justify-between text-[11px] font-bold text-content-muted uppercase tracking-wider font-body">
        <span>Descrição & Status</span>
        <span>Valor</span>
      </div>

      {/* List Items */}
      <div className="flex flex-col max-h-[460px] overflow-y-auto divide-y divide-border-light">
        {transacoes.length === 0 ? (
          <div className="p-8 text-center text-content-dim text-xs md:text-sm">
            Nenhum lançamento registrado recentemente.
          </div>
        ) : (
          transacoes.map((item, idx) => {
            const isReceita = item.tipo === 'RECEITA';
            const isLate = item.status === 'PENDENTE' && new Date(item.data_vencimento) < new Date();
            const displayStatus = item.status === 'PAGO' ? 'PAGO' : isLate ? 'ATRASADO' : 'PENDENTE';

            return (
              <div
                key={item.id || idx}
                onClick={onViewAll}
                className="p-3.5 px-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-surface-low"
              >
                <div className="flex flex-col gap-1 max-w-[65%]">
                  <span className="text-xs md:text-sm font-bold text-content-main truncate">
                    {item.descricao}
                  </span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={displayStatus} />
                    <span className="text-[11px] text-content-dim truncate">
                      {item.fornecedor_beneficiario || 'Geral'}
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <span
                    className={`font-body text-xs md:text-sm font-extrabold tabular-nums ${
                      isReceita ? 'text-status-paid' : 'text-status-late'
                    }`}
                  >
                    {isReceita ? '+' : '-'} {formatMoney(item.valor)}
                  </span>
                  <span className="font-body text-[10px] text-content-dim">
                    Venc: {item.data_vencimento ? item.data_vencimento.split('-').reverse().slice(0, 2).join('/') : '-'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
