import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Obra, InadimplenciaRadarData, TransacaoFinanceira } from '../types/index.js';
import { api } from '../services/api.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { KpiCard } from '../components/ui/KpiCard.js';
import { Button } from '../components/ui/Button.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { ObraCard } from '../components/domain/dashboard/ObraCard.js';
import { RecentTransactionsFeed } from '../components/domain/dashboard/RecentTransactionsFeed.js';
import {
  Landmark,
  AlertTriangle,
  FileInput,
  Building2,
  Filter,
  Download,
  Plus,
  ArrowUpRight
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

  if (loading) {
    return (
      <div className="page-body">
        <LoadingState message="Carregando dados executivos..." minHeight="400px" />
      </div>
    );
  }

  return (
    <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2.5vw, 24px)' }}>
      {/* Page Header */}
      <PageHeader
        title="Visão Executiva da Construtora"
        subtitle="Acompanhamento consolidado do fluxo de caixa, orçamento de obras e saúde financeira da empresa."
        actions={
          <>
            <Button variant="secondary" icon={Filter} onClick={() => handleNavigate('fluxo')}>
              FILTRAR
            </Button>
            <Button variant="tech-blue" icon={Download} onClick={() => window.print()}>
              RELATÓRIO
            </Button>
            <Button variant="primary" icon={Plus} onClick={handleOpenModal}>
              NOVA OBRA
            </Button>
          </>
        }
      />

      {/* KPI Cards Section */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'clamp(12px, 1.5vw, 20px)'
        }}
      >
        <KpiCard
          title="SALDO CONSOLIDADO"
          value={formatMoney(totalSaldoGeral)}
          icon={Landmark}
          variant="blue"
          trend={{ value: '+5.2%', isPositive: true, label: 'vs mês anterior' }}
        />

        <KpiCard
          title="RECEBÍVEIS VENCIDOS"
          value={formatMoney(inadimplencia?.total_vencido || 0)}
          icon={AlertTriangle}
          variant="red"
          onClick={() => handleNavigate('inadimplencia')}
          subtitle={
            <span style={{ color: 'var(--status-late)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {inadimplencia?.total_clientes_inadimplentes || 0} contratos pendentes <ArrowUpRight size={13} />
            </span>
          }
        />

        <KpiCard
          title="TOTAL DE ENTRADAS (MÊS)"
          value={formatMoney(totalReceitasGeral)}
          icon={FileInput}
          variant="emerald"
          subtitle="75% da meta mensal atingida"
        />

        <KpiCard
          title="OBRAS EM EXECUÇÃO"
          value={totalObrasAtivas}
          icon={Building2}
          variant="default"
          subtitle={`+${obras.length} no portfólio`}
        />
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
            {obras.map((obra) => (
              <ObraCard
                key={obra.id}
                obra={obra}
                formatMoney={formatMoney}
                onSelect={(selected) => {
                  setSelectedObra(selected);
                  handleNavigate('fluxo');
                }}
              />
            ))}
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
          <RecentTransactionsFeed
            transacoes={recentTransacoes}
            formatMoney={formatMoney}
            onViewAll={() => handleNavigate('fluxo')}
          />
        </section>
      </div>
    </div>
  );
};
