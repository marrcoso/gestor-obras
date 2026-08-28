import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Sparkles, AlertTriangle } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Modal } from './ui/Modal.js';
import { FormInput, FormSelect } from './ui/Input.js';
import { Button } from './ui/Button.js';

interface NewObraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewObraModal: React.FC<NewObraModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { billingOverview } = useAuth();
  const [nome, setNome] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [cidade, setCidade] = useState('');
  const [estadoUf, setEstadoUf] = useState('SP');
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [orcamentoPrevisto, setOrcamentoPrevisto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isLimitReached = Boolean(billingOverview?.usage.obras_atingiu_limite);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !clienteNome || !dataInicio) {
      setError('Por favor preencha os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.createObra({
        nome,
        clienteNome,
        clienteTelefone,
        cidade,
        estado_uf: estadoUf,
        dataInicio,
        orcamentoPrevisto: Number(orcamentoPrevisto || 0)
      } as any);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar obra.');
    } finally {
      setLoading(false);
    }
  };

  const estados = [
    { value: 'SP', label: 'São Paulo (SP)' },
    { value: 'RJ', label: 'Rio de Janeiro (RJ)' },
    { value: 'MG', label: 'Minas Gerais (MG)' },
    { value: 'BA', label: 'Bahia (BA)' },
    { value: 'PR', label: 'Paraná (PR)' },
    { value: 'RS', label: 'Rio Grande do Sul (RS)' },
    { value: 'SC', label: 'Santa Catarina (SC)' },
    { value: 'GO', label: 'Goiás (GO)' },
    { value: 'PE', label: 'Pernambuco (PE)' },
    { value: 'CE', label: 'Ceará (CE)' },
    { value: 'DF', label: 'Distrito Federal (DF)' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Building2 size={20} className="text-brand" />
          <span>Cadastrar Nova Obra (Centro de Custo)</span>
        </div>
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {isLimitReached && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
              <AlertTriangle size={16} />
              <span>Limite de Obras Ativas Atingido</span>
            </div>
            <p className="text-[11px] text-content-muted leading-relaxed">
              Sua construtora atingiu a capacidade máxima de {billingOverview?.usage.max_obras_ativas} obras simultâneas do Plano {billingOverview?.subscription.plano}.
            </p>
            <div className="pt-1">
              <Button
                type="button"
                variant="tech-blue"
                size="sm"
                icon={Sparkles}
                onClick={() => {
                  onClose();
                  navigate('/planos');
                }}
              >
                FAZER UPGRADE DE PLANO
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-status-late-bg text-status-late px-3.5 py-2.5 rounded-md text-xs font-medium border border-status-late/30">
            {error}
          </div>
        )}

        <FormInput
          label="Nome da Obra / Empreendimento"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Residencial Jardim Botânico"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput
            label="Nome do Cliente Proprietário"
            value={clienteNome}
            onChange={(e) => setClienteNome(e.target.value)}
            placeholder="Ex: Carlos Eduardo Silveira"
            required
          />

          <FormInput
            label="WhatsApp do Cliente"
            value={clienteTelefone}
            onChange={(e) => setClienteTelefone(e.target.value)}
            placeholder="Ex: (11) 98888-7777"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <FormInput
              label="Cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Ex: São Paulo"
            />
          </div>

          <FormSelect
            label="Estado (UF)"
            value={estadoUf}
            onChange={(e) => setEstadoUf(e.target.value)}
            options={estados}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput
            label="Data de Início"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            required
          />

          <FormInput
            label="Orçamento Previsto (R$)"
            type="number"
            step="0.01"
            value={orcamentoPrevisto}
            onChange={(e) => setOrcamentoPrevisto(e.target.value)}
            placeholder="Ex: 500000.00"
          />
        </div>

        <div className="flex justify-end gap-2.5 mt-2">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button variant="primary" type="submit" isLoading={loading} icon={Plus}>
            Criar Obra
          </Button>
        </div>
      </form>
    </Modal>
  );
};
