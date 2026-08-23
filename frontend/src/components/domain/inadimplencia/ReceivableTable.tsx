import React from 'react';
import { ContaReceber } from '../../../types/index.js';
import { StatusBadge } from '../../ui/Badge.js';
import { EmptyState } from '../../ui/EmptyState.js';
import { MessageSquare, Check, Calendar, AlertTriangle } from 'lucide-react';

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
        title="Nenhuma conta a receber encontrada"
        description="Não há parcelas pendentes ou vencidas cadastradas para esta seleção."
      />
    );
  }

  return (
    <div className="table-constructo-wrapper">
      <table className="table-constructo">
        <thead>
          <tr>
            <th>CLIENTE & OBRA</th>
            <th>MEDIÇÃO / PARCELA</th>
            <th style={{ width: '130px' }}>VENCIMENTO</th>
            <th style={{ width: '120px' }}>ATRASO</th>
            <th style={{ textAlign: 'right', width: '130px' }}>VALOR</th>
            <th style={{ width: '110px' }}>STATUS</th>
            <th style={{ textAlign: 'center', width: '150px' }}>COBRANÇA</th>
          </tr>
        </thead>
        <tbody>
          {contas.map((c) => {
            const dias = c.dias_atraso || 0;
            const isVencido = c.is_vencido || dias > 0;
            const isRecebido = c.status === 'RECEBIDO';

            return (
              <tr key={c.id}>
                {/* Cliente & Obra */}
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {c.cliente_nome || 'Cliente da Obra'}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      {c.obra_nome || 'Centro de Custo'}
                    </span>
                  </div>
                </td>

                {/* Medição / Parcela */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        backgroundColor: 'var(--bg-surface-high)',
                        color: 'var(--text-muted)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 700
                      }}
                    >
                      P{c.numero_parcela}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                      {c.descricao_medicao}
                    </span>
                  </div>
                </td>

                {/* Vencimento */}
                <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {c.data_vencimento}
                </td>

                {/* Atraso */}
                <td>
                  {isVencido && !isRecebido ? (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: dias > 30 ? 'var(--status-late)' : 'var(--status-warning)',
                        color: '#ffffff',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}
                    >
                      {dias} dias
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>No prazo</span>
                  )}
                </td>

                {/* Valor */}
                <td style={{ textAlign: 'right' }}>
                  <span
                    className="text-tabular"
                    style={{
                      fontWeight: 700,
                      color: isVencido ? 'var(--status-late)' : 'var(--text-main)',
                      fontSize: '13px'
                    }}
                  >
                    {formatMoney(c.valor)}
                  </span>
                </td>

                {/* Status */}
                <td>
                  <StatusBadge status={c.status} />
                </td>

                {/* Ações de Cobrança */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    {!isRecebido && (
                      <button
                        onClick={() => onOpenWhatsApp(c.id)}
                        className="btn-constructo btn-whatsapp"
                        style={{ padding: '6px 10px', minHeight: '30px', fontSize: '11px', gap: '4px' }}
                        title="Enviar Cobrança WhatsApp"
                      >
                        <MessageSquare size={13} />
                        <span>COBRAR</span>
                      </button>
                    )}

                    {!isRecebido && (
                      <button
                        onClick={() => onMarkPaid(c.id)}
                        className="btn-constructo btn-secondary-slate"
                        style={{ padding: '6px', minHeight: '30px' }}
                        title="Dar Baixa (Confirmar Recebimento)"
                      >
                        <Check size={14} color="var(--status-paid)" />
                      </button>
                    )}

                    {isRecebido && (
                      <span style={{ fontSize: '11px', color: 'var(--status-paid)', fontWeight: 600 }}>
                        Quitado
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
