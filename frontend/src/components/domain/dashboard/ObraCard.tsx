import React from 'react';
import { Obra } from '../../../types/index.js';
import { Button } from '../../ui/Button.js';
import { Receipt, Camera } from 'lucide-react';

export interface ObraCardProps {
  obra: Obra;
  formatMoney: (val: number) => string;
  onSelect: (obra: Obra) => void;
}

export const ObraCard: React.FC<ObraCardProps> = ({
  obra,
  formatMoney,
  onSelect
}) => {
  const perc = obra.percentual_orcamento_consumido || 0;
  const isHigh = perc > 80;
  const isWarning = perc > 60 && perc <= 80;

  const progressColor = isHigh
    ? 'bg-status-late'
    : isWarning
    ? 'bg-status-warning'
    : 'bg-tech';

  const textColor = isHigh
    ? 'text-status-late'
    : isWarning
    ? 'text-status-warning'
    : 'text-content-main';

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-5 shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-md hover:border-border-strong">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-tech bg-tech/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-fit font-body">
            OBRA • {obra.estado_uf}
          </span>
          <h3 className="font-headline text-base md:text-lg font-bold text-content-main">
            {obra.nome}
          </h3>
          <span className="font-body text-xs text-content-dim">
            Cliente: {obra.cliente_nome}
          </span>
        </div>
      </div>

      {/* Budget Progress Box */}
      <div className="bg-surface-low border border-border p-3 rounded-md flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-content-muted">Orçamento Executado</span>
          <span className={`tabular-nums font-extrabold ${textColor}`}>
            {perc}%
          </span>
        </div>

        <div className="w-full h-2 bg-surface-high rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
            style={{ width: `${Math.min(100, perc)}%` }}
          />
        </div>

        <div className="flex justify-between items-center mt-1">
          <div className="flex flex-col">
            <span className="font-body text-[9px] uppercase tracking-wider font-bold text-content-dim">
              CUSTO ATUAL
            </span>
            <span className={`font-body text-xs md:text-sm font-extrabold tabular-nums ${isHigh ? 'text-status-late' : 'text-content-main'}`}>
              {formatMoney(obra.total_despesas || 0)}
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="font-body text-[9px] uppercase tracking-wider font-bold text-content-dim">
              ORÇADO
            </span>
            <span className="font-body text-xs md:text-sm font-semibold tabular-nums text-content-muted">
              {formatMoney(obra.orcamento_previsto || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-border-light">
        <Button
          variant="secondary"
          size="sm"
          icon={Receipt}
          onClick={() => onSelect(obra)}
          className="flex-1"
        >
          Extrato
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={Camera}
          onClick={() => onSelect(obra)}
          className="flex-1"
        >
          Fotos ({obra.total_fotos || 0})
        </Button>
      </div>
    </div>
  );
};
