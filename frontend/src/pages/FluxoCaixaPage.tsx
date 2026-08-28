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
import { formatBRL } from '../utils/formatters.js';
import {
  Plus,
  ArrowDown,
  ArrowUp,
  Clock,
  Download,
  Building2
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
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
          <div className="flex items-center gap-1.5">
            <Building2 size={16} className="text-tech" />
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
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="ENTRADAS RECEBIDAS"
          value={formatBRL(resumo?.total_receitas || 0)}
          icon={ArrowDown}
          variant="blue"
        />

        <KpiCard
          title="DESPESAS PAGAS"
          value={formatBRL(resumo?.total_despesas || 0)}
          icon={ArrowUp}
          variant="red"
        />

        <KpiCard
          title="SALDO ATUAL DA OBRA"
          value={formatBRL(resumo?.saldo_liquido || 0)}
          icon={Building2}
          variant="emerald"
        />

        <KpiCard
          title="A PAGAR (PENDENTE)"
          value={formatBRL(resumo?.total_despesas_pendentes || 0)}
          icon={Clock}
          variant="amber"
        />
      </section>

      {/* Main Table Container & Filters */}
      <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 md:px-5 bg-surface-low border-b border-border grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
          {/* Categoria */}
          <div className="flex flex-col gap-1">
            <label className="font-body text-fluid-mono font-bold uppercase tracking-wider text-content-muted">
              CATEGORIA
            </label>
            <select
              className="bg-input border border-border rounded-md px-3.5 py-2 font-body text-xs md:text-sm text-content-main w-full min-h-[38px] outline-none focus:border-tech"
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
          <div className="flex flex-col gap-1">
            <label className="font-body text-fluid-mono font-bold uppercase tracking-wider text-content-muted">
              STATUS
            </label>
            <select
              className="bg-input border border-border rounded-md px-3.5 py-2 font-body text-xs md:text-sm text-content-main w-full min-h-[38px] outline-none focus:border-tech"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="">Todos os Status</option>
              <option value="PAGO">Pago</option>
              <option value="PENDENTE">Aguardando / Pendente</option>
            </select>
          </div>

          {/* Busca */}
          <div className="flex flex-col gap-1">
            <label className="font-body text-fluid-mono font-bold uppercase tracking-wider text-content-muted">
              BUSCA
            </label>
            <SearchBar
              placeholder="Buscar descrição ou fornecedor..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="p-4">
          {loading ? (
            <LoadingState message="Carregando transações financeiras..." minHeight="200px" />
          ) : (
            <TransactionTable
              transacoes={filteredTransacoes}
              formatMoney={formatBRL}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
              onOpenComprovante={setSelectedComprovante}
            />
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-border-light bg-surface-low text-xs text-content-dim font-body">
          Mostrando {filteredTransacoes.length} de {transacoes.length} lançamentos
        </div>
      </div>

      {/* Visual Projection Chart Card */}
      <div className="rounded-xl overflow-hidden relative h-40 bg-slate-900 shadow-sm border border-border">
        <img
          src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80"
          alt="Análise Visual de Fluxo de Caixa"
          className="w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent flex flex-col justify-end p-5">
          <span className="font-body text-[11px] font-bold text-[#38bdf8] uppercase tracking-wider">
            ANÁLISE FINANCEIRA AUTOMATIZADA
          </span>
          <h3 className="font-headline text-base md:text-lg font-bold text-white mt-0.5">
            Curva de Desembolso & Projeção de Saldo da Obra
          </h3>
          <p className="font-body text-xs text-white/75 mt-0.5">
            O caixa isolado desta obra garante segurança jurídica e controle absoluto contra desvios de centro de custo.
          </p>
        </div>
      </div>
    </div>
  );
};
