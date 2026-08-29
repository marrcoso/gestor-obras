import { Request, Response, NextFunction } from 'express';
import { db, PLAN_LIMITS } from '../config/database.js';

/**
 * Middleware para garantir que o Tenant possua uma assinatura ativa ou em período de Trial válido
 */
export const enforceActiveSubscription = (req: Request, res: Response, next: NextFunction) => {
  // Ignora rotas de leitura (GET) para permitir consulta de histórico mesmo expirado
  if (req.method === 'GET' || req.method === 'OPTIONS') {
    return next();
  }

  const tenantId = req.tenantId;
  if (!tenantId) {
    return next();
  }

  const store = db.getStore();
  const sub = (store.subscriptions || []).find((s) => s.tenant_id === tenantId);

  if (!sub) {
    // Se não há registro de assinatura, permite continuar e deixa o controller criar o trial
    return next();
  }

  const now = new Date();
  const expDate = new Date(sub.data_expiracao);
  const diffMs = expDate.getTime() - now.getTime();
  const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const GRACE_PERIOD_DAYS = 5;

  if (sub.status === 'EXPIRED' || (sub.status === 'TRIAL' && diasRestantes < 0)) {
    return res.status(402).json({
      error: 'Seu período de testes ou assinatura expirou. Acesse a aba Planos para reativar o acesso total.',
      code: 'SUBSCRIPTION_EXPIRED',
      subscription_status: sub.status
    });
  }

  if (sub.status === 'PAST_DUE') {
    const diasAtraso = Math.max(0, Math.ceil((now.getTime() - expDate.getTime()) / (1000 * 60 * 60 * 24)));
    if (diasAtraso > GRACE_PERIOD_DAYS) {
      sub.status = 'EXPIRED';
      db.saveLocalStore();
      return res.status(402).json({
        error: `Sua assinatura possui fatura pendente há mais de ${GRACE_PERIOD_DAYS} dias. Regularize na aba Planos para desbloquear o lançamento de dados.`,
        code: 'SUBSCRIPTION_EXPIRED',
        subscription_status: 'EXPIRED'
      });
    }
    // Permite prosseguir dentro do Grace Period (5 dias de tolerância)
    res.setHeader('X-Subscription-Warning', `PAST_DUE_GRACE_PERIOD_${diasAtraso}_DAYS`);
    return next();
  }

  if (sub.status === 'CANCELED') {
    return res.status(402).json({
      error: 'Sua assinatura está cancelada. Faça uma nova assinatura para continuar gerenciando obras.',
      code: 'SUBSCRIPTION_CANCELED',
      subscription_status: sub.status
    });
  }

  next();
};

/**
 * Middleware auxiliar para validação de limites de obras ativas
 */
export const checkObraLimit = (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId;
  if (!tenantId) return next();

  const store = db.getStore();
  const sub = (store.subscriptions || []).find((s) => s.tenant_id === tenantId);
  const planoKey = sub?.plano || 'STARTER';
  const planConfig = PLAN_LIMITS[planoKey] || PLAN_LIMITS.STARTER;

  const activeObrasCount = store.obras.filter(
    (o) => o.tenant_id === tenantId && o.status === 'EM_ANDAMENTO'
  ).length;

  if (activeObrasCount >= planConfig.max_obras_ativas) {
    return res.status(403).json({
      error: `Você atingiu o limite de ${planConfig.max_obras_ativas} obras ativas do Plano ${planConfig.nome}. Faça upgrade de plano para cadastrar novas obras.`,
      code: 'PLAN_LIMIT_REACHED',
      current_count: activeObrasCount,
      max_allowed: planConfig.max_obras_ativas,
      plan: planoKey
    });
  }

  next();
};
