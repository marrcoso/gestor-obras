import React from 'react';
import { Check, Crown, Sparkles, Zap, Building2 } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { formatBRL } from '../../utils/formatters.js';

interface PlanCardsProps {
  ciclo: 'MENSAL' | 'ANUAL';
  setCiclo: (c: 'MENSAL' | 'ANUAL') => void;
  currentPlan?: string;
  isSubscriptionActive?: boolean;
  onSelectPlan: (plano: 'STARTER' | 'PRO' | 'ENTERPRISE', ciclo: 'MENSAL' | 'ANUAL') => void;
}

export const PlanCards: React.FC<PlanCardsProps> = ({
  ciclo,
  setCiclo,
  currentPlan = 'STARTER',
  isSubscriptionActive = false,
  onSelectPlan
}) => {
  const isAnual = ciclo === 'ANUAL';

  const plans = [
    {
      id: 'STARTER' as const,
      name: 'Autônomo / Starter',
      badge: 'Ideal para 1 a 2 obras',
      price: isAnual ? 77 : 97,
      totalPriceAnnual: 924,
      obrasLimit: 'Até 2 obras simultâneas',
      usersLimit: '2 usuários (1 Admin + 1 Campo)',
      icon: Zap,
      accentColor: 'border-border hover:border-brand/40',
      features: [
        'Tabela SINAPI da Caixa atualizada mensalmente',
        'App do Canteiro Mobile com modo offline',
        'Controle de despesas com fotos de comprovantes',
        'Lançamentos rápidos pelo WhatsApp (em breve)',
        'Suporte por email'
      ]
    },
    {
      id: 'PRO' as const,
      name: 'Construtora / Pro',
      badge: '⭐ Mais Escolhido',
      popular: true,
      price: isAnual ? 197 : 247,
      totalPriceAnnual: 2364,
      obrasLimit: 'Até 6 obras simultâneas',
      usersLimit: '5 usuários (Admin, Engenheiros e Mestres)',
      icon: Crown,
      accentColor: 'border-brand ring-2 ring-brand/30 shadow-primary/20',
      features: [
        'Tudo do Plano Starter',
        'Diário Fotográfico de Obras Ilimitado',
        'Radar de Inadimplência com cobrança WhatsApp',
        'Relatórios Gerenciais e Fotográficos em PDF',
        'Exportação de Fluxo de Caixa para Excel',
        'Suporte prioritário via WhatsApp'
      ]
    },
    {
      id: 'ENTERPRISE' as const,
      name: 'Escala / Enterprise',
      badge: 'Para múltiplas obras',
      price: isAnual ? 397 : 497,
      totalPriceAnnual: 4764,
      obrasLimit: 'Obras ilimitadas',
      usersLimit: 'Usuários e mestres ilimitados',
      icon: Building2,
      accentColor: 'border-border hover:border-tech/50',
      features: [
        'Tudo do Plano Construtora Pro',
        'Obras e Usuários Ilimitados',
        'Cálculo de BDI personalizado por cliente',
        'Logomarca da sua construtora nos relatórios PDF',
        'Importação assistida de planilhas antigas',
        'Gerente de conta exclusivo'
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Billing Cycle Switcher */}
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="bg-surface-low border border-border p-1 rounded-xl flex items-center shadow-inner">
          <button
            type="button"
            onClick={() => setCiclo('MENSAL')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !isAnual
                ? 'bg-card text-content-main shadow-sm border border-border'
                : 'text-content-muted hover:text-content-main'
            }`}
          >
            Cobrança Mensal
          </button>

          <button
            type="button"
            onClick={() => setCiclo('ANUAL')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isAnual
                ? 'bg-brand text-white shadow-primary'
                : 'text-content-muted hover:text-content-main'
            }`}
          >
            <span>Cobrança Anual</span>
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                isAnual ? 'bg-white text-brand' : 'bg-status-paid/15 text-status-paid border border-status-paid/30'
              }`}
            >
              20% OFF
            </span>
          </button>
        </div>
        <span className="text-[11px] text-content-dim font-medium">
          {isAnual
            ? '✨ Economize até R$ 1.200 por ano pagando no plano anual'
            : '💡 Dica: No plano anual você ganha 2 meses grátis'}
        </span>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => {
          const isCurrent = isSubscriptionActive && currentPlan === plan.id;
          const Icon = plan.icon;

          return (
            <div
              key={plan.id}
              className={`bg-card rounded-2xl border ${
                plan.accentColor
              } p-6 flex flex-col justify-between relative shadow-sm transition-all duration-300 hover:shadow-md ${
                plan.popular ? 'bg-gradient-to-b from-brand/5 to-card' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-primary flex items-center gap-1">
                  <Sparkles size={11} />
                  <span>Mais Recomendado</span>
                </div>
              )}

              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-content-dim uppercase tracking-wider">
                      {plan.badge}
                    </span>
                    <h4 className="text-lg font-bold font-headline text-content-main mt-0.5">
                      {plan.name}
                    </h4>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-surface-low border border-border flex items-center justify-center text-brand">
                    <Icon size={18} />
                  </div>
                </div>

                {/* Price */}
                <div className="flex flex-col py-3 border-y border-border/70">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-content-muted">R$</span>
                    <span className="text-3xl md:text-4xl font-extrabold font-headline text-content-main tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-xs text-content-muted font-medium">/mês</span>
                  </div>
                  {isAnual && (
                    <span className="text-[11px] text-content-dim mt-1">
                      Faturado anualmente em {formatBRL(plan.totalPriceAnnual)}
                    </span>
                  )}
                </div>

                {/* Main Limits Pill */}
                <div className="bg-surface-low rounded-xl p-3 flex flex-col gap-1.5 text-xs font-semibold">
                  <div className="flex items-center justify-between text-content-main">
                    <span className="text-content-muted font-normal">Capacidade:</span>
                    <strong className="text-brand">{plan.obrasLimit}</strong>
                  </div>
                  <div className="flex items-center justify-between text-content-main">
                    <span className="text-content-muted font-normal">Equipe:</span>
                    <span>{plan.usersLimit}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="flex flex-col gap-2.5 mt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-content-dim">
                    O que está incluso:
                  </span>
                  <ul className="flex flex-col gap-2 text-xs text-content-muted">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <Check size={15} className="text-status-paid flex-shrink-0 mt-0.5" />
                        <span className="text-content-main">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-border/70">
                {isCurrent ? (
                  <div className="w-full py-2.5 px-4 rounded-xl bg-status-paid/15 border border-status-paid/30 text-status-paid font-bold text-xs text-center flex items-center justify-center gap-1.5">
                    <Check size={15} />
                    <span>Seu Plano Atual</span>
                  </div>
                ) : (
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    className="w-full"
                    onClick={() => onSelectPlan(plan.id, ciclo)}
                  >
                    {currentPlan === plan.id ? 'Renovar / Alterar Ciclo' : 'ESCOLHER PLANO'}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
