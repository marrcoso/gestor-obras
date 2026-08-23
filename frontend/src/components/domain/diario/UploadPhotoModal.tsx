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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Camera size={18} color="var(--primary)" />
          <span>Upload de Foto do Diário de Obra</span>
        </div>
      }
      size="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
          <div
            style={{
              border: '2px dashed var(--border)',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface-low)',
              cursor: 'pointer'
            }}
          >
            <input
              type="file"
              id="foto-input"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setArquivoFoto(e.target.files[0]);
                }
              }}
            />
            <label htmlFor="foto-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <UploadCloud size={24} color="var(--primary)" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                {arquivoFoto ? arquivoFoto.name : 'Selecionar imagem da galeria ou câmera'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
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
