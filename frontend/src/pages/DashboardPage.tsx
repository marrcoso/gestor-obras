import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Obra, InadimplenciaRadarData, TransacaoFinanceira } from '../types/index.js';
import { api } from '../services/api.js';
import {
  TrendingUp,
  AlertTriangle,
  Building2,
  Filter,
  Download,
  Plus,
  Receipt,
  Camera,
  ArrowUpRight,
  Landmark,
  FileInput
} from 'lucide-react';

interface DashboardPageProps {
  setCurrentView?: (view: string) => void;
  openNewObraModal?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setCurrentView, openNewObraModal }) => {
  const navigate = useNavigate();
  const outletCtx = useOutletContext<{ openNewObraModal?: () => void }>() || {};
  const { obras, setSelectedObra } = useAuth();
  const [inadimplencia, setInadimplencia] = useState<InadimplenciaRadarData | null>(null);
  const [recentTransacoes, setRecentTransacoes] = useState<TransacaoFinanceira[]>([]);
  const [loading, setLoading] = useState(true);

  const handleNavigate = (view: string) => {
    if (setCurrentView) {
      setCurrentView(view);
    } else {
      if (view === 'field') navigate('/campo');
      else if (view === 'fluxo') navigate('/fluxo');
      else if (view === 'inadimplencia') navigate('/inadimplencia');
      else if (view === 'diario') navigate('/diario');
      else if (view === 'sinapi') navigate('/sinapi');
      else navigate('/dashboard');
    }
  };

  const handleOpenModal = () => {
    if (openNewObraModal) openNewObraModal();
    else if (outletCtx.openNewObraModal) outletCtx.openNewObraModal();
  };

  useEffect(() => {
    Promise.all([
      api.getInadimplenciaRadar().catch(() => null),
      api.getTransacoes().catch(() => [])
    ])
      .then(([radarData, transData]) => {
        if (radarData) setInadimplencia(radarData);
        setRecentTransacoes(transData.slice(0, 8));
      })
      .finally(() => setLoading(false));
  }, []);

  const totalSaldoGeral = obras.reduce((acc, curr) => acc + (curr.saldo_atual || 0), 0);
  const totalReceitasGeral = obras.reduce((acc, curr) => acc + (curr.total_receitas || 0), 0);
  const totalObrasAtivas = obras.filter((o) => o.status === 'EM_ANDAMENTO').length || obras.length;

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
            Visão Executiva da Construtora
          </h1>
          <p className="text-subtitle" style={{ maxWidth: '680px' }}>
            Acompanhamento consolidado do fluxo de caixa, orçamento de obras e saúde financeira da empresa.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => handleNavigate('fluxo')}
            className="btn-constructo btn-secondary-slate"
            style={{ gap: '6px' }}
          >
            <Filter size={16} />
            <span className="text-mono-tag">FILTRAR</span>
          </button>

          <button
            onClick={() => window.print()}
            className="btn-constructo btn-tech-blue"
            style={{ gap: '6px' }}
          >
            <Download size={16} />
            <span className="text-mono-tag">RELATÓRIO</span>
          </button>

          <button
            onClick={handleOpenModal}
            className="btn-constructo btn-primary-orange"
            style={{ gap: '6px' }}
          >
            <Plus size={16} />
            <span className="text-mono-tag">NOVA OBRA</span>
          </button>
        </div>
      </section>

      {/* KPI Cards Section */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'clamp(12px, 1.5vw, 20px)'
        }}
      >
        {/* Saldo Consolidado */}
        <div className="stat-kpi-card group">
          <Landmark className="kpi-watermark-icon" color="var(--technical-blue)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--technical-blue)'
              }}
            >
              <Landmark size={18} />
            </div>
            <span className="text-mono-tag" style={{ color: 'var(--text-muted)' }}>
              SALDO CONSOLIDADO
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="text-kpi-value">
              {formatMoney(totalSaldoGeral)}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#ffffff',
                  backgroundColor: 'var(--status-paid)',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}
              >
                <TrendingUp size={12} /> +5.2%
              </span>
              <span className="text-caption-responsive">vs mês anterior</span>
            </div>
          </div>
        </div>

        {/* Recebíveis Vencidos */}
        <div className="stat-kpi-card group">
          <AlertTriangle className="kpi-watermark-icon" color="var(--status-late)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              <AlertTriangle size={18} />
            </div>
            <span className="text-mono-tag" style={{ color: 'var(--text-muted)' }}>
              RECEBÍVEIS VENCIDOS
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="text-kpi-value" style={{ color: 'var(--status-late)' }}>
              {formatMoney(inadimplencia?.total_vencido || 0)}
            </span>
            <button
              onClick={() => handleNavigate('inadimplencia')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--status-late)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                padding: 0,
                marginTop: '6px'
              }}
            >
              {inadimplencia?.total_clientes_inadimplentes || 0} contratos pendentes <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        {/* Total de Entradas */}
        <div className="stat-kpi-card group">
          <FileInput className="kpi-watermark-icon" color="var(--status-paid)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-paid)'
              }}
            >
              <FileInput size={18} />
            </div>
            <span className="text-mono-tag" style={{ color: 'var(--text-muted)' }}>
              TOTAL DE ENTRADAS (MÊS)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="text-kpi-value">
              {formatMoney(totalReceitasGeral)}
            </span>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-surface-high)', borderRadius: '999px', marginTop: '10px', overflow: 'hidden' }}>
              <div style={{ width: '75%', height: '100%', backgroundColor: 'var(--status-paid)', borderRadius: '999px' }} />
            </div>
            <span className="text-caption-responsive" style={{ marginTop: '4px' }}>
              75% da meta mensal atingida
            </span>
          </div>
        </div>

        {/* Obras em Execução */}
        <div className="stat-kpi-card group">
          <Building2 className="kpi-watermark-icon" color="var(--technical-blue)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--technical-blue)'
              }}
            >
              <Building2 size={18} />
            </div>
            <span className="text-mono-tag" style={{ color: 'var(--text-muted)' }}>
              OBRAS EM EXECUÇÃO
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="text-kpi-value">
              {totalObrasAtivas}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <div style={{ display: 'flex', marginLeft: '6px' }}>
                {obras.slice(0, 3).map((o, idx) => (
                  <div
                    key={o.id}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-surface-container)',
                      border: '2px solid var(--bg-card)',
                      marginLeft: idx > 0 ? '-8px' : '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--text-muted)'
                    }}
                  >
                    {o.nome.substring(0, 2).toUpperCase()}
                  </div>
                ))}
              </div>
              <span className="text-caption-responsive">
                +{obras.length} no portfólio
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Split: Centros de Custo (2/3) vs Últimos Lançamentos (1/3) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'clamp(16px, 2vw, 24px)'
        }}
      >
        {/* Left Column (Centros de Custo) */}
        <section style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="heading-section" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={20} color="var(--technical-blue)" />
              Centros de Custo por Obra
            </h2>
            <button
              onClick={() => handleNavigate('fluxo')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--technical-blue)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Ver todas as obras →
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px'
            }}
          >
            {obras.map((obra, idx) => {
              const perc = obra.percentual_orcamento_consumido || 0;
              const isHigh = perc > 80;
              const isWarning = perc > 60 && perc <= 80;

              return (
                <div
                  key={obra.id}
                  className="card-constructo"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span
                        className="text-mono-tag"
                        style={{
                          color: 'var(--technical-blue)',
                          backgroundColor: 'var(--technical-blue-light)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          width: 'fit-content'
                        }}
                      >
                        OBRA 0{idx + 1} • {obra.estado_uf}
                      </span>
                      <h3 className="heading-card">
                        {obra.nome}
                      </h3>
                      <span className="text-caption-responsive">
                        Cliente: {obra.cliente_nome}
                      </span>
                    </div>
                  </div>

                  {/* Budget Progress Box with Visible Border */}
                  <div
                    style={{
                      backgroundColor: 'var(--bg-surface-low)',
                      border: '1px solid var(--border)',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Orçamento Executado</span>
                      <span
                        className="text-tabular"
                        style={{
                          fontWeight: 800,
                          color: isHigh ? 'var(--status-late)' : isWarning ? 'var(--status-warning)' : 'var(--text-main)'
                        }}
                      >
                        {perc}%
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-surface-high)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, perc)}%`,
                          height: '100%',
                          backgroundColor: isHigh ? 'var(--status-late)' : isWarning ? 'var(--status-warning)' : 'var(--technical-blue)',
                          borderRadius: '999px',
                          transition: 'width 0.8s ease'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="text-mono-tag" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>CUSTO ATUAL</span>
                        <span
                          className="text-tabular"
                          style={{
                            fontSize: '13px',
                            fontWeight: 800,
                            color: isHigh ? 'var(--status-late)' : 'var(--text-main)'
                          }}
                        >
                          {formatMoney(obra.total_despesas || 0)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span className="text-mono-tag" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>ORÇADO</span>
                        <span className="text-tabular" style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {formatMoney(obra.orcamento_previsto || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Obra Card Quick Actions */}
                  <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
                    <button
                      onClick={() => {
                        setSelectedObra(obra);
                        handleNavigate('fluxo');
                      }}
                      className="btn-constructo btn-secondary-slate"
                      style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                    >
                      <Receipt size={14} /> Extrato
                    </button>
                    <button
                      onClick={() => {
                        setSelectedObra(obra);
                        handleNavigate('diario');
                      }}
                      className="btn-constructo btn-secondary-slate"
                      style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                    >
                      <Camera size={14} /> Fotos ({obra.total_fotos || 0})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reference Construction Site Overview Banner Card */}
          <div
            style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: 'var(--shadow-sm)',
              height: '180px',
              backgroundColor: '#0f172a',
              border: '1px solid var(--border)'
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80"
              alt="Canteiro de Obras: Visão Geral"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.65
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.3) 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '20px'
              }}
            >
              <span className="text-mono-tag" style={{ color: 'var(--primary)' }}>
                CANTEIRO DE OBRAS • CONECTIVIDADE TOTAL
              </span>
              <h3 style={{ fontSize: 'var(--text-fluid-section)', fontWeight: 800, color: '#ffffff' }}>
                Diário Fotográfico & Lançamentos Offline do Mestre de Obras
              </h3>
              <p style={{ fontSize: 'var(--text-fluid-body)', color: 'rgba(255, 255, 255, 0.85)', marginTop: '2px' }}>
                Todos os lançamentos do canteiro são sincronizados automaticamente com o fluxo financeiro da construtora.
              </p>
            </div>
          </div>
        </section>

        {/* Right Column (Últimos Lançamentos) */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="heading-section" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={20} color="var(--primary)" />
              Últimos Lançamentos
            </h2>
            <button
              onClick={() => handleNavigate('fluxo')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--technical-blue)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Ver Fluxo →
            </button>
          </div>

          <div
            className="card-constructo"
            style={{
              padding: 0,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* List Header with Clear Border */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface-low)',
                padding: '12px 16px',
                borderBottom: '2px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                letterSpacing: '0.04em'
              }}
            >
              <span>DESCRIÇÃO & STATUS</span>
              <span>VALOR</span>
            </div>

            {/* List Items with Visible Lines */}
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '480px', overflowY: 'auto' }}>
              {recentTransacoes.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
                  Nenhum lançamento registrado recentemente.
                </div>
              ) : (
                recentTransacoes.map((item, idx) => {
                  const isReceita = item.tipo === 'RECEITA';
                  const isLate = item.status === 'PENDENTE' && new Date(item.data_vencimento) < new Date();

                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => handleNavigate('fluxo')}
                      style={{
                        padding: '14px 16px',
                        borderBottom: '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-low)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '65%' }}>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: 'var(--text-main)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {item.descricao}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            className={`chip-status ${
                              item.status === 'PAGO'
                                ? 'status-pago'
                                : isLate
                                ? 'status-atraso'
                                : 'status-pendente'
                            }`}
                          >
                            {item.status === 'PAGO' ? 'PAGO' : isLate ? 'ATRASO' : 'PENDENTE'}
                          </span>
                          <span
                            className="text-caption-responsive"
                            style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {item.fornecedor_beneficiario || 'Geral'}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span
                          className="text-tabular"
                          style={{
                            fontSize: '14px',
                            fontWeight: 800,
                            color: isReceita ? 'var(--status-paid)' : 'var(--status-late)'
                          }}
                        >
                          {isReceita ? '+' : '-'} {formatMoney(item.valor)}
                        </span>
                        <span className="text-caption-responsive">
                          Venc: {item.data_vencimento ? item.data_vencimento.split('-').reverse().slice(0, 2).join('/') : '-'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

