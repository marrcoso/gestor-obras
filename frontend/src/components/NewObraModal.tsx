import React, { useState } from 'react';
import { X, Building2, Plus } from 'lucide-react';
import { api } from '../services/api.js';

interface NewObraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewObraModal: React.FC<NewObraModalProps> = ({ isOpen, onClose, onSuccess }) => {
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

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Cadastrar Nova Obra (Centro de Custo)</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {error && (
            <div
              style={{
                backgroundColor: 'var(--status-late-bg)',
                color: 'var(--status-late)',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              {error}
            </div>
          )}

          <div className="form-group-constructo">
            <label className="form-label-constructo">Nome da Obra / Empreendimento *</label>
            <input
              type="text"
              className="form-input-constructo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Residencial Jardim Botânico"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group-constructo">
              <label className="form-label-constructo">Nome do Cliente Proprietário *</label>
              <input
                type="text"
                className="form-input-constructo"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder="Ex: Carlos Eduardo Silveira"
                required
              />
            </div>

            <div className="form-group-constructo">
              <label className="form-label-constructo">WhatsApp do Cliente</label>
              <input
                type="text"
                className="form-input-constructo"
                value={clienteTelefone}
                onChange={(e) => setClienteTelefone(e.target.value)}
                placeholder="Ex: (11) 98888-7777"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div className="form-group-constructo">
              <label className="form-label-constructo">Cidade</label>
              <input
                type="text"
                className="form-input-constructo"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Ex: São Paulo"
              />
            </div>

            <div className="form-group-constructo">
              <label className="form-label-constructo">Estado (UF / SINAPI)</label>
              <select className="form-select-constructo" value={estadoUf} onChange={(e) => setEstadoUf(e.target.value)}>
                <option value="SP">São Paulo (SP)</option>
                <option value="RJ">Rio de Janeiro (RJ)</option>
                <option value="MG">Minas Gerais (MG)</option>
                <option value="BA">Bahia (BA)</option>
                <option value="PR">Paraná (PR)</option>
                <option value="RS">Rio Grande do Sul (RS)</option>
                <option value="SC">Santa Catarina (SC)</option>
                <option value="GO">Goiás (GO)</option>
                <option value="PE">Pernambuco (PE)</option>
                <option value="CE">Ceará (CE)</option>
                <option value="DF">Distrito Federal (DF)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group-constructo">
              <label className="form-label-constructo">Data de Início *</label>
              <input
                type="date"
                className="form-input-constructo"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                required
              />
            </div>

            <div className="form-group-constructo">
              <label className="form-label-constructo">Orçamento Previsto (R$)</label>
              <input
                type="number"
                step="0.01"
                className="form-input-constructo"
                value={orcamentoPrevisto}
                onChange={(e) => setOrcamentoPrevisto(e.target.value)}
                placeholder="Ex: 500000.00"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} className="btn-constructo btn-secondary-slate">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-constructo btn-primary-orange">
              <Plus size={16} />
              {loading ? 'Cadastrando...' : 'Criar Obra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

