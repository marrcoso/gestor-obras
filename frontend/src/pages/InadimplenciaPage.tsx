import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { ContaReceber, InadimplenciaRadarData } from '../types/index.js';
import { api } from '../services/api.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { KpiCard } from '../components/ui/KpiCard.js';
import { Button } from '../components/ui/Button.js';
import { SearchBar } from '../components/ui/SearchBar.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { ReceivableTable } from '../components/domain/inadimplencia/ReceivableTable.js';
import { NewReceivableModal } from '../components/domain/inadimplencia/NewReceivableModal.js';
import { WhatsAppModal } from '../components/WhatsAppModal.js';
import {
  AlertTriangle,
  Download,
  Plus,
  Wallet,
  Clock,
  Gavel
} from 'lucide-react';

export const InadimplenciaPage: React.FC = () => {
  const { obras, selectedObra, refreshObras } = useAuth();
  const [radar, setRadar] = useState<InadimplenciaRadarData | null>(null);
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedContaIdWhatsApp, setSelectedContaIdWhatsApp] = useState<string | null>(null);
  const [modalNovaConta, setModalNovaConta] = useState(false);
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

  const handleSalvarConta = async (payload: {
    obraId: string;
    numeroParcela: number;
    descricaoMedicao: string;
    valor: number;
    dataVencimento: string;
  }) => {
    setSalvando(true);
    try {
      await api.createContaReceber(payload);
      setModalNovaConta(false);
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
      <WhatsAppModal
        contaId={selectedContaIdWhatsApp}
        onClose={() => setSelectedContaIdWhatsApp(null)}
        onSuccess={() => carregarDados()}
      />

      <NewReceivableModal
        isOpen={modalNovaConta}
        onClose={() => setModalNovaConta(false)}
        obras={obras}
        selectedObraId={selectedObra?.id || ''}
        onSave={handleSalvarConta}
        saving={salvando}
      />

      {/* Header Section */}
      <PageHeader
        title="Radar de Inadimplência"
        subtitle="Visão geral dos recebimentos atrasados, réguas de cobrança e acionamento em 1 clique via WhatsApp."
        actions={
          <>
            <Button variant="secondary" icon={Download} onClick={() => window.print()}>
              Exportar Relatório
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setModalNovaConta(true)}>
              Nova Medição
            </Button>
          </>
        }
      />

      {/* 4 Aging KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="TOTAL VENCIDO"
          value={formatMoney(radar?.total_vencido || 0)}
          icon={Wallet}
          variant="red"
          subtitle={`${radar?.total_clientes_inadimplentes || 0} contratos pendentes`}
        />

        <KpiCard
          title="1-15 DIAS (LEVE)"
          value={formatMoney(radar?.aging.vencido_1_a_15_dias || 0)}
          icon={Clock}
          variant="amber"
          subtitle="Lembrete cordial WhatsApp"
        />

        <KpiCard
          title="16-30 DIAS (ATENÇÃO)"
          value={formatMoney(radar?.aging.vencido_16_a_30_dias || 0)}
          icon={AlertTriangle}
          variant="orange"
          subtitle="Aviso de paralisação de etapa"
        />

        <KpiCard
          title="+30 DIAS (CRÍTICO)"
          value={formatMoney(radar?.aging.vencido_mais_30_dias || 0)}
          icon={Gavel}
          variant="red"
          subtitle="Encaminhado para jurídico"
        />
      </section>

      {/* 2-Column Split Layout: Table (2/3) vs Visual Insight (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Overdue Invoices Table (2/3) */}
        <section className="lg:col-span-2 flex flex-col">
          <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col overflow-hidden">
            {/* Table Header Bar */}
            <div className="p-4 md:px-5 bg-surface-low border-b-2 border-border flex items-center justify-between flex-wrap gap-2.5">
              <h2 className="font-headline text-base font-bold text-content-main flex items-center gap-2">
                <AlertTriangle size={18} className="text-status-late" />
                Faturas & Medições em Atraso
              </h2>

              <SearchBar
                placeholder="Buscar cliente ou obra..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="max-w-xs"
              />
            </div>

            {/* Table */}
            <div className="p-4">
              {loading ? (
                <LoadingState message="Carregando faturas e recebíveis..." minHeight="200px" />
              ) : (
                <ReceivableTable
                  contas={filteredContas}
                  formatMoney={formatMoney}
                  onOpenWhatsApp={setSelectedContaIdWhatsApp}
                  onMarkPaid={handleMarcarRecebido}
                />
              )}
            </div>
          </div>
        </section>

        {/* Right: Visual Analysis Card (1/3) */}
        <section className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm flex flex-col justify-between h-full">
            <div>
              <h3 className="font-headline text-base font-bold text-content-main mb-3">
                Análise Visual de Inadimplência
              </h3>

              <div className="rounded-md overflow-hidden relative bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
                  alt="Análise visual de recebíveis"
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end p-3.5">
                  <span className="font-body text-[10px] font-bold text-[#ffb690] uppercase tracking-wider">
                    CURVA DE RECEBÍVEIS • CONCENTRAÇÃO RESIDENCIAL
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="font-body text-xs md:text-sm text-content-muted leading-relaxed">
                A régua inteligente de cobrança via WhatsApp reduz em até <strong className="text-content-main">78%</strong> os atrasos médios na entrega de chaves e marcos estruturais.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
