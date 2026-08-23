import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Plus } from 'lucide-react';
import { Modal } from '../../ui/Modal.js';
import { FormInput, FormSelect, FormGroup } from '../../ui/Input.js';
import { Button } from '../../ui/Button.js';

export interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    tipo: 'DESPESA' | 'RECEITA';
    categoria: string;
    descricao: string;
    valor: number;
    dataVencimento: string;
    fornecedorBeneficiario: string;
    status: 'PAGO' | 'PENDENTE';
    arquivoComprovante: File | null;
  }) => Promise<void>;
  saving: boolean;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  saving
}) => {
  const [tipo, setTipo] = useState<'DESPESA' | 'RECEITA'>('DESPESA');
  const [categoria, setCategoria] = useState('MATERIAL_BASICO');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dataVencimento, setDataVencimento] = useState(new Date().toISOString().split('T')[0]);
  const [fornecedor, setFornecedor] = useState('');
  const [status, setStatus] = useState<'PAGO' | 'PENDENTE'>('PAGO');
  const [arquivoComprovante, setArquivoComprovante] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor) return;

    await onSave({
      tipo,
      categoria,
      descricao,
      valor: Number(valor),
      dataVencimento,
      fornecedorBeneficiario: fornecedor,
      status,
      arquivoComprovante
    });

    setDescricao('');
    setValor('');
    setFornecedor('');
    setArquivoComprovante(null);
  };

  const categorias = [
    { value: 'MATERIAL_BASICO', label: 'Material Básico' },
    { value: 'MATERIAL_ACABAMENTO', label: 'Material Acabamento' },
    { value: 'MAO_DE_OBRA_DIARIA', label: 'Mão de Obra Diária' },
    { value: 'EMPREITEIRO_TERCEIRO', label: 'Empreiteiro / Terceiro' },
    { value: 'EQUIPAMENTO_LOCACAO', label: 'Locação de Equipamento' },
    { value: 'TRANSPORTE_FRETE', label: 'Frete / Caçamba' },
    { value: 'ALIMENTACAO_CAMPO', label: 'Alimentação Campo' },
    { value: 'RECEBIMENTO_CLIENTE', label: 'Recebimento de Cliente' },
    { value: 'OUTROS', label: 'Outros' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Plus size={18} className="text-brand" />
          <span>Novo Lançamento Financeiro</span>
        </div>
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {/* Type Switcher */}
        <div className="grid grid-cols-2 gap-2 mb-1">
          <button
            type="button"
            onClick={() => setTipo('DESPESA')}
            className={`p-2.5 rounded-md font-bold text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
              tipo === 'DESPESA'
                ? 'bg-status-late text-white shadow-xs'
                : 'bg-surface-container text-content-main hover:bg-surface-high'
            }`}
          >
            <ArrowUp size={16} /> Despesa (Saída)
          </button>
          <button
            type="button"
            onClick={() => setTipo('RECEITA')}
            className={`p-2.5 rounded-md font-bold text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
              tipo === 'RECEITA'
                ? 'bg-status-paid text-white shadow-xs'
                : 'bg-surface-container text-content-main hover:bg-surface-high'
            }`}
          >
            <ArrowDown size={16} /> Receita (Entrada)
          </button>
        </div>

        <FormInput
          label="Descrição do Lançamento"
          placeholder="Ex: Concreto Usinado FCK 30 - 15m³"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput
            label="Valor (R$)"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
          />

          <FormSelect
            label="Categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            options={categorias}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput
            label="Fornecedor / Beneficiário"
            placeholder="Ex: Depósito São João"
            value={fornecedor}
            onChange={(e) => setFornecedor(e.target.value)}
          />

          <FormInput
            label="Data de Vencimento"
            type="date"
            value={dataVencimento}
            onChange={(e) => setDataVencimento(e.target.value)}
            required
          />
        </div>

        <FormGroup label="Anexar Comprovante / Cupom Fiscal">
          <input
            type="file"
            accept="image/*,application/pdf"
            className="bg-input border border-border rounded-md px-3.5 py-2 font-body text-xs text-content-main w-full min-h-[38px] cursor-pointer"
            onChange={(e) => setArquivoComprovante(e.target.files ? e.target.files[0] : null)}
          />
        </FormGroup>

        <div className="flex justify-end gap-2.5 mt-2">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button variant="primary" type="submit" isLoading={saving}>
            Salvar Lançamento
          </Button>
        </div>
      </form>
    </Modal>
  );
};
