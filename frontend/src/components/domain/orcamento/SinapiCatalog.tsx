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
    <div className="bg-card border border-border rounded-lg p-5 shadow-sm flex flex-col gap-4">
      {/* Search Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-tech" />
            <h3 className="font-headline text-sm md:text-base font-bold text-content-main">
              Catálogo Oficial SINAPI / Caixa
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-content-dim">ESTADO:</span>
            <select
              className="bg-input border border-border rounded px-2 py-1 text-xs font-bold text-content-main outline-none focus:border-tech"
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
          className="flex gap-2"
        >
          <SearchBar
            placeholder="Buscar composição, insumo ou código SINAPI..."
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
        <div className="flex flex-col gap-2.5 max-h-[560px] overflow-y-auto pr-1">
          {items.map((item) => {
            const currentQty = quantities[item.id] || 1;

            return (
              <div
                key={item.id}
                className="border border-border rounded-md p-3 bg-surface-low flex flex-col gap-2.5 transition-colors hover:border-border-strong"
              >
                <div className="flex justify-between items-start gap-2.5">
                  <div>
                    <div className="flex gap-1.5 items-center mb-1.5">
                      <span className="text-[10px] font-bold text-tech bg-tech/15 px-1.5 py-0.5 rounded font-body">
                        CÓD {item.codigo_sinapi}
                      </span>
                      <span className="text-[10px] font-bold text-content-dim bg-surface-high px-1.5 py-0.5 rounded font-body">
                        UN: {item.unidade}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm font-semibold text-content-main leading-snug">
                      {item.descricao}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-content-dim font-body">
                      PREÇO BASE
                    </span>
                    <p className="font-body text-sm md:text-base font-extrabold tabular-nums text-status-paid">
                      {formatMoney(item.custo_nao_desonerado)}
                    </p>
                  </div>
                </div>

                {/* Add quantity & action */}
                <div className="flex items-center justify-end gap-2.5 border-t border-border-light pt-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-content-dim">Qtd:</span>
                    <input
                      type="number"
                      min="1"
                      className="bg-input border border-border rounded w-14 h-7 text-center text-xs font-bold text-content-main outline-none focus:border-tech"
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
