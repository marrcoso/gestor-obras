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
    <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2.5vw, 24px)' }}>
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
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'clamp(12px, 1.5vw, 20px)'
        }}
      >
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
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <h2 className="heading-section" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="var(--status-late)" />
                Faturas & Medições em Atraso
              </h2>

              <SearchBar
                placeholder="Buscar cliente ou obra..."
                value={searchQuery}
                onChange={setSearchQuery}
                style={{ maxWidth: '260px' }}
              />
            </div>

            {/* Table */}
            <div style={{ padding: '16px' }}>
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
              <h3 className="heading-card" style={{ marginBottom: '12px' }}>
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
    </div>
  );
};
