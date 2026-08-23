import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { TransacaoFinanceira, FluxoResumo } from '../types/index.js';
import { api } from '../services/api.js';
import {
  Plus,
  ArrowDown,
  ArrowUp,
  Clock,
  Check,
  AlertTriangle,
  Download,
  Search,
  Paperclip,
  Trash2,
  Calendar,
  Building2,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { ReceiptModal } from '../components/ReceiptModal.js';

export const FluxoCaixaPage: React.FC = () => {
  const { selectedObra, refreshObras } = useAuth();
  const [transacoes, setTransacoes] = useState<TransacaoFinanceira[]>([]);
  const [resumo, setResumo] = useState<FluxoResumo | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [selectedComprovante, setSelectedComprovante] = useState<string | null>(null);

  // Form State
  const [tipo, setTipo] = useState<'DESPESA' | 'RECEITA'>('DESPESA');
  const [categoria, setCategoria] = useState('MATERIAL_BASICO');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dataVencimento, setDataVencimento] = useState(new Date().toISOString().split('T')[0]);
  const [fornecedor, setFornecedor] = useState('');
  const [status, setStatus] = useState<'PAGO' | 'PENDENTE'>('PAGO');
  const [arquivoComprovante, setArquivoComprovante] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [transData, resumoData] = await Promise.all([
        api.getTransacoes({
          obraId: selectedObra?.id,
          tipo: filtroTipo || undefined,
          categoria: filtroCategoria || undefined
        }),
        api.getFluxoResumo(selectedObra?.id)
      ]);
      setTransacoes(transData);
      setResumo(resumoData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [selectedObra, filtroTipo, filtroCategoria]);

  const handleToggleStatus = async (item: TransacaoFinanceira) => {
    const novoStatus = item.status === 'PAGO' ? 'PENDENTE' : 'PAGO';
    await api.updateTransacaoStatus(item.id, novoStatus);
    await carregarDados();
    await refreshObras();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja excluir este lançamento financeiro?')) return;
    await api.updateTransacaoStatus(id, 'CANCELADO' as any);
    await carregarDados();
    await refreshObras();
  };

  const handleSalvarLancamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor || !selectedObra) return;

    setSalvando(true);
    try {
      let comprovanteUrl: string | undefined = undefined;
      if (arquivoComprovante) {
        const uploadRes = await api.uploadFile(arquivoComprovante, 'comprovantes');
        comprovanteUrl = uploadRes.url;
      }

      await api.createTransacao({
        obraId: selectedObra.id,
        tipo,
        categoria,
        descricao,
        valor: Number(valor),
        dataVencimento,
        dataCompetencia: dataVencimento,
        fornecedorBeneficiario: fornecedor,
        status,
        comprovanteUrl,
        origemLancamento: 'WEB'
      });

      setModalNovoAberto(false);
      setDescricao('');
      setValor('');
      setFornecedor('');
      setArquivoComprovante(null);
      await carregarDados();
      await refreshObras();
    } catch (e: any) {
      alert(e.message || 'Erro ao registrar lançamento.');
    } finally {
      setSalvando(false);
    }
  };

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  // Filter items in memory based on status & search
  const filteredTransacoes = transacoes.filter((t) => {
    if (filtroStatus && t.status !== filtroStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.descricao.toLowerCase().includes(q) ||
        (t.fornecedor_beneficiario && t.fornecedor_beneficiario.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2.5vw, 24px)' }}>
      <ReceiptModal url={selectedComprovante} onClose={() => setSelectedComprovante(null)} />

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
            Fluxo de Caixa
          </h1>
          <p
            className="text-subtitle"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Building2 size={16} color="var(--technical-blue)" />
            {selectedObra ? selectedObra.nome : 'Todas as Obras • Centro Consolidado'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => window.print()}
            className="btn-constructo btn-secondary-slate"
            style={{ gap: '6px' }}
          >
            <Download size={16} />
            <span className="text-mono-tag">EXPORTAR</span>
          </button>

          <button
            onClick={() => setModalNovoAberto(true)}
            className="btn-constructo btn-primary-orange"
            style={{ gap: '6px' }}
          >
            <Plus size={16} />
            <span className="text-mono-tag">NOVO REGISTRO</span>
          </button>
        </div>
      </section>

      {/* 4 KPI Cards */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'clamp(12px, 1.5vw, 20px)'
        }}
      >
        {/* ENTRADAS */}
        <div className="stat-kpi-card group">
          <ArrowDown className="kpi-watermark-icon" color="var(--technical-blue)" />
          <span
            className="text-mono-tag"
            style={{
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowDown size={14} color="var(--technical-blue)" /> ENTRADAS
          </span>
          <span className="text-kpi-value">
            {formatMoney(resumo?.total_receitas || 0)}
          </span>
        </div>

        {/* DESPESAS PAGAS */}
        <div className="stat-kpi-card group">
          <ArrowUp className="kpi-watermark-icon" color="var(--status-late)" />
          <span
            className="text-mono-tag"
            style={{
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowUp size={14} color="var(--status-late)" /> DESPESAS PAGAS
          </span>
          <span className="text-kpi-value">
            {formatMoney(resumo?.total_despesas || 0)}
          </span>
        </div>

        {/* SALDO ATUAL */}
        <div className="stat-kpi-card group">
          <span
            className="text-mono-tag"
            style={{
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            SALDO ATUAL DA OBRA
          </span>
          <span className="text-kpi-value">
            {formatMoney(resumo?.saldo_liquido || 0)}
          </span>
        </div>

        {/* A PAGAR */}
        <div className="stat-kpi-card group">
          <Clock className="kpi-watermark-icon" color="var(--status-warning)" />
          <span
            className="text-mono-tag"
            style={{
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Clock size={14} color="var(--status-warning)" /> A PAGAR (PENDENTE)
          </span>
          <span className="text-kpi-value">
            {formatMoney(resumo?.total_despesas_pendentes || 0)}
          </span>
        </div>
      </section>

      {/* Main Table Container & Filters */}
      <div
        className="card-constructo"
        style={{
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Filter Bar */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--bg-surface-low)',
            borderBottom: '1px solid var(--border)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            alignItems: 'flex-end'
          }}
        >
          {/* Período */}
          <div className="form-group-constructo" style={{ marginBottom: 0 }}>
            <label className="form-label-constructo">PERÍODO</label>
            <div style={{ position: 'relative' }}>
              <Calendar
                size={16}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                readOnly
                value="Todos os Lançamentos"
                className="form-input-constructo"
                style={{ paddingLeft: '34px', cursor: 'default' }}
              />
            </div>
          </div>

          {/* Categoria */}
          <div className="form-group-constructo" style={{ marginBottom: 0 }}>
            <label className="form-label-constructo">CATEGORIA</label>
            <select
              className="form-select-constructo"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <option value="">Todas as Categorias</option>
              <option value="MATERIAL_BASICO">Material Básico</option>
              <option value="MATERIAL_ACABAMENTO">Material Acabamento</option>
              <option value="MAO_DE_OBRA_DIARIA">Mão de Obra</option>
              <option value="EMPREITEIRO_TERCEIRO">Empreiteiro</option>
              <option value="EQUIPAMENTO_LOCACAO">Locação de Equipamento</option>
              <option value="TRANSPORTE_FRETE">Frete / Caçamba</option>
              <option value="RECEBIMENTO_CLIENTE">Recebimento de Cliente</option>
            </select>
          </div>

          {/* Status */}
          <div className="form-group-constructo" style={{ marginBottom: 0 }}>
            <label className="form-label-constructo">STATUS</label>
            <select
              className="form-select-constructo"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="">Todos os Status</option>
              <option value="PAGO">Pago</option>
              <option value="PENDENTE">Aguardando / Pendente</option>
            </select>
          </div>

          {/* Busca */}
          <div className="form-group-constructo" style={{ marginBottom: 0 }}>
            <label className="form-label-constructo">BUSCA</label>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Buscar descrição ou fornecedor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input-constructo"
                style={{ paddingLeft: '34px' }}
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="table-constructo">
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>STATUS</th>
                <th style={{ width: '120px' }}>DATA</th>
                <th>DESCRIÇÃO & CATEGORIA</th>
                <th>FORNECEDOR</th>
                <th style={{ textAlign: 'right', width: '160px' }}>VALOR</th>
                <th style={{ width: '80px', textAlign: 'center' }}>ANEXO</th>
                <th style={{ width: '60px', textAlign: 'center' }}>AÇÃO</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransacoes.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    Nenhum lançamento encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredTransacoes.map((t) => {
                  const isPago = t.status === 'PAGO';
                  const isReceita = t.tipo === 'RECEITA';
                  const isLate = !isPago && new Date(t.data_vencimento) < new Date();

                  return (
                    <tr key={t.id}>
                      {/* Circular Status Icon Button */}
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        <button
                          onClick={() => handleToggleStatus(t)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: isPago
                              ? 'var(--status-paid)'
                              : isLate
                              ? 'var(--status-late)'
                              : 'var(--status-warning)',
                            color: '#ffffff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          title={isPago ? 'Marcar como Pendente' : 'Marcar como Pago'}
                        >
                          {isPago ? (
                            <Check size={14} />
                          ) : isLate ? (
                            <AlertTriangle size={13} />
                          ) : (
                            <Clock size={13} />
                          )}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="font-data-tabular" style={{ whiteSpace: 'nowrap', color: isLate ? 'var(--status-late)' : 'var(--text-main)' }}>
                        {t.data_vencimento ? t.data_vencimento.split('-').reverse().join('/') : '—'}
                      </td>

                      {/* Description & Category */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t.descricao}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                            {t.tipo === 'RECEITA' ? 'Receita / ' : 'Despesa / '}
                            {t.categoria.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>

                      {/* Supplier */}
                      <td style={{ color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{t.fornecedor_beneficiario || 'Geral'}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                            {t.origem_lancamento === 'MOBILE' ? '📱 Canteiro' : '💻 Escritório'}
                          </span>
                        </div>
                      </td>

                      {/* Value */}
                      <td
                        className="font-data-tabular"
                        style={{
                          textAlign: 'right',
                          fontWeight: 700,
                          color: isReceita ? 'var(--status-paid)' : 'var(--status-late)'
                        }}
                      >
                        {isReceita ? '+' : '-'} {formatMoney(t.valor)}
                      </td>

                      {/* Attachment */}
                      <td style={{ textAlign: 'center' }}>
                        {t.comprovante_url ? (
                          <button
                            onClick={() => setSelectedComprovante(t.comprovante_url || null)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--technical-blue)',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title="Ver Comprovante"
                          >
                            <Paperclip size={18} />
                          </button>
                        ) : (
                          <span style={{ color: 'var(--border-strong)' }}>—</span>
                        )}
                      </td>

                      {/* Delete Action */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleDelete(t.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title="Excluir Lançamento"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--bg-surface-container)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            color: 'var(--text-muted)'
          }}
        >
          <span>Mostrando {filteredTransacoes.length} de {transacoes.length} registros</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              disabled
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '4px 8px',
                color: 'var(--text-dim)',
                cursor: 'not-allowed'
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '12px' }}>Página 1</span>
            <button
              disabled
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '4px 8px',
                color: 'var(--text-dim)',
                cursor: 'not-allowed'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Projection Chart Card */}
      <div
        style={{
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          position: 'relative',
          height: '160px',
          backgroundColor: '#0f172a',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80"
          alt="Análise Visual de Fluxo de Caixa"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '20px'
          }}
        >
          <span className="text-mono-tag" style={{ fontSize: '11px', color: '#38bdf8' }}>
            ANÁLISE FINANCEIRA AUTOMATIZADA
          </span>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
            Curva de Desembolso & Projeção de Saldo da Obra
          </h3>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.75)', marginTop: '2px' }}>
            O caixa isolado desta obra garante segurança jurídica e controle absoluto contra desvios de centro de custo.
          </p>
        </div>
      </div>

      {/* New Transaction Modal */}
      {modalNovoAberto && (
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
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Novo Lançamento Financeiro</h3>
              <button
                onClick={() => setModalNovoAberto(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSalvarLancamento} style={{ padding: '20px' }}>
              {/* Type Switcher */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setTipo('DESPESA')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: tipo === 'DESPESA' ? 'var(--status-late)' : 'var(--bg-surface-container)',
                    color: tipo === 'DESPESA' ? '#ffffff' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <ArrowUp size={16} /> Despesa (Saída)
                </button>
                <button
                  type="button"
                  onClick={() => setTipo('RECEITA')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: tipo === 'RECEITA' ? 'var(--status-paid)' : 'var(--bg-surface-container)',
                    color: tipo === 'RECEITA' ? '#ffffff' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <ArrowDown size={16} /> Receita (Entrada)
                </button>
              </div>

              <div className="form-group-constructo">
                <label className="form-label-constructo">Descrição do Lançamento *</label>
                <input
                  type="text"
                  className="form-input-constructo"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Concreto Usinado FCK 30 - 15m³"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group-constructo">
                  <label className="form-label-constructo">Valor (R$) *</label>
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
                  <label className="form-label-constructo">Categoria *</label>
                  <select
                    className="form-select-constructo"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                  >
                    <option value="MATERIAL_BASICO">Material Básico</option>
                    <option value="MATERIAL_ACABAMENTO">Material Acabamento</option>
                    <option value="MAO_DE_OBRA_DIARIA">Mão de Obra Diária</option>
                    <option value="EMPREITEIRO_TERCEIRO">Empreiteiro / Terceiro</option>
                    <option value="EQUIPAMENTO_LOCACAO">Locação de Equipamento</option>
                    <option value="TRANSPORTE_FRETE">Frete / Caçamba</option>
                    <option value="ALIMENTACAO_CAMPO">Alimentação Campo</option>
                    <option value="RECEBIMENTO_CLIENTE">Recebimento de Cliente</option>
                    <option value="OUTROS">Outros</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group-constructo">
                  <label className="form-label-constructo">Fornecedor / Beneficiário</label>
                  <input
                    type="text"
                    className="form-input-constructo"
                    value={fornecedor}
                    onChange={(e) => setFornecedor(e.target.value)}
                    placeholder="Ex: Depósito São João"
                  />
                </div>

                <div className="form-group-constructo">
                  <label className="form-label-constructo">Data de Vencimento</label>
                  <input
                    type="date"
                    className="form-input-constructo"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group-constructo">
                <label className="form-label-constructo">Anexar Comprovante / Cupom Fiscal</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="form-input-constructo"
                  onChange={(e) => setArquivoComprovante(e.target.files ? e.target.files[0] : null)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setModalNovoAberto(false)}
                  className="btn-constructo btn-secondary-slate"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="btn-constructo btn-primary-orange"
                >
                  {salvando ? 'Salvando...' : 'Salvar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

