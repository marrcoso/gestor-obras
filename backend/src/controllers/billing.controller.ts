import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, Subscription, Invoice, PLAN_LIMITS } from '../config/database.js';
import { asaasService } from '../services/asaas.service.js';

export class BillingController {
  /**
   * Garante e obtém a assinatura do Tenant
   */
  private getOrCreateSubscription(tenantId: string): Subscription {
    const store = db.getStore();
    store.subscriptions = store.subscriptions || [];

    let sub = store.subscriptions.find((s) => s.tenant_id === tenantId);

    if (!sub) {
      const now = new Date();
      const expirationDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias de trial

      const tenant = store.tenants.find((t) => t.id === tenantId);
      const plano = tenant?.plano || 'STARTER';

      sub = {
        id: uuidv4(),
        tenant_id: tenantId,
        plano,
        status: 'TRIAL',
        ciclo: 'MENSAL',
        valor: PLAN_LIMITS[plano].preco_mensal,
        data_inicio: now.toISOString(),
        data_expiracao: expirationDate.toISOString(),
        data_proximo_vencimento: expirationDate.toISOString(),
        dias_trial_total: 7,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      };

      store.subscriptions.push(sub);
      db.saveLocalStore();
    }

    return sub;
  }

  /**
   * Retorna visão geral do Billing e status da Assinatura
   */
  public async getSubscriptionOverview(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const store = db.getStore();

      const sub = this.getOrCreateSubscription(tenantId);
      const tenant = store.tenants.find((t) => t.id === tenantId);

      const now = new Date();
      const expDate = new Date(sub.data_expiracao);
      const diffMs = expDate.getTime() - now.getTime();
      const diasRestantes = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      let status = sub.status;
      if (status === 'TRIAL' && diasRestantes <= 0) {
        status = 'EXPIRED';
        sub.status = 'EXPIRED';
        db.saveLocalStore();
      }

      const activeObrasCount = store.obras.filter(
        (o) => o.tenant_id === tenantId && o.status === 'EM_ANDAMENTO'
      ).length;

      const usersCount = store.users.filter((u) => u.tenant_id === tenantId && u.ativo).length;

      const planConfig = PLAN_LIMITS[sub.plano] || PLAN_LIMITS.STARTER;

      const overview = {
        subscription: {
          ...sub,
          status,
          dias_restantes: diasRestantes,
          is_trial: status === 'TRIAL',
          is_active: status === 'ACTIVE' || (status === 'TRIAL' && diasRestantes > 0),
          is_expired: status === 'EXPIRED',
          is_past_due: status === 'PAST_DUE',
          is_canceled: status === 'CANCELED'
        },
        usage: {
          obras_ativas: activeObrasCount,
          max_obras_ativas: planConfig.max_obras_ativas,
          obras_atingiu_limite: activeObrasCount >= planConfig.max_obras_ativas,
          usuarios_ativos: usersCount,
          max_usuarios: planConfig.max_usuarios,
          usuarios_atingiu_limite: usersCount >= planConfig.max_usuarios
        },
        plans: PLAN_LIMITS,
        is_gateway_configured: asaasService.isConfigured()
      };

      return res.json(overview);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Erro ao carregar dados de assinatura' });
    }
  }

  /**
   * Inicia processo de checkout (PIX / Cartão)
   */
  public async checkout(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const {
        plano,
        ciclo,
        formaPagamento,
        creditCard,
        creditCardHolderInfo
      } = req.body;

      if (!plano || !PLAN_LIMITS[plano as keyof typeof PLAN_LIMITS]) {
        return res.status(400).json({ error: 'Plano selecionado inválido' });
      }

      const selectedPlanKey = plano as keyof typeof PLAN_LIMITS;
      const planConfig = PLAN_LIMITS[selectedPlanKey];
      const isAnual = ciclo === 'ANUAL';
      const valorCobrado = isAnual ? planConfig.preco_anual_total : planConfig.preco_mensal;

      const store = db.getStore();
      const tenant = store.tenants.find((t) => t.id === tenantId);
      const user = store.users.find((u) => u.id === req.user?.userId);

      if (!tenant) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }

      const sub = this.getOrCreateSubscription(tenantId);

      // Cria ou busca cliente no Gateway
      const customerId = await asaasService.createOrUpdateCustomer({
        name: tenant.nome_fantasia || user?.nome || 'Cliente ERP Obras',
        email: tenant.email_contato || user?.email || 'contato@empresa.com',
        cpfCnpj: tenant.cnpj,
        phone: tenant.telefone || user?.telefone_whatsapp,
        externalReference: tenant.id
      });

      sub.asaas_customer_id = customerId;
      sub.plano = selectedPlanKey;
      sub.ciclo = isAnual ? 'ANUAL' : 'MENSAL';
      sub.valor = valorCobrado;

      const invoiceId = uuidv4();
      const now = new Date();
      const dueDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      if (formaPagamento === 'CARTAO') {
        if (!creditCard) {
          return res.status(400).json({ error: 'Dados do cartão de crédito não fornecidos' });
        }

        const paymentRes = await asaasService.createCreditCardPayment({
          customerId,
          value: valorCobrado,
          dueDate,
          description: `Assinatura ERP Leve de Obras - Plano ${planConfig.nome} (${isAnual ? 'Anual' : 'Mensal'})`,
          externalReference: invoiceId,
          creditCard,
          creditCardHolderInfo
        });

        const isApproved = paymentRes.status === 'CONFIRMED' || paymentRes.status === 'RECEIVED';
        const expirationDays = isAnual ? 365 : 30;
        const newExpiration = new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000).toISOString();

        const invoice: Invoice = {
          id: invoiceId,
          tenant_id: tenantId,
          subscription_id: sub.id,
          valor: valorCobrado,
          forma_pagamento: 'CARTAO',
          status: isApproved ? 'PAGO' : 'PENDENTE',
          data_vencimento: dueDate,
          data_pagamento: isApproved ? now.toISOString() : undefined,
          asaas_invoice_id: paymentRes.id,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        };

        if (isApproved) {
          sub.status = 'ACTIVE';
          sub.data_inicio = now.toISOString();
          sub.data_expiracao = newExpiration;
          sub.data_proximo_vencimento = newExpiration;
          tenant.plano = selectedPlanKey;
          tenant.max_obras_ativas = planConfig.max_obras_ativas;
        }

        store.invoices = store.invoices || [];
        store.invoices.unshift(invoice);
        db.saveLocalStore();

        return res.status(201).json({
          success: isApproved,
          message: isApproved ? 'Pagamento aprovado e assinatura ativada com sucesso!' : 'Pagamento em processamento',
          invoice,
          subscription: sub
        });
      }

      // PIX Flow
      const paymentRes = await asaasService.createPixPayment({
        customerId,
        value: valorCobrado,
        dueDate,
        description: `Assinatura ERP Leve de Obras - Plano ${planConfig.nome} (${isAnual ? 'Anual' : 'Mensal'})`,
        externalReference: invoiceId
      });

      const invoice: Invoice = {
        id: invoiceId,
        tenant_id: tenantId,
        subscription_id: sub.id,
        valor: valorCobrado,
        forma_pagamento: 'PIX',
        status: 'PENDENTE',
        pix_qrcode_base64: paymentRes.pixQrCode?.encodedImage,
        pix_copia_cola: paymentRes.pixQrCode?.payload,
        boleto_url: paymentRes.bankSlipUrl,
        data_vencimento: dueDate,
        asaas_invoice_id: paymentRes.id,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      };

      store.invoices = store.invoices || [];
      store.invoices.unshift(invoice);
      db.saveLocalStore();

      return res.status(201).json({
        success: true,
        message: 'Cobrança PIX gerada com sucesso!',
        invoice,
        subscription: sub,
        pix: {
          qrCodeImage: paymentRes.pixQrCode?.encodedImage,
          copiaECola: paymentRes.pixQrCode?.payload,
          expirationDate: paymentRes.pixQrCode?.expirationDate
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Erro ao processar checkout' });
    }
  }

  /**
   * Retorna histórico de faturas
   */
  public async getInvoices(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const store = db.getStore();

      const invoices = (store.invoices || [])
        .filter((inv) => inv.tenant_id === tenantId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return res.json(invoices);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Erro ao buscar faturas' });
    }
  }

  /**
   * Cancela assinatura ativa
   */
  public async cancelSubscription(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const store = db.getStore();

      const sub = this.getOrCreateSubscription(tenantId);
      sub.status = 'CANCELED';
      sub.updated_at = new Date().toISOString();

      db.saveLocalStore();
      return res.json({ message: 'Assinatura cancelada com sucesso', subscription: sub });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Erro ao cancelar assinatura' });
    }
  }

  /**
   * Simula aprovação de pagamento no ambiente de testes/sandbox
   */
  public async simulatePayment(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const { invoiceId, plano, ciclo } = req.body;
      const store = db.getStore();

      const sub = this.getOrCreateSubscription(tenantId);
      const tenant = store.tenants.find((t) => t.id === tenantId);

      const targetPlan = (plano as keyof typeof PLAN_LIMITS) || sub.plano || 'PRO';
      const isAnual = (ciclo || sub.ciclo) === 'ANUAL';
      const planConfig = PLAN_LIMITS[targetPlan];
      const now = new Date();
      const expirationDays = isAnual ? 365 : 30;
      const newExpiration = new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000).toISOString();

      sub.plano = targetPlan;
      sub.ciclo = isAnual ? 'ANUAL' : 'MENSAL';
      sub.status = 'ACTIVE';
      sub.valor = isAnual ? planConfig.preco_anual_total : planConfig.preco_mensal;
      sub.data_inicio = now.toISOString();
      sub.data_expiracao = newExpiration;
      sub.data_proximo_vencimento = newExpiration;
      sub.updated_at = now.toISOString();

      if (tenant) {
        tenant.plano = targetPlan;
        tenant.max_obras_ativas = planConfig.max_obras_ativas;
      }

      if (invoiceId) {
        const inv = (store.invoices || []).find((i) => i.id === invoiceId && i.tenant_id === tenantId);
        if (inv) {
          inv.status = 'PAGO';
          inv.data_pagamento = now.toISOString();
          inv.updated_at = now.toISOString();
        }
      } else {
        // Cria fatura quitada
        const newInvoice: Invoice = {
          id: uuidv4(),
          tenant_id: tenantId,
          subscription_id: sub.id,
          valor: sub.valor,
          forma_pagamento: 'PIX',
          status: 'PAGO',
          data_vencimento: now.toISOString().split('T')[0],
          data_pagamento: now.toISOString(),
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        };
        store.invoices = store.invoices || [];
        store.invoices.unshift(newInvoice);
      }

      db.saveLocalStore();

      return res.json({
        success: true,
        message: `Simulação concluída: Assinatura do Plano ${planConfig.nome} ATIVADA com sucesso!`,
        subscription: sub
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Erro ao simular pagamento' });
    }
  }
}

export const billingController = new BillingController();
