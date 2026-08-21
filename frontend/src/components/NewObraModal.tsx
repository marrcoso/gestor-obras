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
  const [clienteEmail, setClienteEmail] = useState('');
  const [enderecoCompleto, setEnderecoCompleto] = useState('');
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
        clienteEmail,
        enderecoCompleto,
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
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-light)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '16px' }}>Cadastrar Nova Obra (Centro de Custo)</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {error && (
            <div className="badge badge-danger" style={{ display: 'block', padding: '8px 12px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Nome da Obra / Projeto *</label>
            <input
              type="text"
              className="form-input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Residencial Alphaville - Lote 12"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Nome do Cliente Proprietário *</label>
              <input
                type="text"
                className="form-input"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder="Ex: Dr. Fernando Costa"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp do Cliente</label>
              <input
                type="text"
                className="form-input"
                value={clienteTelefone}
                onChange={(e) => setClienteTelefone(e.target.value)}
                placeholder="Ex: (11) 98888-7777"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Cidade</label>
              <input
                type="text"
                className="form-input"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Ex: Campinas"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estado (UF / SINAPI)</label>
              <select className="form-select" value={estadoUf} onChange={(e) => setEstadoUf(e.target.value)}>
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
            <div className="form-group">
              <label className="form-label">Data de Início *</label>
              <input
                type="date"
                className="form-input"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Orçamento Previsto (R$)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={orcamentoPrevisto}
                onChange={(e) => setOrcamentoPrevisto(e.target.value)}
                placeholder="Ex: 350000.00"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <Plus size={16} />
              {loading ? 'Cadastrando...' : 'Criar Obra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
