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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {fotos.map((foto) => {
        const url = foto.foto_url || foto.miniatura_url;

        return (
          <div
            key={foto.id}
            className="bg-card border border-border rounded-lg overflow-hidden flex flex-col cursor-pointer shadow-sm hover:shadow-md hover:border-border-strong transition-all group"
            onClick={() => onSelectPhoto(url)}
          >
            {/* Image Container */}
            <div className="relative h-48 bg-slate-900 overflow-hidden">
              <img
                src={url}
                alt={foto.descricao || 'Foto do Diário'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Stage Badge on Top Left */}
              <div className="absolute top-3 left-3">
                <EtapaBadge
                  etapa={foto.etapa}
                  className="bg-slate-950/85 backdrop-blur-sm text-[#38bdf8] border-none"
                />
              </div>

              {/* Zoom Icon Overlay Top Right */}
              <div className="absolute top-3 right-3 bg-slate-950/65 p-1.5 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 size={14} />
              </div>
            </div>

            {/* Content & Metadata */}
            <div className="p-3.5 flex flex-col gap-1.5 flex-1">
              <p className="text-xs md:text-sm font-semibold text-content-main leading-snug line-clamp-2">
                {foto.descricao || 'Registro diário de evolução da obra'}
              </p>

              <div className="flex items-center gap-1.5 text-xs text-content-dim mt-auto border-t border-border-light pt-2 font-body tabular-nums">
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
