import React, { useState } from 'react';
import { SinapiItem } from '../../../types/index.js';
import { SearchBar } from '../../ui/SearchBar.js';
import { EmptyState } from '../../ui/EmptyState.js';
import { LoadingState } from '../../ui/LoadingState.js';
import { Button } from '../../ui/Button.js';
import { Layers, Plus, Database } from 'lucide-react';

export interface SinapiCatalogProps {
  items: SinapiItem[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onSearch: () => void;
  selectedUf: string;
  onUfChange: (uf: string) => void;
  loading: boolean;
  onAddItem: (item: SinapiItem, quantidade: number) => void;
  formatMoney: (val: number) => string;
}

export const SinapiCatalog: React.FC<SinapiCatalogProps> = ({
  items,
  searchQuery,
  onSearchChange,
  onSearch,
  selectedUf,
  onUfChange,
  loading,
  onAddItem,
  formatMoney
}) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleQtyChange = (id: string, qty: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, qty) }));
  };

  const estados = ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'BA', 'PE', 'CE', 'GO', 'DF', 'AM', 'PA'];

  return (
    <div className="card-constructo" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Search Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} color="var(--technical-blue)" />
            <h3 className="heading-card" style={{ fontSize: '15px' }}>
              Catálogo Oficial SINAPI / Caixa
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>ESTADO:</span>
            <select
              className="form-select-constructo"
              style={{ width: '80px', height: '34px', minHeight: '34px', padding: '4px 8px', fontSize: '12px', fontWeight: 700 }}
              value={selectedUf}
              onChange={(e) => onUfChange(e.target.value)}
            >
              {estados.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar + Submit */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearch();
          }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <SearchBar
            placeholder="Buscar por composição, insumo ou código SINAPI..."
            value={searchQuery}
            onChange={onSearchChange}
          />
          <Button variant="tech-blue" type="submit" size="sm">
            Buscar
          </Button>
        </form>
      </div>

      {/* Results List */}
      {loading ? (
        <LoadingState message="Consultando banco de preços SINAPI..." minHeight="200px" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Nenhum item encontrado"
          description="Digite um termo como 'concreto', 'alvenaria' ou 'tinta' para consultar os custos de referência."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '560px', overflowY: 'auto' }}>
          {items.map((item) => {
            const currentQty = quantities[item.id] || 1;

            return (
              <div
                key={item.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-surface-low)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                      <span
                        className="text-mono-tag"
                        style={{
                          fontSize: '10px',
                          color: 'var(--technical-blue)',
                          backgroundColor: 'var(--technical-blue-light)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        CÓD {item.codigo_sinapi}
                      </span>
                      <span
                        className="text-mono-tag"
                        style={{
                          fontSize: '10px',
                          color: 'var(--text-dim)',
                          backgroundColor: 'var(--bg-surface-high)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        UN: {item.unidade}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', lineHeight: '1.4' }}>
                      {item.descricao}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className="text-mono-tag" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>
                      PREÇO BASE
                    </span>
                    <p
                      className="text-tabular"
                      style={{ fontSize: '15px', fontWeight: 800, color: 'var(--status-paid)' }}
                    >
                      {formatMoney(item.custo_nao_desonerado)}
                    </p>
                  </div>
                </div>

                {/* Add quantity & action */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>Qtd:</span>
                    <input
                      type="number"
                      min="1"
                      className="form-input-constructo"
                      style={{ width: '60px', height: '30px', minHeight: '30px', padding: '2px 6px', textAlign: 'center', fontSize: '12px' }}
                      value={currentQty}
                      onChange={(e) => handleQtyChange(item.id, Number(e.target.value))}
                    />
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={() => onAddItem(item, currentQty)}
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
