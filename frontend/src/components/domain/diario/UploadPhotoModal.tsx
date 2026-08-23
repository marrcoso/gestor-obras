import React, { useState } from 'react';
import { Modal } from '../../ui/Modal.js';
import { FormInput, FormSelect, FormGroup } from '../../ui/Input.js';
import { Button } from '../../ui/Button.js';
import { Camera, UploadCloud } from 'lucide-react';

export interface UploadPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    etapa: string;
    descricao: string;
    arquivoFoto: File | null;
    fotoUrlManual: string;
  }) => Promise<void>;
  saving: boolean;
}

export const UploadPhotoModal: React.FC<UploadPhotoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  saving
}) => {
  const [etapa, setEtapa] = useState('FUNDACAO_ESTRUTURA');
  const [descricao, setDescricao] = useState('');
  const [arquivoFoto, setArquivoFoto] = useState<File | null>(null);
  const [fotoUrlManual, setFotoUrlManual] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivoFoto && !fotoUrlManual) {
      alert('Selecione um arquivo de foto ou informe uma URL.');
      return;
    }

    await onSave({
      etapa,
      descricao,
      arquivoFoto,
      fotoUrlManual
    });

    setDescricao('');
    setArquivoFoto(null);
    setFotoUrlManual('');
  };

  const etapas = [
    { value: 'SERVICOS_PRELIMINARES', label: 'Serviços Preliminares & Canteiro' },
    { value: 'FUNDACAO_ESTRUTURA', label: 'Fundação & Estrutura de Concreto' },
    { value: 'ALVENARIA_VEDACAO', label: 'Alvenaria & Paredes' },
    { value: 'COBERTURA_TELHADO', label: 'Cobertura & Telhado' },
    { value: 'INSTALACOES_ELETRICA_HIDRAULICA', label: 'Instalações Elétricas & Hidráulicas' },
    { value: 'REVESTIMENTO_ACABAMENTO', label: 'Revestimento, Piso & Azulejos' },
    { value: 'PINTURA_VIDROS', label: 'Pintura & Esquadrias' },
    { value: 'ENTREGA_LIMPEZA', label: 'Limpeza & Entrega das Chaves' },
    { value: 'GERAL', label: 'Geral / Outros' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Camera size={18} className="text-brand" />
          <span>Upload de Foto do Diário de Obra</span>
        </div>
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <FormSelect
          label="Etapa Construtiva"
          value={etapa}
          onChange={(e) => setEtapa(e.target.value)}
          options={etapas}
        />

        <FormInput
          label="Descrição / Detalhe da Evolução"
          placeholder="Ex: Concretagem da laje do 2º pavimento finalizada"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
        />

        {/* Upload Box */}
        <FormGroup label="Arquivo da Foto">
          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center bg-surface-low hover:bg-surface-container transition-colors cursor-pointer">
            <input
              type="file"
              id="foto-input"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setArquivoFoto(e.target.files[0]);
                }
              }}
            />
            <label htmlFor="foto-input" className="cursor-pointer flex flex-col items-center gap-1.5">
              <UploadCloud size={24} className="text-brand" />
              <span className="text-xs md:text-sm font-semibold text-content-main">
                {arquivoFoto ? arquivoFoto.name : 'Selecionar imagem da galeria ou câmera'}
              </span>
              <span className="text-[11px] text-content-dim">
                JPG, PNG de alta resolução
              </span>
            </label>
          </div>
        </FormGroup>

        <FormInput
          label="Ou informe URL da Imagem"
          placeholder="https://..."
          value={fotoUrlManual}
          onChange={(e) => setFotoUrlManual(e.target.value)}
        />

        <div className="flex justify-end gap-2.5 mt-2">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button variant="primary" type="submit" isLoading={saving}>
            Salvar no Diário
          </Button>
        </div>
      </form>
    </Modal>
  );
};
