import React from 'react';
import { ContaReceber } from '../../../types/index.js';
import { StatusBadge } from '../../ui/Badge.js';
import { Button } from '../../ui/Button.js';
import { EmptyState } from '../../ui/EmptyState.js';
import { MessageSquare, Check, AlertTriangle } from 'lucide-react';

export interface ReceivableTableProps {
  contas: ContaReceber[];
  formatMoney: (val: number) => string;
  onOpenWhatsApp: (contaId: string) => void;
  onMarkPaid: (contaId: string) => void;
}

export const ReceivableTable: React.FC<ReceivableTableProps> = ({
  contas,
  formatMoney,
  onOpenWhatsApp,
  onMarkPaid
}) => {
  if (contas.length === 0) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Nenhuma fatura em atraso"
        description="Não há recebíveis pendentes para esta obra ou todos os contratos estão em dia."
      />
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-border rounded-lg bg-card shadow-sm">
      <table className="w-full border-collapse text-left min-w-[760px]">
        <thead>
          <tr className="bg-surface-low text-content-muted font-body text-fluid-mono font-bold uppercase tracking-wider border-b-2 border-border">
            <th className="py-3.5 px-4 w-[28%]">Cliente / Obra</th>
            <th className="py-3.5 px-4">Parcela</th>
            <th className="text-right py-3.5 px-4">Vencimento</th>
            <th className="text-right py-3.5 px-4">Valor</th>
            <th className="text-center py-3.5 px-4 w-[15%]">Status</th>
            <th className="text-right py-3.5 px-4 w-[18%]">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light">
          {contas.map((conta) => {
            const isRecebido = conta.status === 'RECEBIDO';
            const isLate = conta.is_vencido || conta.status === 'ATRASADO';
            const dias = conta.dias_atraso || 0;

            return (
              <tr
                key={conta.id}
                className={`transition-colors ${
                  isLate && !isRecebido ? 'bg-status-late-bg/60' : 'hover:bg-surface-low/80'
                }`}
              >
                {/* Cliente / Obra */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs md:text-sm text-content-main">
                      {conta.cliente_nome}
                    </span>
                    <span className="text-xs text-content-dim">
                      {conta.obra_nome}
                    </span>
                  </div>
                </td>

                {/* Parcela */}
                <td className="py-3.5 px-4 text-content-muted">
                  <div className="flex flex-col">
                    <span className="text-xs md:text-sm font-medium">{conta.numero_parcela}ª Parcela</span>
                    <span className="text-xs text-content-dim">
                      {conta.descricao_medicao}
                    </span>
                  </div>
                </td>

                {/* Vencimento com Dias de Atraso */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className={`font-body text-xs md:text-sm tabular-nums font-semibold ${
                      isLate ? 'text-status-late' : 'text-content-main'
                    }`}>
                      {conta.data_vencimento ? conta.data_vencimento.split('-').reverse().join('/') : '—'}
                    </span>
                    {isLate && !isRecebido && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded text-white mt-0.5 ${
                        dias > 30 ? 'bg-status-late' : 'bg-status-warning'
                      }`}>
                        {dias} dias
                      </span>
                    )}
                  </div>
                </td>

                {/* Valor */}
                <td className="py-3.5 px-4 text-right font-body text-xs md:text-sm font-bold tabular-nums text-content-main">
                  {formatMoney(conta.valor)}
                </td>

                {/* Status */}
                <td className="text-center py-3.5 px-4">
                  {isRecebido ? (
                    <StatusBadge status="RECEBIDO" />
                  ) : dias > 30 ? (
                    <StatusBadge status="CRITICO" />
                  ) : dias > 15 ? (
                    <StatusBadge status="ATENCAO" />
                  ) : (
                    <StatusBadge status="RECENTE" />
                  )}
                </td>

                {/* Ações */}
                <td className="text-right py-3.5 px-4">
                  <div className="flex items-center justify-end gap-1.5">
                    {!isRecebido && (
                      <>
                        <Button
                          variant="whatsapp"
                          size="sm"
                          icon={MessageSquare}
                          onClick={() => onOpenWhatsApp(conta.id)}
                          title="Disparar Lembrete no WhatsApp"
                          className="px-2.5 py-1 text-[11px]"
                        >
                          WhatsApp
                        </Button>

                        <Button
                          variant="tech-blue"
                          size="sm"
                          icon={Check}
                          onClick={() => onMarkPaid(conta.id)}
                          title="Dar Baixa e creditar no caixa"
                          className="px-2.5 py-1 text-[11px]"
                        />
                      </>
                    )}
                    {isRecebido && (
                      <span className="text-xs text-status-paid font-semibold">
                        ✓ Liquidado
                      </span>
                    )}
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
