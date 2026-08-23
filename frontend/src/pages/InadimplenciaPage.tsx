import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { ContaReceber, InadimplenciaRadarData } from '../types/index.js';
import { api } from '../services/api.js';
import {
  AlertTriangle,
  MessageSquare,
  Check,
  Calendar,
  DollarSign,
  Plus,
  Clock,
  Download,
  Search,
  Gavel,
  CheckCircle,
  Wallet,
  TrendingUp,
  X
} from 'lucide-react';
import { WhatsAppModal } from '../components/WhatsAppModal.js';

export const InadimplenciaPage: React.FC = () => {
  const { obras, selectedObra, refreshObras } = useAuth();
  const [radar, setRadar] = useState<InadimplenciaRadarData | null>(null);
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
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

  const filteredContas = contas.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.cliente_nome && c.cliente_nome.toLowerCase().includes(q)) ||
      (c.obra_nome && c.obra_nome.toLowerCase().includes(q)) ||
      (c.descricao_medicao && c.descricao_medicao.toLowerCase().includes(q))
    );
  });

  return (
    <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2.5vw, 24px)' }}>
      <WhatsAppModal
        contaId={selectedContaIdWhatsApp}
        onClose={() => setSelectedContaIdWhatsApp(null)}
        onSuccess={() => carregarDados()}
      />

      {/* Header Section */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
          paddingTop: '4px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 className="heading-page">
            Radar de Inadimplência
          </h1>
          <p className="text-subtitle">
            Visão geral dos recebimentos atrasados, réguas de cobrança e acionamento em 1 clique via WhatsApp.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => window.print()}
            className="btn-constructo btn-secondary-slate"
            style={{ gap: '6px' }}
          >
            <Download size={16} />
            <span className="text-mono-tag">Exportar Relatório</span>
          </button>

          <button
            onClick={() => setModalNovaConta(true)}
            className="btn-constructo btn-primary-orange"
            style={{ gap: '6px' }}
          >
            <Plus size={16} />
            <span className="text-mono-tag">Nova Medição</span>
          </button>
        </div>
      </section>

      {/* 4 Aging KPI Cards */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'clamp(12px, 1.5vw, 20px)'
        }}
      >
        {/* TOTAL VENCIDO */}
        <div className="stat-kpi-card group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="text-mono-tag" style={{ color: 'var(--text-muted)' }}>
              TOTAL VENCIDO
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-late)'
              }}
            >
              <Wallet size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="text-kpi-value" style={{ color: 'var(--status-late)' }}>
              {formatMoney(radar?.total_vencido || 0)}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <TrendingUp size={14} color="var(--status-late)" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--status-late)' }}>
                {radar?.total_clientes_inadimplentes || 0} contratos pendentes
              </span>
            </div>
          </div>
        </div>

        {/* 1-15 DIAS */}
        <div className="stat-kpi-card group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="text-mono-tag" style={{ color: 'var(--text-muted)' }}>
              1-15 DIAS
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-pending)'
              }}
            >
              <Clock size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="text-kpi-value">
              {formatMoney(radar?.aging.vencido_1_a_15_dias || 0)}
            </span>
            <span className="text-caption-responsive" style={{ marginTop: '4px' }}>
              Atraso leve (Lembrete cordial)
            </span>
          </div>
        </div>

        {/* 16-30 DIAS */}
        <div className="stat-kpi-card group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="text-mono-tag" style={{ color: 'var(--text-muted)' }}>
              16-30 DIAS
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(249, 115, 22, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-warning)'
              }}
            >
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="text-kpi-value">
              {formatMoney(radar?.aging.vencido_16_a_30_dias || 0)}
            </span>
            <span className="text-caption-responsive" style={{ marginTop: '4px' }}>
              Aviso de paralisação de etapa
            </span>
          </div>
        </div>

        {/* +30 DIAS (CRÍTICO) */}
        <div className="stat-kpi-card group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="text-mono-tag" style={{ color: 'var(--text-muted)' }}>
              +30 DIAS (CRÍTICO)
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-late)'
              }}
            >
              <Gavel size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="text-kpi-value" style={{ color: 'var(--status-late)' }}>
              {formatMoney(radar?.aging.vencido_mais_30_dias || 0)}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--status-late)', marginTop: '4px' }}>
              Encaminhado para cobrança jurídica
            </span>
          </div>
        </div>
      </section>

      {/* 2-Column Split Layout: Table (2/3) vs Visual Insight (1/3) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'clamp(16px, 2vw, 24px)'
        }}
      >
        {/* Left: Overdue Invoices Table (2/3) */}
        <section style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column' }}>
          <div
            className="card-constructo"
            style={{
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Table Header Bar */}
            <div
              style={{
                padding: '16px 20px',
                backgroundColor: 'var(--bg-surface-low)',
                borderBottom: '2px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <h2 className="heading-section" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="var(--status-late)" />
                Faturas & Medições em Atraso
              </h2>

              <div style={{ position: 'relative', width: '220px' }}>
                <Search
                  size={15}
                  color="var(--text-dim)"
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input-constructo"
                  style={{ paddingLeft: '32px', minHeight: '34px', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table className="table-constructo">
                <thead>
                  <tr>
                    <th style={{ width: '28%' }}>Cliente / Obra</th>
                    <th>Parcela</th>
                    <th style={{ textAlign: 'right' }}>Vencimento</th>
                    <th style={{ textAlign: 'right' }}>Valor</th>
                    <th style={{ textAlign: 'center', width: '15%' }}>Status</th>
                    <th style={{ textAlign: 'right', width: '18%' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContas.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                        Nenhuma fatura em atraso encontrada.
                      </td>
                    </tr>
                  ) : (
                    filteredContas.map((conta) => {
                      const isRecebido = conta.status === 'RECEBIDO';
                      const isLate = conta.is_vencido || conta.status === 'ATRASADO';
                      const dias = conta.dias_atraso || 0;

                      return (
                        <tr
                          key={conta.id}
                          style={{
                            backgroundColor: isLate && !isRecebido ? 'var(--status-late-bg)' : 'transparent'
                          }}
                        >
                          {/* Cliente / Obra */}
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                {conta.cliente_nome}
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                {conta.obra_nome}
                              </span>
                            </div>
                          </td>

                          {/* Parcela */}
                          <td style={{ color: 'var(--text-muted)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span>{conta.numero_parcela}ª Parcela</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                {conta.descricao_medicao}
                              </span>
                            </div>
                          </td>

                          {/* Vencimento com Badge de Dias */}
                          <td className="font-data-tabular" style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                              <span style={{ fontWeight: 600, color: isLate ? 'var(--status-late)' : 'var(--text-main)' }}>
                                {conta.data_vencimento ? conta.data_vencimento.split('-').reverse().join('/') : '—'}
                              </span>
                              {isLate && !isRecebido && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    backgroundColor: dias > 30 ? 'var(--status-late)' : 'var(--status-warning)',
                                    color: '#ffffff',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontFamily: 'var(--font-body)',
                                    letterSpacing: '0.02em',
                                    marginTop: '2px'
                                  }}
                                >
                                  {dias} dias
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Valor */}
                          <td
                            className="font-data-tabular"
                            style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}
                          >
                            {formatMoney(conta.valor)}
                          </td>

                          {/* Status */}
                          <td style={{ textAlign: 'center' }}>
                            {isRecebido ? (
                              <span className="chip-status status-pago">RECEBIDO</span>
                            ) : dias > 30 ? (
                              <span className="chip-status status-critico">CRÍTICO</span>
                            ) : dias > 15 ? (
                              <span className="chip-status status-atencao">ATENÇÃO</span>
                            ) : (
                              <span className="chip-status status-recente">RECENTE</span>
                            )}
                          </td>

                          {/* Ações */}
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                              {!isRecebido && (
                                <>
                                  <button
                                    onClick={() => setSelectedContaIdWhatsApp(conta.id)}
                                    className="btn-constructo btn-whatsapp"
                                    style={{ padding: '6px 10px', minHeight: '30px', fontSize: '11px', gap: '4px' }}
                                    title="Disparar Lembrete no WhatsApp"
                                  >
                                    <MessageSquare size={14} /> WhatsApp
                                  </button>

                                  <button
                                    onClick={() => handleMarcarRecebido(conta.id)}
                                    className="btn-constructo btn-tech-blue"
                                    style={{ padding: '6px 10px', minHeight: '30px', fontSize: '11px', gap: '4px' }}
                                    title="Dar Baixa e creditar no caixa"
                                  >
                                    <Check size={14} />
                                  </button>
                                </>
                              )}
                              {isRecebido && (
                                <span style={{ fontSize: '12px', color: 'var(--status-paid)', fontWeight: 600 }}>
                                  ✓ Liquidado
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
          </div>
        </section>

        {/* Right: Visual Analysis Card (1/3) */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            className="card-constructo"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%'
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: '17px',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginBottom: '12px'
                }}
              >
                Análise Visual de Inadimplência
              </h3>

              <div
                style={{
                  height: '180px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundColor: '#0f172a'
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
                  alt="Análise visual de recebíveis"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.2) 100%)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '14px'
                  }}
                >
                  <span className="text-mono-tag" style={{ fontSize: '10px', color: '#ffb690' }}>
                    CURVA DE RECEBÍVEIS • CONCENTRAÇÃO RESIDENCIAL
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                A régua inteligente de cobrança via WhatsApp reduz em até <strong>78%</strong> os atrasos médios na entrega de chaves e marcos estruturais.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Modal Nova Medição / Parcela */}
      {modalNovaConta && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)'
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Cadastrar Nova Medição / Parcela</h3>
              <button
                onClick={() => setModalNovaConta(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSalvarConta} style={{ padding: '20px' }}>
              <div className="form-group-constructo">
                <label className="form-label-constructo">Obra Vinculada *</label>
                <select
                  className="form-select-constructo"
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
                <div className="form-group-constructo">
                  <label className="form-label-constructo">Nº Parcela</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input-constructo"
                    value={numeroParcela}
                    onChange={(e) => setNumeroParcela(e.target.value)}
                  />
                </div>

                <div className="form-group-constructo">
                  <label className="form-label-constructo">Descrição do Marco *</label>
                  <input
                    type="text"
                    className="form-input-constructo"
                    value={descricaoMedicao}
                    onChange={(e) => setDescricaoMedicao(e.target.value)}
                    placeholder="Ex: Conclusão Alvenaria Térrea"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group-constructo">
                  <label className="form-label-constructo">Valor da Parcela (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input-constructo"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="form-group-constructo">
                  <label className="form-label-constructo">Data de Vencimento *</label>
                  <input
                    type="date"
                    className="form-input-constructo"
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
                  className="btn-constructo btn-secondary-slate"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="btn-constructo btn-primary-orange"
                >
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

