import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { TransacaoFinanceira, FluxoResumo } from '../types/index.js';
import { api } from '../services/api.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { KpiCard } from '../components/ui/KpiCard.js';
import { Button } from '../components/ui/Button.js';
import { SearchBar } from '../components/ui/SearchBar.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { TransactionTable } from '../components/domain/financeiro/TransactionTable.js';
import { NewTransactionModal } from '../components/domain/financeiro/NewTransactionModal.js';
import { ReceiptModal } from '../components/ReceiptModal.js';
import {
  Plus,
  ArrowDown,
  ArrowUp,
  Clock,
  Download,
  Building2,
  Calendar
} from 'lucide-react';

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

  const handleSalvarLancamento = async (payload: {
    tipo: 'DESPESA' | 'RECEITA';
    categoria: string;
    descricao: string;
    valor: number;
    dataVencimento: string;
    fornecedorBeneficiario: string;
    status: 'PAGO' | 'PENDENTE';
    arquivoComprovante: File | null;
  }) => {
    if (!selectedObra) return;

    setSalvando(true);
    try {
      let comprovanteUrl: string | undefined = undefined;
      if (payload.arquivoComprovante) {
        const uploadRes = await api.uploadFile(payload.arquivoComprovante, 'comprovantes');
        comprovanteUrl = uploadRes.url;
      }

      await api.createTransacao({
        obraId: selectedObra.id,
        tipo: payload.tipo,
        categoria: payload.categoria,
        descricao: payload.descricao,
        valor: payload.valor,
        dataVencimento: payload.dataVencimento,
        dataCompetencia: payload.dataVencimento,
        fornecedorBeneficiario: payload.fornecedorBeneficiario,
        status: payload.status,
        comprovanteUrl,
        origemLancamento: 'WEB'
      });

      setModalNovoAberto(false);
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

      <NewTransactionModal
        isOpen={modalNovoAberto}
        onClose={() => setModalNovoAberto(false)}
        onSave={handleSalvarLancamento}
        saving={salvando}
      />

      {/* Header Section */}
      <PageHeader
        title="Fluxo de Caixa"
        subtitle={
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={16} color="var(--technical-blue)" />
            <span>{selectedObra ? selectedObra.nome : 'Todas as Obras • Centro Consolidado'}</span>
          </div>
        }
        actions={
          <>
            <Button variant="secondary" icon={Download} onClick={() => window.print()}>
              EXPORTAR
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setModalNovoAberto(true)}>
              NOVO REGISTRO
            </Button>
          </>
        }
      />

      {/* 4 KPI Cards */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'clamp(12px, 1.5vw, 20px)'
        }}
      >
        <KpiCard
          title="ENTRADAS RECEBIDAS"
          value={formatMoney(resumo?.total_receitas || 0)}
          icon={ArrowDown}
          variant="blue"
        />

        <KpiCard
          title="DESPESAS PAGAS"
          value={formatMoney(resumo?.total_despesas || 0)}
          icon={ArrowUp}
          variant="red"
        />

        <KpiCard
          title="SALDO ATUAL DA OBRA"
          value={formatMoney(resumo?.saldo_liquido || 0)}
          icon={Building2}
          variant="emerald"
        />

        <KpiCard
          title="A PAGAR (PENDENTE)"
          value={formatMoney(resumo?.total_despesas_pendentes || 0)}
          icon={Clock}
          variant="amber"
        />
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            alignItems: 'flex-end'
          }}
        >
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
            <SearchBar
              placeholder="Buscar descrição ou fornecedor..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
        </div>

        {/* Data Table */}
        <div style={{ padding: '16px' }}>
          {loading ? (
            <LoadingState message="Carregando transações financeiras..." minHeight="200px" />
          ) : (
            <TransactionTable
              transacoes={filteredTransacoes}
              formatMoney={formatMoney}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
              onOpenComprovante={setSelectedComprovante}
            />
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-surface-low)',
            fontSize: '12px',
            color: 'var(--text-dim)'
          }}
        >
          Mostrando {filteredTransacoes.length} de {transacoes.length} lançamentos
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
    </div>
  );
};
