import React from 'react';
import { Orcamento, OrcamentoItem } from '../../../types/index.js';
import { EmptyState } from '../../ui/EmptyState.js';
import { Button } from '../../ui/Button.js';
import { Calculator, Trash2, FileSpreadsheet, Percent } from 'lucide-react';

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
      <div className="card-constructo" style={{ padding: '24px' }}>
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
    <div className="card-constructo" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header with Title & BDI setting */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-surface-low)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div>
          <span className="text-mono-tag" style={{ fontSize: '10px', color: 'var(--primary)' }}>
            ORÇAMENTO ATIVO DA OBRA
          </span>
          <h3 className="heading-card" style={{ fontSize: '16px', marginTop: '2px' }}>
            {orcamento.titulo}
          </h3>
        </div>

        {/* BDI Control Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-card)',
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border)'
          }}
        >
          <span className="text-mono-tag" style={{ fontSize: '11px', color: 'var(--primary)' }}>
            BDI:
          </span>
          <input
            type="number"
            style={{
              width: '44px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontWeight: 700,
              fontSize: '13px',
              textAlign: 'center',
              fontFamily: 'var(--font-body)'
            }}
            value={bdi}
            onChange={(e) => onBdiChange(parseFloat(e.target.value) || 0)}
          />
          <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>%</span>
        </div>
      </div>

      {/* Total Budget Card Header */}
      <div style={{ padding: '16px 20px' }}>
        <div
          style={{
            backgroundColor: 'var(--bg-surface-low)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span className="text-mono-tag" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
              VALOR TOTAL ORÇADO (COM BDI APLICADO)
            </span>
            <p className="text-kpi-value" style={{ color: 'var(--text-main)', marginTop: '2px' }}>
              {formatMoney(orcamento.valor_total_orcado || 0)}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Itens na Planilha</span>
            <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--technical-blue)' }}>
              {itens.length}
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div style={{ padding: '0 20px 20px 20px' }}>
        {itens.length === 0 ? (
          <EmptyState
            icon={FileSpreadsheet}
            title="Planilha vazia"
            description="Selecione itens no catálogo SINAPI ao lado e clique em 'Adicionar' para calcular os custos."
          />
        ) : (
          <div className="table-constructo-wrapper" style={{ maxHeight: '380px' }}>
            <table className="table-constructo">
              <thead>
                <tr>
                  <th>ITEM</th>
                  <th style={{ textAlign: 'center', width: '70px' }}>QTD</th>
                  <th style={{ textAlign: 'right', width: '100px' }}>BASE</th>
                  <th style={{ textAlign: 'right', width: '110px' }}>TOTAL</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {item.descricao}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                          {item.codigo_item ? `CÓD: ${item.codigo_item} • ` : ''} UN: {item.unidade}
                        </span>
                      </div>
                    </td>

                    <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '12px' }}>
                      {item.quantidade}
                    </td>

                    <td style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {formatMoney(item.preco_unitario_base)}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <span className="text-tabular" style={{ fontWeight: 700, fontSize: '12px', color: 'var(--status-paid)' }}>
                        {formatMoney(item.subtotal_total)}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-dim)',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-late)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
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
