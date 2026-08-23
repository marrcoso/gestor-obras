import React from 'react';
import { DiarioFoto } from '../../../types/index.js';
import { EtapaBadge } from '../../ui/Badge.js';
import { EmptyState } from '../../ui/EmptyState.js';
import { Camera, Calendar, Maximize2 } from 'lucide-react';

export interface PhotoGalleryProps {
  fotos: DiarioFoto[];
  onSelectPhoto: (url: string) => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ fotos, onSelectPhoto }) => {
  if (fotos.length === 0) {
    return (
      <EmptyState
        icon={Camera}
        title="Nenhum registro fotográfico"
        description="Não há fotos catalogadas para os filtros de etapa selecionados nesta obra."
      />
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}
    >
      {fotos.map((foto) => {
        const url = foto.foto_url || foto.miniatura_url;

        return (
          <div
            key={foto.id}
            className="card-constructo"
            style={{
              padding: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer'
            }}
            onClick={() => onSelectPhoto(url)}
          >
            {/* Image Container */}
            <div style={{ position: 'relative', height: '200px', backgroundColor: '#0f172a', overflow: 'hidden' }}>
              <img
                src={url}
                alt={foto.descricao || 'Foto do Diário'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease'
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
              />

              {/* Stage Badge on Top Left */}
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px'
                }}
              >
                <EtapaBadge
                  etapa={foto.etapa}
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(6px)',
                    color: '#38bdf8'
                  }}
                />
              </span>

              {/* Zoom Icon Overlay Top Right */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(15, 23, 42, 0.65)',
                  padding: '6px',
                  borderRadius: '50%',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Maximize2 size={14} />
              </div>
            </div>

            {/* Content & Metadata */}
            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', lineHeight: '1.4' }}>
                {foto.descricao || 'Registro diário de evolução da obra'}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  color: 'var(--text-dim)',
                  marginTop: 'auto',
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '8px'
                }}
              >
                <Calendar size={13} />
                <span>{foto.data_registro}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
