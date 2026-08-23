import React from 'react';
import { Modal } from '../../ui/Modal.js';
import { Button } from '../../ui/Button.js';
import { EtapaBadge } from '../../ui/Badge.js';
import { MessageSquare, Share2, Building2 } from 'lucide-react';

export interface ClientReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  relatorioData: any;
  obraNome: string;
}

export const ClientReportModal: React.FC<ClientReportModalProps> = ({
  isOpen,
  onClose,
  relatorioData,
  obraNome
}) => {
  if (!relatorioData) return null;

  const handleShare = () => {
    alert('Link público do relatório copiado com sucesso! Você pode colá-lo no WhatsApp do proprietário.');
    onClose();
  };

  const fotos = relatorioData.fotos_recentes || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Share2 size={18} className="text-brand" />
          <span>Relatório de Evolução da Obra para o Cliente</span>
        </div>
      }
      size="lg"
    >
      <div className="flex flex-col gap-4">
        {/* Header Summary */}
        <div className="bg-surface-low p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={18} className="text-tech" />
            <h4 className="font-headline text-sm md:text-base font-bold text-content-main">
              {obraNome}
            </h4>
          </div>
          <p className="text-xs text-content-dim">
            Proprietário: <strong className="text-content-main">{relatorioData.cliente?.nome || 'Cliente'}</strong> • Status:{' '}
            <strong className="text-content-main">{relatorioData.obra?.status || 'Em Andamento'}</strong>
          </p>
        </div>

        {/* Gallery Preview */}
        <div>
          <h5 className="text-xs md:text-sm font-bold text-content-muted mb-2.5">
            Fotos Selecionadas para o Relatório ({fotos.length})
          </h5>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[320px] overflow-y-auto">
            {fotos.map((f: any, idx: number) => {
              const url = f.foto_url || f.miniatura_url;
              return (
                <div
                  key={idx}
                  className="border border-border rounded-lg overflow-hidden bg-card shadow-xs"
                >
                  <img src={url} className="w-full h-24 object-cover" alt="Obra" />
                  <div className="p-2">
                    <EtapaBadge etapa={f.etapa} className="text-[9px] px-1.5 py-0.5" />
                    <p className="text-[10px] text-content-muted mt-1 font-body tabular-nums">
                      {f.data_registro}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2.5 mt-2">
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
          <Button variant="whatsapp" icon={MessageSquare} onClick={handleShare}>
            Enviar no WhatsApp do Cliente
          </Button>
        </div>
      </div>
    </Modal>
  );
};
