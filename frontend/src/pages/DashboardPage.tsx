import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { InadimplenciaRadarData, TransacaoFinanceira } from '../types/index.js';
import { api } from '../services/api.js';

import {
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Building2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface DashboardPageProps {
  openNewObraModal?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = (props) => {
  const navigate = useNavigate();
  const outletContext = useOutletContext<{ openNewObraModal: () => void } | null>();
  const openNewObraModal = props.openNewObraModal || outletContext?.openNewObraModal || (() => {});
  const { obras, setSelectedObra } = useAuth();
  const [inadimplencia, setInadimplencia] = useState<InadimplenciaRadarData | null>(null);
  const [recentTransacoes, setRecentTransacoes] = useState<TransacaoFinanceira[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getInadimplenciaRadar().catch(() => null),
      api.getTransacoes().catch(() => [])
    ])
      .then(([radarData, transData]) => {
        if (radarData) setInadimplencia(radarData);
        setRecentTransacoes(transData.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  const totalSaldoGeral = obras.reduce((acc, curr) => acc + (curr.saldo_atual || 0), 0);
  const totalOrcamentoGeral = obras.reduce((acc, curr) => acc + (curr.orcamento_previsto || 0), 0);
  const totalReceitasGeral = obras.reduce((acc, curr) => acc + (curr.total_receitas || 0), 0);
  const totalDespesasGeral = obras.reduce((acc, curr) => acc + (curr.total_despesas || 0), 0);

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <div className="page-body">
      {/* Top Banner & Ações */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Visão Executiva da Construtora</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Acompanhe o saldo individual de cada canteiro de obras e o fluxo financeiro consolidado.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/campo')} className="btn btn-secondary">
            📱 Modo Canteiro
          </button>
          <button onClick={openNewObraModal} className="btn btn-primary">
            + Cadastrar Nova Obra
          </button>
        </div>
      </div>

      {/* KPI Cards Consolidado */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Saldo Consolidado em Caixa
            </span>
            <div style={{ backgroundColor: 'var(--success-light)', padding: '6px', borderRadius: '8px' }}>
              <DollarSign size={18} color="#10b981" />
            </div>
          </div>
          <p style={{ fontSize: '26px', fontWeight: 800, color: totalSaldoGeral >= 0 ? '#10b981' : '#ef4444' }}>
            {formatMoney(totalSaldoGeral)}
          </p>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Somatória real de todos os centros de custo
          </span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Recebíveis Vencidos (Inadimplência)
            </span>
            <div style={{ backgroundColor: 'var(--danger-light)', padding: '6px', borderRadius: '8px' }}>
              <AlertTriangle size={18} color="#ef4444" />
            </div>
          </div>
          <p style={{ fontSize: '26px', fontWeight: 800, color: '#ef4444' }}>
            {formatMoney(inadimplencia?.total_vencido || 0)}
          </p>
          <button
            onClick={() => navigate('/inadimplencia')}
            style={{
              background: 'none',
              border: 'none',
              color: '#60a5fa',
              fontSize: '12px',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Abrir Radar de Cobrança <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total de Entradas Recebidas
            </span>
            <div style={{ backgroundColor: 'var(--primary-light)', padding: '6px', borderRadius: '8px' }}>
              <TrendingUp size={18} color="#3b82f6" />
            </div>
          </div>
          <p style={{ fontSize: '26px', fontWeight: 800, color: '#3b82f6' }}>
            {formatMoney(totalReceitasGeral)}
          </p>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Total faturado e creditado no caixa
          </span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Obras em Execução
            </span>
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '6px', borderRadius: '8px' }}>
              <Building2 size={18} color="#94a3b8" />
            </div>
          </div>
          <p style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>
            {obras.filter((o) => o.status === 'EM_ANDAMENTO').length} ativas
          </p>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Total de {obras.length} obras cadastradas
          </span>
        </div>
      </div>

      {/* Grid de Centros de Custo Isolados (Obras) */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Centros de Custo por Obra</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Cada obra possui contas e saldo totalmente independentes.
            </p>
          </div>
        </div>

        <div className="grid-cols-auto">
          {obras.map((obra) => {
            const perc = obra.percentual_orcamento_consumido || 0;
            const isDanger = perc > 90;
            const isWarning = perc > 70 && perc <= 90;

            return (
              <div key={obra.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <span className="badge badge-primary" style={{ marginBottom: '6px' }}>
                      {obra.estado_uf} • {obra.status}
                    </span>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{obra.nome}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cliente: {obra.cliente_nome}</p>
                  </div>
                  <div
                    style={{
                      textAlign: 'right',
                      backgroundColor: 'var(--bg-input)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Saldo da Obra</span>
                    <p
                      style={{
                        fontSize: '15px',
                        fontWeight: 800,
                        color: (obra.saldo_atual || 0) >= 0 ? '#10b981' : '#ef4444'
                      }}
                    >
                      {formatMoney(obra.saldo_atual || 0)}
                    </p>
                  </div>
                </div>

                {/* Barra de Progresso do Orçamento Previsto */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Orçamento Gasto:</span>
                    <span style={{ fontWeight: 700, color: isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#34d399' }}>
                      {formatMoney(obra.total_despesas || 0)} ({perc}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, perc)}%`,
                        backgroundColor: isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                    <span>Início: {obra.data_inicio}</span>
                    <span>Teto: {formatMoney(obra.orcamento_previsto)}</span>
                  </div>
                </div>

                {/* Ações da Obra */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={() => {
                      setSelectedObra(obra);
                      navigate('/fluxo');
                    }}
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                  >
                    Ver Extrato
                  </button>

                  <button
                    onClick={() => {
                      setSelectedObra(obra);
                      navigate('/diario');
                    }}
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                  >
                    📷 Fotos ({obra.total_fotos || 0})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lançamentos Recentes */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Últimos Lançamentos em Campo & Escritório</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Despesas e pagamentos lançados recentemente.</p>
          </div>
          <button onClick={() => navigate('/fluxo')} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
            Ver Fluxo Completo <ArrowUpRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recentTransacoes.map((item) => {
            const isReceita = item.tipo === 'RECEITA';

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      backgroundColor: isReceita ? 'var(--success-light)' : 'var(--danger-light)',
                      padding: '8px',
                      borderRadius: '8px'
                    }}
                  >
                    {isReceita ? <ArrowUpRight size={16} color="#10b981" /> : <ArrowDownRight size={16} color="#ef4444" />}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{item.descricao}</p>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {item.categoria.replace(/_/g, ' ')} • {item.origem_lancamento === 'MOBILE' ? '📱 Canteiro' : '💻 Escritório'}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: isReceita ? '#10b981' : '#f87171'
                    }}
                  >
                    {isReceita ? '+' : '-'} {formatMoney(item.valor)}
                  </p>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{item.data_vencimento}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
