import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Invoice } from '../types/index.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { PlanCards } from '../components/billing/PlanCards.js';
import { CheckoutModal } from '../components/billing/CheckoutModal.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { formatBRL, formatDateBR } from '../utils/formatters.js';
import {
  Crown,
  Sparkles,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardHat,
  Users
} from 'lucide-react';

export const PlanosPage: React.FC = () => {
  const { billingOverview, refreshBilling, obras } = useAuth();
  const [ciclo, setCiclo] = useState<'MENSAL' | 'ANUAL'>('ANUAL');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'PRO' | 'ENTERPRISE'>('PRO');

  useEffect(() => {
    setLoadingInvoices(true);
    api.getInvoices()
      .then(setInvoices)
      .catch(console.error)
      .finally(() => setLoadingInvoices(false));
  }, []);

  const handleOpenCheckout = (plano: 'STARTER' | 'PRO' | 'ENTERPRISE', selectedCiclo: 'MENSAL' | 'ANUAL') => {
    setSelectedPlan(plano);
    setCiclo(selectedCiclo);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = async () => {
    await refreshBilling();
    api.getInvoices().then(setInvoices).catch(console.error);
  };

  if (!billingOverview) {
    return <LoadingState message="Carregando planos e faturas..." />;
  }

  const { subscription, usage } = billingOverview;
  const { is_active, is_trial, is_expired, is_past_due, dias_restantes = 0, plano } = subscription;

  const obrasPct = usage.max_obras_ativas > 0
    ? Math.min(100, Math.round((usage.obras_ativas / usage.max_obras_ativas) * 100))
    : 0;

  const usersPct = usage.max_usuarios > 0
    ? Math.min(100, Math.round((usage.usuarios_ativos / usage.max_usuarios) * 100))
    : 0;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col gap-8 pb-12">
      {/* Header */}
      <PageHeader
        title="Planos & Assinatura"
        subtitle="Gerencie seu plano de acesso ao ERP Leve de Obras, limites de capacidade contratada e histórico de faturas."
      />

      {/* Subscription Status Hero Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-start gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/25 flex items-center justify-center text-brand flex-shrink-0">
            <Crown size={28} />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-lg font-bold font-headline text-content-main">
                Plano {subscription.plano}
              </h3>

              <span
                className={`inline-flex items-center gap-1 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  is_trial
                    ? 'bg-sky-500/15 text-sky-600 border border-sky-500/30'
                    : is_active
                    ? 'bg-sky-500/15 text-status-paid'
                    : 'bg-sky-500/15 text-status-late'
                }`}
              >
                {is_trial ? (
                  <>
                    <Clock size={12} />
                    <span>Em Teste Grátis ({dias_restantes}d restantes)</span>
                  </>
                ) : is_active ? (
                  <>
                    <CheckCircle2 size={12} />
                    <span>Assinatura Ativa ({subscription.ciclo})</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={12} />
                    <span>Expirado / Pendente</span>
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-content-muted">
              {is_trial
                ? 'Você está utilizando o período de avaliação com todas as funcionalidades liberadas.'
                : is_active
                ? `Próxima renovação em ${formatDateBR(subscription.data_expiracao)} no valor de ${formatBRL(subscription.valor)}`
                : 'Regularize sua assinatura para continuar cadastrando obras e relatórios.'}
            </p>
          </div>
        </div>

        {/* Capacity Gauges */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4 border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6 z-10">
          {/* Obras Gauge */}
          <div className="bg-surface-low border border-border rounded-xl p-3.5 flex flex-col gap-2 min-w-[200px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-content-muted flex items-center gap-1.5">
                <HardHat size={14} className="text-brand" />
                Obras em Andamento
              </span>
              <strong className="text-content-main pl-3">
                {usage.obras_ativas} / {usage.max_obras_ativas > 999 ? '∞' : usage.max_obras_ativas}
              </strong>
            </div>
            <div className="w-full bg-border rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usage.obras_atingiu_limite ? 'bg-status-late' : 'bg-brand'
                }`}
                style={{ width: `${usage.max_obras_ativas > 999 ? 20 : obrasPct}%` }}
              />
            </div>
          </div>

          {/* Users Gauge */}
          <div className="bg-surface-low border border-border rounded-xl p-3.5 flex flex-col gap-2 min-w-[200px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-content-muted flex items-center gap-1.5">
                <Users size={14} className="text-tech" />
                Usuários da Equipe
              </span>
              <strong className="text-content-main">
                {usage.usuarios_ativos} / {usage.max_usuarios > 999 ? '∞' : usage.max_usuarios}
              </strong>
            </div>
            <div className="w-full bg-border rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usage.usuarios_atingiu_limite ? 'bg-status-late' : 'bg-tech'
                }`}
                style={{ width: `${usage.max_usuarios > 999 ? 20 : usersPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Comparison Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold font-headline text-content-main flex items-center gap-2">
            <Sparkles size={20} className="text-brand" />
            Planos Disponíveis
          </h3>
          <p className="text-xs text-content-muted">
            Selecione o plano ideal para o tamanho da sua carteira de obras e equipe de campo.
          </p>
        </div>

        <PlanCards
          ciclo={ciclo}
          setCiclo={setCiclo}
          currentPlan={subscription.plano}
          isSubscriptionActive={is_active && !is_trial}
          onSelectPlan={handleOpenCheckout}
        />
      </div>

      {/* Invoice History Section */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-base font-bold font-headline text-content-main flex items-center gap-2">
              <Receipt size={18} className="text-brand" />
              Histórico de Faturas & Recibos
            </h3>
            <span className="text-xs text-content-muted">
              Comprovantes e status de todas as cobranças emitidas para sua construtora.
            </span>
          </div>
        </div>

        {loadingInvoices ? (
          <LoadingState message="Carregando faturas..." minHeight="120px" />
        ) : invoices.length === 0 ? (
          <div className="bg-surface-low rounded-xl p-6 text-center text-xs text-content-dim flex flex-col items-center gap-2">
            <Receipt size={24} className="text-content-dim/60" />
            <span>Nenhuma fatura gerada até o momento.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-content-dim font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Descrição</th>
                  <th className="py-2.5 px-3">Forma</th>
                  <th className="py-2.5 px-3">Valor</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-content-muted">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface-low/50 transition-colors">
                    <td className="py-3 px-3 font-mono text-content-main">
                      {formatDateBR(inv.created_at)}
                    </td>
                    <td className="py-3 px-3 text-content-main font-semibold">
                      Assinatura ERP Leve de Obras
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-[11px] px-2 py-0.5 rounded bg-surface-low text-content-main border border-border">
                        {inv.forma_pagamento}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-content-main font-mono">
                      {formatBRL(inv.valor)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          inv.status === 'PAGO'
                            ? 'bg-status-paid/15 text-status-paid border border-status-paid/30'
                            : inv.status === 'PENDENTE'
                            ? 'bg-status-warning/15 text-status-warning border border-status-warning/30'
                            : 'bg-status-late/15 text-status-late border border-status-late/30'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlan={selectedPlan}
        ciclo={ciclo}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  );
};
