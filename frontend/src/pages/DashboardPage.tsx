import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { InadimplenciaRadarData, TransacaoFinanceira } from '../types/index.js';
import { api } from '../services/api.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { KpiCard } from '../components/ui/KpiCard.js';
import { Button } from '../components/ui/Button.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { ObraCard } from '../components/domain/dashboard/ObraCard.js';
import { RecentTransactionsFeed } from '../components/domain/dashboard/RecentTransactionsFeed.js';
import { formatBRL } from '../utils/formatters.js';
import {
  Landmark,
  AlertTriangle,
  FileInput,
  Building2,
  Filter,
  Download,
  Plus,
  ArrowUpRight,
  ArrowRight
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

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
        <LoadingState message="Carregando dados executivos..." minHeight="400px" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
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
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="SALDO CONSOLIDADO"
          value={formatBRL(totalSaldoGeral)}
          icon={Landmark}
          variant="blue"
          trend={{ value: '+5.2%', isPositive: true, label: 'vs mês anterior' }}
        />

        <KpiCard
          title="RECEBÍVEIS VENCIDOS"
          value={formatBRL(inadimplencia?.total_vencido || 0)}
          icon={AlertTriangle}
          variant="red"
          onClick={() => handleNavigate('inadimplencia')}
          subtitle={
            <span className="text-status-late font-bold flex items-center gap-1">
              {inadimplencia?.total_clientes_inadimplentes || 0} contratos pendentes <ArrowUpRight size={13} />
            </span>
          }
        />

        <KpiCard
          title="TOTAL DE ENTRADAS (MÊS)"
          value={formatBRL(totalReceitasGeral)}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Centros de Custo) */}
        <section className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-lg font-bold text-content-main flex items-center gap-2">
              <Building2 size={20} className="text-tech" />
              Centros de Custo por Obra
            </h2>
            <button
              onClick={() => handleNavigate('fluxo')}
              className="text-xs font-bold text-tech hover:text-tech-hover flex items-center gap-1 cursor-pointer transition-colors"
            >
              Ver todas as obras <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {obras.map((obra) => (
              <ObraCard
                key={obra.id}
                obra={obra}
                formatMoney={formatBRL}
                onSelect={(selected) => {
                  setSelectedObra(selected);
                  handleNavigate('fluxo');
                }}
              />
            ))}
          </div>

          {/* Reference Construction Site Overview Banner Card */}
          <div className="rounded-xl overflow-hidden relative shadow-sm h-44 bg-slate-900 border border-border">
            <img
              src="https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80"
              alt="Canteiro de Obras: Visão Geral"
              className="w-full h-full object-cover opacity-65"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent flex flex-col justify-end p-5">
              <span className="font-body text-[10px] font-bold tracking-wider text-brand uppercase">
                CANTEIRO DE OBRAS • CONECTIVIDADE TOTAL
              </span>
              <h3 className="font-headline text-base md:text-lg font-extrabold text-white mt-0.5">
                Diário Fotográfico & Lançamentos Offline do Mestre de Obras
              </h3>
              <p className="font-body text-xs text-white/85 mt-0.5">
                Todos os lançamentos do canteiro são sincronizados automaticamente com o fluxo financeiro da construtora.
              </p>
            </div>
          </div>
        </section>

        {/* Right Column (Últimos Lançamentos) */}
        <section className="flex flex-col gap-4">
          <RecentTransactionsFeed
            transacoes={recentTransacoes}
            formatMoney={formatBRL}
            onViewAll={() => handleNavigate('fluxo')}
          />
        </section>
      </div>
    </div>
  );
};
