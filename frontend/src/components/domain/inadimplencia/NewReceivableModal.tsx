import React, { useState } from 'react';
import { Obra } from '../../../types/index.js';
import { Modal } from '../../ui/Modal.js';
import { FormInput, FormSelect } from '../../ui/Input.js';
import { Button } from '../../ui/Button.js';
import { Plus } from 'lucide-react';

export interface NewReceivableModalProps {
  isOpen: boolean;
  onClose: () => void;
  obras: Obra[];
  selectedObraId: string;
  onSave: (payload: {
    obraId: string;
    numeroParcela: number;
    descricaoMedicao: string;
    valor: number;
    dataVencimento: string;
  }) => Promise<void>;
  saving: boolean;
}

export const NewReceivableModal: React.FC<NewReceivableModalProps> = ({
  isOpen,
  onClose,
  obras,
  selectedObraId,
  onSave,
  saving
}) => {
  const [obraId, setObraId] = useState(selectedObraId || (obras[0]?.id || ''));
  const [numeroParcela, setNumeroParcela] = useState('1');
  const [descricaoMedicao, setDescricaoMedicao] = useState('');
  const [valor, setValor] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!obraId || !descricaoMedicao || !valor || !dataVencimento) return;

    await onSave({
      obraId,
      numeroParcela: Number(numeroParcela),
      descricaoMedicao,
      valor: Number(valor),
      dataVencimento
    });

    setDescricaoMedicao('');
    setValor('');
    setDataVencimento('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} color="var(--primary)" />
          <span>Cadastrar Nova Parcela / Medição</span>
        </div>
      }
      size="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <FormSelect
          label="Selecione a Obra"
          value={obraId}
          onChange={(e) => setObraId(e.target.value)}
          options={obras.map((o) => ({ value: o.id, label: `${o.nome} (${o.cliente_nome})` }))}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
          <FormInput
            label="Nº Parcela"
            type="number"
            min="1"
            value={numeroParcela}
            onChange={(e) => setNumeroParcela(e.target.value)}
            required
          />

          <FormInput
            label="Descrição da Medição / Etapa"
            placeholder="Ex: Conclusão da Alvenaria e Laje do 1º Pav."
            value={descricaoMedicao}
            onChange={(e) => setDescricaoMedicao(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FormInput
            label="Valor a Receber (R$)"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
          />

          <FormInput
            label="Data de Vencimento"
            type="date"
            value={dataVencimento}
            onChange={(e) => setDataVencimento(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button variant="primary" type="submit" isLoading={saving}>
            Cadastrar Parcela
          </Button>
        </div>
      </form>
    </Modal>
  );
};
