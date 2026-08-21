import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { ContaReceber, InadimplenciaRadarData } from '../types/index.js';
import { api } from '../services/api.js';
import {
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  Calendar,
  DollarSign,
  Plus,
  Clock,
  Send,
  Building2
} from 'lucide-react';
import { WhatsAppModal } from '../components/WhatsAppModal.js';

export const InadimplenciaPage: React.FC = () => {
  const { obras, selectedObra, refreshObras } = useAuth();
  const [radar, setRadar] = useState<InadimplenciaRadarData | null>(null);
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [selectedContaIdWhatsApp, setSelectedContaIdWhatsApp] = useState<string | null>(null);
  const [modalNovaConta, setModalNovaConta] = useState(false);

  // Form State
  const [obraIdForm, setObraIdForm] = useState(selectedObra?.id || '');
  const [numeroParcela, setNumeroParcela] = useState('1');
  const [descricaoMedicao, setDescricaoMedicao] = useState('');
  const [valor, setValor] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [radarData, contasData] = await Promise.all([
        api.getInadimplenciaRadar(),
        api.getContasReceber(selectedObra?.id)
      ]);
      setRadar(radarData);
      setContas(contasData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    if (selectedObra) setObraIdForm(selectedObra.id);
  }, [selectedObra]);

  const handleMarcarRecebido = async (id: string) => {
    if (!window.confirm('Confirmar recebimento deste valor? O montante será creditado imediatamente no fluxo de caixa da obra.')) return;
    try {
      await api.marcarContaRecebida(id);
      await carregarDados();
      await refreshObras();
    } catch (e: any) {
      alert(e.message || 'Erro ao dar baixa no título.');
    }
  };

  const handleSalvarConta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!obraIdForm || !descricaoMedicao || !valor || !dataVencimento) return;

    setSalvando(true);
    try {
      await api.createContaReceber({
        obraId: obraIdForm,
        numeroParcela: Number(numeroParcela),
        descricaoMedicao,
        valor: Number(valor),
        dataVencimento
      });
      setModalNovaConta(false);
      setDescricaoMedicao('');
      setValor('');
      setDataVencimento('');
      await carregarDados();
    } catch (e: any) {
      alert(e.message || 'Erro ao cadastrar parcela.');
    } finally {
      setSalvando(false);
    }
  };

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <div className="page-body">
      <WhatsAppModal
        contaId={selectedContaIdWhatsApp}
        onClose={() => setSelectedContaIdWhatsApp(null)}
        onSuccess={() => carregarDados()}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '20px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Radar de Inadimplência & Contas a Receber</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Controle de medições atrasadas e acionamento de cobrança profissional em 1 clique via WhatsApp.
          </p>
        </div>

        <button onClick={() => setModalNovaConta(true)} className="btn btn-primary">
          <Plus size={16} /> Nova Medição / Parcela
        </button>
      </div>

      {/* Aging e Totais de Inadimplência */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '24px'
        }}
      >
        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <span style={{ fontSize: '11px', color: '#f87171', fontWeight: 700 }}>TOTAL VENCIDO (INADIMPLENTE)</span>
          <p style={{ fontSize: '22px', fontWeight: 800, color: '#ef4444' }}>
            {formatMoney(radar?.total_vencido || 0)}
          </p>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
            {radar?.total_clientes_inadimplentes || 0} título(s) em atraso
          </span>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 700 }}>VENCIDO DE 1 A 15 DIAS</span>
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#fbbf24' }}>
            {formatMoney(radar?.aging.vencido_1_a_15_dias || 0)}
          </p>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Atraso leve (Lembrete cordial)</span>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #f97316' }}>
          <span style={{ fontSize: '11px', color: '#fb923c', fontWeight: 700 }}>VENCIDO DE 16 A 30 DIAS</span>
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#fb923c' }}>
            {formatMoney(radar?.aging.vencido_16_a_30_dias || 0)}
          </p>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Atraso médio (Aviso de paralisação)</span>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #dc2626' }}>
          <span style={{ fontSize: '11px', color: '#f87171', fontWeight: 700 }}>VENCIDO HÁ MAIS DE 30 DIAS</span>
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#dc2626' }}>
            {formatMoney(radar?.aging.vencido_mais_30_dias || 0)}
          </p>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Atraso crítico</span>
        </div>
      </div>

      {/* Tabela de Títulos a Receber */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--bg-input)',
                borderBottom: '1px solid var(--border)',
                fontSize: '12px',
                color: 'var(--text-muted)'
              }}
            >
              <th style={{ padding: '12px 16px' }}>Status / Atraso</th>
              <th style={{ padding: '12px 16px' }}>Obra & Cliente</th>
              <th style={{ padding: '12px 16px' }}>Parcela / Medição</th>
              <th style={{ padding: '12px 16px' }}>Vencimento</th>
              <th style={{ padding: '12px 16px' }}>Valor</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Ações de Cobrança</th>
            </tr>
          </thead>
          <tbody>
            {contas.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  Nenhum título a receber cadastrado.
                </td>
              </tr>
            ) : (
              contas.map((conta) => {
                const isRecebido = conta.status === 'RECEBIDO';
                const isAtrasado = conta.is_vencido || conta.status === 'ATRASADO';

                return (
                  <tr
                    key={conta.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      fontSize: '13.5px',
                      backgroundColor: isAtrasado ? 'rgba(239, 68, 68, 0.04)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      {isRecebido ? (
                        <span className="badge badge-success" style={{ fontSize: '10px' }}>
                          <CheckCircle2 size={12} /> Recebido
                        </span>
                      ) : isAtrasado ? (
                        <span className="badge badge-danger" style={{ fontSize: '10px' }}>
                          <AlertTriangle size={12} /> {conta.dias_atraso || 1} dias de atraso
                        </span>
                      ) : (
                        <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                          <Clock size={12} /> A Vencer
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontWeight: 700, color: '#fff' }}>{conta.obra_nome}</p>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {conta.cliente_nome} {conta.cliente_telefone ? `• ${conta.cliente_telefone}` : ''}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontWeight: 600 }}>{conta.numero_parcela}ª Parcela</p>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{conta.descricao_medicao}</span>
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{conta.data_vencimento}</td>

                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>
                      {formatMoney(conta.valor)}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        {!isRecebido && (
                          <>
                            <button
                              onClick={() => setSelectedContaIdWhatsApp(conta.id)}
                              className="btn"
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                backgroundColor: '#25D366',
                                color: '#fff',
                                gap: '6px'
                              }}
                              title="Cobrar via WhatsApp"
                            >
                              <MessageSquare size={14} /> Cobrar WhatsApp
                            </button>

                            <button
                              onClick={() => handleMarcarRecebido(conta.id)}
                              className="btn btn-success"
                              style={{ padding: '6px 12px', fontSize: '12px', gap: '4px' }}
                              title="Dar Baixa e creditar no caixa da obra"
                            >
                              <CheckCircle2 size={14} /> Dar Baixa
                            </button>
                          </>
                        )}
                        {isRecebido && (
                          <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
                            Creditado no Caixa
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Nova Conta a Receber */}
      {modalNovaConta && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-light)'
              }}
            >
              <h3 style={{ fontSize: '16px' }}>Cadastrar Nova Parcela / Medição</h3>
              <button
                onClick={() => setModalNovaConta(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarConta} style={{ padding: '20px' }}>
              <div className="form-group">
                <label className="form-label">Obra Vinculada *</label>
                <select
                  className="form-select"
                  value={obraIdForm}
                  onChange={(e) => setObraIdForm(e.target.value)}
                  required
                >
                  <option value="">Selecione uma obra</option>
                  {obras.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nome} ({o.cliente_nome})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Nº Parcela</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={numeroParcela}
                    onChange={(e) => setNumeroParcela(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Descrição do Marco / Medição *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={descricaoMedicao}
                    onChange={(e) => setDescricaoMedicao(e.target.value)}
                    placeholder="Ex: Conclusão do Telhado e Reboco"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Valor da Parcela (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Data de Vencimento *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setModalNovaConta(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={salvando} className="btn btn-primary">
                  {salvando ? 'Salvando...' : 'Cadastrar Parcela'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
