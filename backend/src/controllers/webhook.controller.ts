import { Request, Response } from 'express';
import { db, PLAN_LIMITS } from '../config/database.js';

export class WebhookController {
  public async handleAsaasWebhook(req: Request, res: Response) {
    try {
      const webhookToken = req.headers['asaas-access-token'];
      const expectedToken = process.env.ASAAS_WEBHOOK_SECRET;

      // Valida token se configurado no ambiente
      if (expectedToken && webhookToken !== expectedToken) {
        console.warn('[Asaas Webhook] Token de acesso inválido');
        return res.status(401).json({ error: 'Token de webhook inválido' });
      }

      const { event, payment } = req.body;
      console.log(`[Asaas Webhook] Evento recebido: ${event} para pagamento ID: ${payment?.id}`);

      if (!payment) {
        return res.status(200).json({ received: true, ignored: true });
      }

      const store = db.getStore();
      store.invoices = store.invoices || [];
      store.subscriptions = store.subscriptions || [];

      // Procura a fatura pelo ID do Asaas ou externalReference
      const invoice = store.invoices.find(
        (i) => i.asaas_invoice_id === payment.id || i.id === payment.externalReference
      );

      if (!invoice) {
        console.warn(`[Asaas Webhook] Nenhuma fatura local encontrada para o pagamento ${payment.id}`);
        return res.status(200).json({ received: true, note: 'Invoice not found' });
      }

      const subscription = store.subscriptions.find((s) => s.id === invoice.subscription_id);
      const tenant = store.tenants.find((t) => t.id === invoice.tenant_id);

      const now = new Date();

      switch (event) {
        case 'PAYMENT_RECEIVED':
        case 'PAYMENT_CONFIRMED': {
          invoice.status = 'PAGO';
          invoice.data_pagamento = now.toISOString();
          invoice.updated_at = now.toISOString();

          if (subscription) {
            const isAnual = subscription.ciclo === 'ANUAL';
            const daysToAdd = isAnual ? 365 : 30;
            const newExpiration = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();

            subscription.status = 'ACTIVE';
            subscription.data_expiracao = newExpiration;
            subscription.data_proximo_vencimento = newExpiration;
            subscription.updated_at = now.toISOString();

            if (tenant) {
              tenant.plano = subscription.plano;
              tenant.max_obras_ativas = PLAN_LIMITS[subscription.plano].max_obras_ativas;
            }
          }
          break;
        }

        case 'PAYMENT_OVERDUE': {
          invoice.status = 'VENCIDO';
          invoice.updated_at = now.toISOString();

          if (subscription && subscription.status !== 'ACTIVE') {
            subscription.status = 'PAST_DUE';
            subscription.updated_at = now.toISOString();
          }
          break;
        }

        case 'PAYMENT_REFUNDED':
        case 'PAYMENT_DELETED': {
          invoice.status = 'CANCELADO';
          invoice.updated_at = now.toISOString();

          if (subscription) {
            subscription.status = 'CANCELED';
            subscription.updated_at = now.toISOString();
          }
          break;
        }

        case 'SUBSCRIPTION_DELETED': {
          if (subscription) {
            subscription.status = 'CANCELED';
            subscription.updated_at = now.toISOString();
          }
          break;
        }

        default:
          console.log(`[Asaas Webhook] Evento ${event} registrado sem mutações`);
      }

      db.saveLocalStore();
      return res.status(200).json({ received: true, success: true });
    } catch (err: any) {
      console.error('[Asaas Webhook Error]:', err);
      return res.status(500).json({ error: err.message || 'Erro ao processar webhook' });
    }
  }
}

export const webhookController = new WebhookController();
