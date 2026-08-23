import React from 'react';
import { Modal } from '../../ui/Modal.js';
import { Button } from '../../ui/Button.js';
import { EtapaBadge } from '../../ui/Badge.js';
import { MessageSquare, Share2, Building2, UserCheck, Calendar } from 'lucide-react';

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Share2 size={18} color="var(--primary)" />
          <span>Relatório de Evolução da Obra para o Cliente</span>
        </div>
      }
      size="lg"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Header Summary */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-low)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Building2 size={18} color="var(--technical-blue)" />
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
              {obraNome}
            </h4>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Proprietário: <strong>{relatorioData.cliente?.nome || 'Cliente'}</strong> • Status:{' '}
            <strong>{relatorioData.obra?.status || 'Em Andamento'}</strong>
          </p>
        </div>

        {/* Gallery Preview */}
        <div>
          <h5 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>
            Fotos Selecionadas para o Relatório ({fotos.length})
          </h5>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '12px',
              maxHeight: '320px',
              overflowY: 'auto'
            }}
          >
            {fotos.map((f: any, idx: number) => {
              const url = f.foto_url || f.miniatura_url;
              return (
                <div
                  key={idx}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: 'var(--bg-card)'
                  }}
                >
                  <img src={url} style={{ width: '100%', height: '110px', objectFit: 'cover' }} alt="Obra" />
                  <div style={{ padding: '8px' }}>
                    <EtapaBadge etapa={f.etapa} style={{ fontSize: '9px', padding: '2px 6px' }} />
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {f.data_registro}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
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
