import React, { useState } from 'react';
import { Modal } from '../../ui/Modal.js';
import { FormInput, FormSelect, FormGroup } from '../../ui/Input.js';
import { Button } from '../../ui/Button.js';
import { Paperclip, Plus, X } from 'lucide-react';

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

    // Reset Form
    setDescricao('');
    setValor('');
    setFornecedor('');
    setArquivoComprovante(null);
  };

  const categorias = [
    { value: 'MATERIAL_BASICO', label: 'Material Básico (Cimento, Aço, Areia)' },
    { value: 'MATERIAL_ACABAMENTO', label: 'Material de Acabamento (Pisos, Tintas)' },
    { value: 'MAO_DE_OBRA_DIARIA', label: 'Mão de Obra / Diárias de Pedreiro' },
    { value: 'EMPREITEIRO_TERCEIRO', label: 'Empreiteiro / Subempreiteiro' },
    { value: 'EQUIPAMENTO_LOCACAO', label: 'Locação de Equipamentos / Andaimes' },
    { value: 'TRANSPORTE_FRETE', label: 'Transporte, Frete & Caçambas' },
    { value: 'ALIMENTACAO_CAMPO', label: 'Alimentação do Canteiro' },
    { value: 'PROJETO_TAXAS', label: 'Projetos, ART & Taxas da Prefeitura' },
    { value: 'RECEBIMENTO_CLIENTE', label: 'Medição / Recebimento de Cliente' },
    { value: 'OUTROS', label: 'Outras Despesas' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} color="var(--primary)" />
          <span>Novo Lançamento Financeiro</span>
        </div>
      }
      size="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Toggle Tipo: Despesa vs Receita */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setTipo('DESPESA')}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: `2px solid ${tipo === 'DESPESA' ? 'var(--status-late)' : 'var(--border)'}`,
              backgroundColor: tipo === 'DESPESA' ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-surface-low)',
              color: tipo === 'DESPESA' ? 'var(--status-late)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            - DESPESA (Saída)
          </button>

          <button
            type="button"
            onClick={() => setTipo('RECEITA')}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: `2px solid ${tipo === 'RECEITA' ? 'var(--status-paid)' : 'var(--border)'}`,
              backgroundColor: tipo === 'RECEITA' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface-low)',
              color: tipo === 'RECEITA' ? 'var(--status-paid)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            + RECEITA (Entrada)
          </button>
        </div>

        <FormInput
          label="Descrição do Lançamento"
          placeholder="Ex: 50 sacos de cimento Votoran"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FormInput
            label="Valor (R$)"
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

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
          <FormSelect
            label="Categoria de Custo"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            options={categorias}
          />

          <FormSelect
            label="Status de Pagamento"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'PAGO' | 'PENDENTE')}
            options={[
              { value: 'PAGO', label: 'Pago (Liquidado)' },
              { value: 'PENDENTE', label: 'Pendente (A Pagar)' }
            ]}
          />
        </div>

        <FormInput
          label="Fornecedor / Beneficiário"
          placeholder="Ex: Depósito Santa Cecília Ltda"
          value={fornecedor}
          onChange={(e) => setFornecedor(e.target.value)}
        />

        {/* Upload Comprovante */}
        <FormGroup label="Anexar Comprovante / Nota Fiscal">
          <div
            style={{
              border: '2px dashed var(--border)',
              borderRadius: '8px',
              padding: '14px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface-low)',
              cursor: 'pointer'
            }}
          >
            <input
              type="file"
              id="comprovante-input"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setArquivoComprovante(e.target.files[0]);
                }
              }}
            />
            <label htmlFor="comprovante-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <Paperclip size={20} color="var(--primary)" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                {arquivoComprovante ? arquivoComprovante.name : 'Clique para selecionar foto ou PDF'}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                PNG, JPG, PDF de até 10MB
              </span>
            </label>
          </div>
        </FormGroup>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button variant="primary" type="submit" isLoading={saving}>
            Confirmar Lançamento
          </Button>
        </div>
      </form>
    </Modal>
  );
};
