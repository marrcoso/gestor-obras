import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { TransacaoFinanceira, FluxoResumo } from '../types/index.js';
import { api } from '../services/api.js';
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Paperclip,
  CheckCircle2,
  Clock,
  Filter,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { ReceiptModal } from '../components/ReceiptModal.js';

export const FluxoCaixaPage: React.FC = () => {
  const { selectedObra, obras, refreshObras } = useAuth();
  const [transacoes, setTransacoes] = useState<TransacaoFinanceira[]>([]);
  const [resumo, setResumo] = useState<FluxoResumo | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('');

  // Modais
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

  return (
    <div className="page-body">
      <ReceiptModal url={selectedComprovante} onClose={() => setSelectedComprovante(null)} />

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-primary">Centro de Custo</span>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
              {selectedObra ? selectedObra.nome : 'Todas as Obras'}
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            Fluxo de caixa segregado. Despesas e entradas vinculadas exclusivamente a esta obra.
          </p>
        </div>

        <button onClick={() => setModalNovoAberto(true)} className="btn btn-primary">
          <Plus size={16} /> Novo Lançamento
        </button>
      </div>

      {/* KPI Resumo do Caixa da Obra */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        <div className="stat-card">
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 700 }}>ENTRADAS DA OBRA</span>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--success)' }}>
            {formatMoney(resumo?.total_receitas || 0)}
          </p>
        </div>

        <div className="stat-card">
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 700 }}>DESPESAS PAGAS</span>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--danger)' }}>
            {formatMoney(resumo?.total_despesas || 0)}
          </p>
        </div>

        <div className="stat-card">
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 700 }}>SALDO ATUAL DA OBRA</span>
          <p
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 800,
              color: (resumo?.saldo_liquido || 0) >= 0 ? 'var(--success)' : 'var(--danger)'
            }}
          >
            {formatMoney(resumo?.saldo_liquido || 0)}
          </p>
        </div>

        <div className="stat-card">
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 700 }}>CONTAS A PAGAR PENDENTES</span>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--warning)' }}>
            {formatMoney(resumo?.total_despesas_pendentes || 0)}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div
        className="glass-card"
        style={{
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          <Filter size={14} /> Filtros:
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', padding: '6px 12px', fontSize: 'var(--text-sm)' }}
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="">Todos os Tipos (Receitas & Despesas)</option>
          <option value="DESPESA">Somente Despesas</option>
          <option value="RECEITA">Somente Receitas</option>
        </select>

        <select
          className="form-select"
          style={{ width: 'auto', padding: '6px 12px', fontSize: 'var(--text-sm)' }}
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

      {/* Lista de Transações */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--table-header-bg)', borderBottom: '2px solid var(--border-strong)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Descrição & Categoria</th>
              <th style={{ padding: '12px 16px' }}>Fornecedor / Origem</th>
              <th style={{ padding: '12px 16px' }}>Data</th>
              <th style={{ padding: '12px 16px' }}>Comprovante</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {transacoes.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  Nenhum lançamento encontrado para esta seleção.
                </td>
              </tr>
            ) : (
              transacoes.map((t) => {
                const isPago = t.status === 'PAGO';
                const isReceita = t.tipo === 'RECEITA';

                return (
                  <tr
                    key={t.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      fontSize: 'var(--text-sm)',
                      transition: 'background 0.1s ease'
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => handleToggleStatus(t)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {isPago ? (
                          <span className="badge badge-success" style={{ fontSize: 'var(--text-2xs)' }}>
                            <CheckCircle2 size={12} /> Pago
                          </span>
                        ) : (
                          <span className="badge badge-warning" style={{ fontSize: 'var(--text-2xs)' }}>
                            <Clock size={12} /> Pendente
                          </span>
                        )}
                      </button>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t.descricao}</p>
                      <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-dim)' }}>
                        {t.categoria.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                      {t.fornecedor_beneficiario || '—'}
                      <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-dim)' }}>
                        {t.origem_lancamento === 'MOBILE' ? '📱 Mestre (Campo)' : '💻 Gestor (Web)'}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                      {t.data_vencimento}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      {t.comprovante_url ? (
                        <button
                          onClick={() => setSelectedComprovante(t.comprovante_url || null)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: 'var(--text-2xs)', gap: '4px' }}
                        >
                          <Paperclip size={12} /> Ver Cupom
                        </button>
                      ) : (
                        <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-dim)' }}>Sem anexo</span>
                      )}
                    </td>

                    <td
                      style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: isReceita ? 'var(--success)' : 'var(--danger)',
                        fontSize: 'var(--text-sm)'
                      }}
                    >
                      {isReceita ? '+' : '-'} {formatMoney(t.valor)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Novo Lançamento */}
      {modalNovoAberto && (
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
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700 }}>Novo Lançamento Financeiro</h3>
              <button
                onClick={() => setModalNovoAberto(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarLancamento} style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setTipo('DESPESA')}
                  className="btn"
                  style={{
                    flex: 1,
                    backgroundColor: tipo === 'DESPESA' ? 'var(--danger)' : 'var(--bg-surface)',
                    color: tipo === 'DESPESA' ? '#fff' : 'var(--text-main)'
                  }}
                >
                  <ArrowDownRight size={16} /> Despesa (Saída)
                </button>
                <button
                  type="button"
                  onClick={() => setTipo('RECEITA')}
                  className="btn"
                  style={{
                    flex: 1,
                    backgroundColor: tipo === 'RECEITA' ? 'var(--success)' : 'var(--bg-surface)',
                    color: tipo === 'RECEITA' ? '#fff' : 'var(--text-main)'
                  }}
                >
                  <ArrowUpRight size={16} /> Receita (Entrada)
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Descrição do Lançamento *</label>
                <input
                  type="text"
                  className="form-input"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Compra de 50 sacos de argamassa AC-II"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Valor (R$) *</label>
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
                  <label className="form-label">Categoria *</label>
                  <select
                    className="form-select"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                  >
                    <option value="MATERIAL_BASICO">Material Básico</option>
                    <option value="MATERIAL_ACABAMENTO">Material Acabamento</option>
                    <option value="MAO_DE_OBRA_DIARIA">Mão de Obra Diária</option>
                    <option value="EMPREITEIRO_TERCEIRO">Empreiteiro / Subempreiteiro</option>
                    <option value="EQUIPAMENTO_LOCACAO">Locação de Equipamento</option>
                    <option value="TRANSPORTE_FRETE">Frete / Caçamba</option>
                    <option value="ALIMENTACAO_CAMPO">Alimentação Campo</option>
                    <option value="RECEBIMENTO_CLIENTE">Recebimento de Cliente</option>
                    <option value="OUTROS">Outros</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Fornecedor / Beneficiário</label>
                  <input
                    type="text"
                    className="form-input"
                    value={fornecedor}
                    onChange={(e) => setFornecedor(e.target.value)}
                    placeholder="Ex: Depósito União"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Data de Vencimento</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Anexar Comprovante / Foto de Recibo</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="form-input"
                  onChange={(e) => setArquivoComprovante(e.target.files ? e.target.files[0] : null)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setModalNovoAberto(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={salvando} className="btn btn-primary">
                  {salvando ? 'Salvando...' : 'Registrar no Caixa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
