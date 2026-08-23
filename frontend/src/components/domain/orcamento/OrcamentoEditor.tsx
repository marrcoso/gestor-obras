import React from 'react';
import { Orcamento } from '../../../types/index.js';
import { EmptyState } from '../../ui/EmptyState.js';
import { Button } from '../../ui/Button.js';
import { Calculator, Trash2, FileSpreadsheet } from 'lucide-react';

export interface OrcamentoEditorProps {
  orcamento: Orcamento | null;
  bdi: number;
  onBdiChange: (bdi: number) => void;
  onRemoveItem: (itemId: string) => void;
  formatMoney: (val: number) => string;
  onNewOrcamentoClick?: () => void;
}

export const OrcamentoEditor: React.FC<OrcamentoEditorProps> = ({
  orcamento,
  bdi,
  onBdiChange,
  onRemoveItem,
  formatMoney,
  onNewOrcamentoClick
}) => {
  if (!orcamento) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <EmptyState
          icon={Calculator}
          title="Nenhum orçamento ativo"
          description="Crie uma planilha de orçamento executivo para esta obra para compor custos e BDI."
          action={
            onNewOrcamentoClick && (
              <Button variant="primary" onClick={onNewOrcamentoClick}>
                Criar Primeiro Orçamento
              </Button>
            )
          }
        />
      </div>
    );
  }

  const itens = orcamento.itens || [];

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden flex flex-col">
      {/* Header with Title & BDI setting */}
      <div className="p-4 px-5 border-b border-border bg-surface-low flex items-center justify-between flex-wrap gap-2.5">
        <div>
          <span className="font-body text-[10px] font-bold text-brand uppercase tracking-wider">
            ORÇAMENTO ATIVO DA OBRA
          </span>
          <h3 className="font-headline text-base font-bold text-content-main mt-0.5">
            {orcamento.titulo}
          </h3>
        </div>

        {/* BDI Control Pill */}
        <div className="flex items-center gap-1.5 bg-card px-2.5 py-1 rounded-md border border-border">
          <span className="font-body text-xs font-bold text-brand">
            BDI:
          </span>
          <input
            type="number"
            className="w-11 bg-transparent border-none text-content-main font-bold text-xs text-center outline-none"
            value={bdi}
            onChange={(e) => onBdiChange(parseFloat(e.target.value) || 0)}
          />
          <span className="text-xs text-brand font-bold">%</span>
        </div>
      </div>

      {/* Total Budget Card Header */}
      <div className="p-4 px-5">
        <div className="bg-surface-low border border-border rounded-md p-4 flex items-center justify-between">
          <div>
            <span className="font-body text-[10px] font-bold uppercase tracking-wider text-content-dim">
              VALOR TOTAL ORÇADO (COM BDI APLICADO)
            </span>
            <p className="font-headline text-fluid-kpi font-extrabold text-content-main tabular-nums mt-0.5">
              {formatMoney(orcamento.valor_total_orcado || 0)}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-content-dim font-medium">Itens na Planilha</span>
            <p className="font-headline text-lg font-extrabold text-tech">
              {itens.length}
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="px-5 pb-5">
        {itens.length === 0 ? (
          <EmptyState
            icon={FileSpreadsheet}
            title="Planilha vazia"
            description="Selecione itens no catálogo SINAPI ao lado e clique em 'Adicionar' para calcular os custos."
          />
        ) : (
          <div className="w-full overflow-x-auto border border-border rounded-lg bg-card max-h-[380px]">
            <table className="w-full border-collapse text-left min-w-[500px]">
              <thead>
                <tr className="bg-surface-low text-content-muted font-body text-[11px] font-bold uppercase tracking-wider border-b-2 border-border">
                  <th className="py-2.5 px-3">Item</th>
                  <th className="text-center w-16 py-2.5 px-3">Qtd</th>
                  <th className="text-right w-24 py-2.5 px-3">Base</th>
                  <th className="text-right w-28 py-2.5 px-3">Total</th>
                  <th className="w-10 py-2.5 px-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {itens.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-surface-low/80">
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-content-main">
                          {item.descricao}
                        </span>
                        <span className="text-[10px] text-content-dim">
                          {item.codigo_item ? `CÓD: ${item.codigo_item} • ` : ''} UN: {item.unidade}
                        </span>
                      </div>
                    </td>

                    <td className="text-center font-bold text-xs py-2.5 px-3">
                      {item.quantidade}
                    </td>

                    <td className="text-right text-xs text-content-muted tabular-nums py-2.5 px-3">
                      {formatMoney(item.preco_unitario_base)}
                    </td>

                    <td className="text-right py-2.5 px-3">
                      <span className="font-bold text-xs text-status-paid tabular-nums">
                        {formatMoney(item.subtotal_total)}
                      </span>
                    </td>

                    <td className="text-center py-2.5 px-2">
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-content-dim hover:text-status-late cursor-pointer p-1 transition-colors"
                        title="Remover item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
