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
  CheckCircle,
  TrendingUp
} from 'lucide-react';

export const SinapiOrcamentosPage: React.FC = () => {
  const { selectedObra, obras } = useAuth();

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

  // Adicionar item manual/SINAPI
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
      const created = await api.createOrcamento({
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
    <div className="page-body">
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
            <span className="badge badge-primary">Base Oficial Caixa</span>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Orçamentador Inteligente SINAPI</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            Consulte a tabela oficial de custos da construção civil e monte orçamentos rápidos com aplicação de BDI.
          </p>
        </div>

        {selectedObra && (
          <button onClick={() => setModalNovoOrcamento(true)} className="btn btn-primary">
            <Plus size={16} /> Novo Orçamento para esta Obra
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Painel Esquerdo: Busca na Tabela SINAPI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700, marginBottom: '12px' }}>
              🔍 Catálogo SINAPI Oficial da Caixa
            </h3>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Buscar por código ou descrição (ex: Concreto, Alvenaria, Cimento, Tubulação)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && buscarSinapi()}
                />
              </div>

              <select
                className="form-select"
                style={{ width: '100px' }}
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

              <button onClick={buscarSinapi} disabled={searchLoading} className="btn btn-primary">
                <Search size={16} />
              </button>
            </div>

            {/* Tabela de Resultados SINAPI */}
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {searchLoading ? (
                <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>Buscando base...</p>
              ) : sinapiResults.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  Nenhum serviço encontrado. Tente buscar por outro termo.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sinapiResults.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '12px',
                        backgroundColor: 'var(--bg-input)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                            <span className="badge badge-primary" style={{ fontSize: 'var(--text-2xs)' }}>
                              CÓD {item.codigo_sinapi}
                            </span>
                            <span className="badge badge-neutral" style={{ fontSize: 'var(--text-2xs)' }}>
                              {item.unidade}
                            </span>
                          </div>
                          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.3 }}>
                            {item.descricao}
                          </p>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-dim)' }}>Preço SINAPI</span>
                          <p style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: '#10b981' }}>
                            {formatMoney(item.custo_nao_desonerado)}
                          </p>
                        </div>
                      </div>

                      {/* Quantidade e Adicionar ao Orçamento */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '8px',
                          paddingTop: '6px',
                          borderTop: '1px solid var(--border-light)'
                        }}
                      >
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Quantidade ({item.unidade}):</span>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          style={{
                            width: '70px',
                            padding: '4px 8px',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            color: 'var(--text-main)',
                            fontSize: 'var(--text-xs)'
                          }}
                          value={itemQtd[item.id] || 1}
                          onChange={(e) =>
                            setItemQtd({ ...itemQtd, [item.id]: parseFloat(e.target.value) || 1 })
                          }
                        />

                        <button
                          onClick={() => handleAddItemToOrcamento(item)}
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: 'var(--text-2xs)', gap: '4px' }}
                        >
                          <Plus size={14} /> + Orçamento
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Painel Direito: Orçamento Ativo da Obra com BDI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700 }}>
                  📋 {activeOrcamento ? activeOrcamento.titulo : 'Orçamento da Obra'}
                </h3>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Obra: {selectedObra ? selectedObra.nome : 'Nenhuma selecionada'}
                </span>
              </div>

              {/* Taxa de BDI */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--bg-input)',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)'
                }}
              >
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--primary)' }}>BDI:</span>
                <input
                  type="number"
                  style={{
                    width: '50px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: 'var(--text-sm)',
                    textAlign: 'center'
                  }}
                  value={bdi}
                  onChange={(e) => setBdi(parseFloat(e.target.value) || 0)}
                />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)' }}>%</span>
              </div>
            </div>

            {/* Total Geral Orçado */}
            <div
              style={{
                backgroundColor: 'var(--primary-light)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}
            >
              <div>
                <span style={{ fontSize: 'var(--text-2xs)', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700 }}>
                  VALOR TOTAL DO ORÇAMENTO (COM BDI)
                </span>
                <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-main)' }}>
                  {formatMoney(activeOrcamento?.valor_total_orcado || 0)}
                </p>
              </div>
              <span className="badge badge-success">Pronto para Obra</span>
            </div>

            {/* Lista de Itens do Orçamento */}
            <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {!activeOrcamento || !activeOrcamento.itens || activeOrcamento.itens.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-dim)' }}>
                  <FileSpreadsheet size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                  <p style={{ fontSize: 'var(--text-sm)' }}>Nenhum item adicionado ainda.</p>
                  <p style={{ fontSize: 'var(--text-2xs)' }}>
                    Busque no catálogo SINAPI ao lado e clique em "+ Orçamento".
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeOrcamento.itens.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'var(--bg-input)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1, paddingRight: '12px' }}>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
                          {item.descricao}
                        </p>
                        <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>
                          {item.quantidade} {item.unidade} × {formatMoney(item.preco_unitario_base)} (Base) + {item.bdi_percentual}% BDI
                        </span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: '#10b981' }}>
                          {formatMoney(item.subtotal_total)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
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
                borderBottom: '1px solid var(--border-light)'
              }}
            >
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700 }}>Criar Novo Orçamento</h3>
              <button
                onClick={() => setModalNovoOrcamento(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCriarOrcamento} style={{ padding: '20px' }}>
              <div className="form-group">
                <label className="form-label">Título do Orçamento *</label>
                <input
                  type="text"
                  className="form-input"
                  value={tituloNovo}
                  onChange={(e) => setTituloNovo(e.target.value)}
                  placeholder="Ex: Orçamento Inicial Reforma"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Taxa Padrão de BDI (%)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={bdi}
                  onChange={(e) => setBdi(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setModalNovoOrcamento(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
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
