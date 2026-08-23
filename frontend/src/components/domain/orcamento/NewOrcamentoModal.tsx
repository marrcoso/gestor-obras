import React, { useState } from 'react';
import { Modal } from '../../ui/Modal.js';
import { FormInput } from '../../ui/Input.js';
import { Button } from '../../ui/Button.js';
import { Plus } from 'lucide-react';

export interface NewOrcamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (titulo: string) => Promise<void>;
  bdiPadrao: number;
}

export const NewOrcamentoModal: React.FC<NewOrcamentoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  bdiPadrao
}) => {
  const [titulo, setTitulo] = useState('Orçamento Base da Obra');
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo) return;

    setSalvando(true);
    try {
      await onSave(titulo);
      setTitulo('Orçamento Base da Obra');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} color="var(--primary)" />
          <span>Criar Nova Planilha Orçamentária</span>
        </div>
      }
      size="sm"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <FormInput
          label="Título da Planilha / Versão"
          placeholder="Ex: Orçamento Executivo R01 - Reforma Geral"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />

        <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
          O BDI inicial será configurado como <strong>{bdiPadrao}%</strong> e poderá ser ajustado a qualquer momento.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button variant="primary" type="submit" isLoading={salvando}>
            Criar Orçamento
          </Button>
        </div>
      </form>
    </Modal>
  );
};
