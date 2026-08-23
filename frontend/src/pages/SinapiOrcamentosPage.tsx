import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { SinapiItem, Orcamento, OrcamentoItem } from '../types/index.js';
import { api } from '../services/api.js';
import {
  Search,
  Plus,
  Trash2,
  FileSpreadsheet,
  Building2,
  Calculator,
  Percent,
  TrendingUp,
  X,
  Layers
} from 'lucide-react';

export const SinapiOrcamentosPage: React.FC = () => {
  const { selectedObra } = useAuth();

  // SINAPI Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUf, setSelectedUf] = useState('SP');
  const [sinapiResults, setSinapiResults] = useState<SinapiItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Orçamento State
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [activeOrcamento, setActiveOrcamento] = useState<Orcamento | null>(null);
  const [bdi, setBdi] = useState<number>(20);
  const [loadingOrcamento, setLoadingOrcamento] = useState(false);

  // Modal Novo Orçamento
  const [modalNovoOrcamento, setModalNovoOrcamento] = useState(false);
  const [tituloNovo, setTituloNovo] = useState('Orçamento Base da Obra');

  // Quantidades temporárias
  const [itemQtd, setItemQtd] = useState<Record<string, number>>({});

  const buscarSinapi = async () => {
    setSearchLoading(true);
    try {
      const res = await api.searchSinapi(searchQuery, selectedUf);
      setSinapiResults(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  const carregarOrcamentos = async () => {
    if (!selectedObra) return;
    setLoadingOrcamento(true);
    try {
      const list = await api.getOrcamentos(selectedObra.id);
      setOrcamentos(list);
      if (list.length > 0) {
        const full = await api.getOrcamentoById(list[0].id);
        setActiveOrcamento(full);
        setBdi(full.bdi_padrao_percentual || 20);
      } else {
        setActiveOrcamento(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrcamento(false);
    }
  };

  useEffect(() => {
    buscarSinapi();
  }, [selectedUf]);

  useEffect(() => {
    carregarOrcamentos();
  }, [selectedObra]);

  const handleCriarOrcamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObra || !tituloNovo) return;

    try {
      await api.createOrcamento({
        obraId: selectedObra.id,
        titulo: tituloNovo,
        bdiPadraoPercentual: bdi
      });
      setModalNovoOrcamento(false);
      await carregarOrcamentos();
    } catch (e: any) {
      alert(e.message || 'Erro ao criar orçamento');
    }
  };

  const handleAddItemToOrcamento = async (sinapiItem: SinapiItem) => {
    if (!activeOrcamento) {
      alert('Selecione ou crie um orçamento primeiro para adicionar composições.');
      return;
    }

    const qtd = itemQtd[sinapiItem.id] || 1;
    try {
      await api.addOrcamentoItem(activeOrcamento.id, {
        sinapiItemId: sinapiItem.id,
        codigoItem: sinapiItem.codigo_sinapi,
        descricao: sinapiItem.descricao,
        unidade: sinapiItem.unidade,
        quantidade: qtd,
        precoUnitarioBase: sinapiItem.custo_nao_desonerado,
        bdiPercentual: bdi
      });

      const updated = await api.getOrcamentoById(activeOrcamento.id);
      setActiveOrcamento(updated);
    } catch (e: any) {
      alert(e.message || 'Erro ao adicionar item ao orçamento');
    }
  };

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2.5vw, 24px)' }}>
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
            Orçamentador Inteligente SINAPI
          </h1>
          <p className="text-subtitle">
            Consulte o catálogo oficial Caixa Econômica Federal e estruture orçamentos executivos com BDI automático.
          </p>
        </div>

        {selectedObra && (
          <button
            onClick={() => setModalNovoOrcamento(true)}
            className="btn-constructo btn-primary-orange"
            style={{ gap: '6px' }}
          >
            <Plus size={16} />
            <span className="text-mono-tag">Novo Orçamento</span>
          </button>
        )}
      </section>

      {/* Grid: Search Left (1.2fr) vs Active Budget Right (1fr) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 'clamp(16px, 2vw, 24px)'
        }}
      >
        {/* Left Column: SINAPI Search */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            className="card-constructo"
            style={{
              padding: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '2px solid var(--border)',
                backgroundColor: 'var(--bg-surface-low)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <h2 className="heading-section" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="var(--technical-blue)" />
                Catálogo SINAPI Oficial da Caixa
              </h2>
              <span
                className="text-mono-tag"
                style={{
                  color: 'var(--technical-blue)',
                  backgroundColor: 'var(--technical-blue-light)',
                  padding: '3px 8px',
                  borderRadius: '4px'
                }}
              >
                BASE CAIXA
              </span>
            </div>

            {/* Search Input and UF Selector */}
            <div
              style={{
                padding: '16px 20px',
                backgroundColor: 'var(--bg-surface-low)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                gap: '10px'
              }}
            >
              <div style={{ position: 'relative', flex: 1 }}>
                <Search
                  size={15}
                  color="var(--text-dim)"
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  className="form-input-constructo"
                  style={{ paddingLeft: '32px' }}
                  placeholder="Buscar por composição, código ou serviço (ex: concreto, alvenaria, reboco)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && buscarSinapi()}
                />
              </div>

              <select
                className="form-select-constructo"
                style={{ width: '90px' }}
                value={selectedUf}
                onChange={(e) => setSelectedUf(e.target.value)}
              >
                <option value="SP">SP</option>
                <option value="RJ">RJ</option>
                <option value="MG">MG</option>
                <option value="BA">BA</option>
                <option value="PR">PR</option>
                <option value="RS">RS</option>
                <option value="GO">GO</option>
                <option value="SC">SC</option>
              </select>

              <button
                onClick={buscarSinapi}
                disabled={searchLoading}
                className="btn-constructo btn-tech-blue"
                style={{ padding: '0 14px' }}
              >
                <Search size={16} />
              </button>
            </div>

            {/* Search Results List */}
            <div style={{ maxHeight: '520px', overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {searchLoading ? (
                <p style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Consultando base de dados SINAPI...
                </p>
              ) : sinapiResults.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Nenhum serviço encontrado para este filtro.
                </p>
              ) : (
                sinapiResults.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '14px',
                      backgroundColor: 'var(--bg-surface-low)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                          <span
                            className="text-mono-tag"
                            style={{
                              fontSize: '10px',
                              color: 'var(--technical-blue)',
                              backgroundColor: 'var(--technical-blue-light)',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            CÓD {item.codigo_sinapi}
                          </span>
                          <span
                            className="text-mono-tag"
                            style={{
                              fontSize: '10px',
                              color: 'var(--text-dim)',
                              backgroundColor: 'var(--bg-surface-high)',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            UN: {item.unidade}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', lineHeight: '1.4' }}>
                          {item.descricao}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span className="text-mono-tag" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>
                          PREÇO BASE
                        </span>
                        <p
                          className="text-tabular"
                          style={{ fontSize: '15px', fontWeight: 800, color: 'var(--status-paid)' }}
                        >
                          {formatMoney(item.custo_nao_desonerado)}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Selector & Add Action */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '8px',
                        paddingTop: '8px',
                        borderTop: '1px solid var(--border-light)'
                      }}
                    >
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Qtd ({item.unidade}):
                      </span>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        className="form-input-constructo font-data-tabular"
                        style={{ width: '80px', minHeight: '32px', padding: '4px 8px', fontSize: '12px', textAlign: 'center' }}
                        value={itemQtd[item.id] || 1}
                        onChange={(e) =>
                          setItemQtd({ ...itemQtd, [item.id]: parseFloat(e.target.value) || 1 })
                        }
                      />

                      <button
                        onClick={() => handleAddItemToOrcamento(item)}
                        className="btn-constructo btn-primary-orange"
                        style={{ padding: '6px 12px', minHeight: '32px', fontSize: '11px', gap: '4px' }}
                      >
                        <Plus size={14} /> + Orçamento
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Right Column: Active Budget & BDI */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            className="card-constructo"
            style={{
              padding: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Budget Header with BDI Control */}
            <div
              style={{
                padding: '16px 20px',
                backgroundColor: 'var(--bg-card)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontSize: '17px',
                    fontWeight: 700,
                    color: 'var(--text-main)'
                  }}
                >
                  {activeOrcamento ? activeOrcamento.titulo : 'Orçamento da Obra'}
                </h2>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  Obra: {selectedObra ? selectedObra.nome : 'Selecione uma obra'}
                </span>
              </div>

              {/* BDI Badge / Input */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--bg-surface-low)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)'
                }}
              >
                <span className="text-mono-tag" style={{ fontSize: '11px', color: 'var(--primary)' }}>
                  BDI:
                </span>
                <input
                  type="number"
                  style={{
                    width: '44px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '13px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-body)'
                  }}
                  value={bdi}
                  onChange={(e) => setBdi(parseFloat(e.target.value) || 0)}
                />
                <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>%</span>
              </div>
            </div>

            {/* Total Budget Card */}
            <div style={{ padding: '16px 20px' }}>
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-low)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <span className="text-mono-tag" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                    VALOR TOTAL ORÇADO (COM BDI APLICADO)
                  </span>
                  <p
                    className="text-kpi-value"
                    style={{ color: 'var(--text-main)', marginTop: '2px' }}
                  >
                    {formatMoney(activeOrcamento?.valor_total_orcado || 0)}
                  </p>
                </div>
                <span className="chip-status status-pago">PRONTO P/ EXECUÇÃO</span>
              </div>
            </div>

            {/* Budget Items List */}
            <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {!activeOrcamento || !activeOrcamento.itens || activeOrcamento.itens.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-dim)' }}>
                  <FileSpreadsheet size={36} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
                  <p style={{ fontSize: '14px', fontWeight: 600 }}>Nenhum item adicionado ainda.</p>
                  <p style={{ fontSize: '12px', marginTop: '2px' }}>
                    Busque no catálogo SINAPI ao lado e adicione composições com 1 clique.
                  </p>
                </div>
              ) : (
                activeOrcamento.itens.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: 'var(--bg-surface-low)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: '12px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', lineHeight: '1.3' }}>
                        {item.descricao}
                      </p>
                      <span className="font-data-tabular" style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        {item.quantidade} {item.unidade} × {formatMoney(item.preco_unitario_base)} (Base) + {item.bdi_percentual}% BDI
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <p
                        className="font-data-tabular"
                        style={{ fontSize: '14px', fontWeight: 800, color: 'var(--status-paid)' }}
                      >
                        {formatMoney(item.subtotal_total)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Modal Novo Orçamento */}
      {modalNovoOrcamento && (
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
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Criar Novo Orçamento</h3>
              <button
                onClick={() => setModalNovoOrcamento(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCriarOrcamento} style={{ padding: '20px' }}>
              <div className="form-group-constructo">
                <label className="form-label-constructo">Título do Orçamento *</label>
                <input
                  type="text"
                  className="form-input-constructo"
                  value={tituloNovo}
                  onChange={(e) => setTituloNovo(e.target.value)}
                  placeholder="Ex: Orçamento Inicial Executivo"
                  required
                />
              </div>

              <div className="form-group-constructo">
                <label className="form-label-constructo">Taxa Padrão de BDI (%)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input-constructo"
                  value={bdi}
                  onChange={(e) => setBdi(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setModalNovoOrcamento(false)}
                  className="btn-constructo btn-secondary-slate"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-constructo btn-primary-orange">
                  Criar Orçamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

