import { Router } from 'express';
import { billingController } from '../controllers/billing.controller.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

// Retorna resumo da assinatura e limites
router.get('/subscription', (req, res) => billingController.getSubscriptionOverview(req, res));

// Histórico de faturas
router.get('/invoices', (req, res) => billingController.getInvoices(req, res));

// Status de fatura em tempo real (polling do PIX)
router.get('/invoices/:id/status', (req, res) => billingController.getInvoiceStatus(req, res));

// Iniciar Checkout PIX ou Cartão
router.post('/checkout', (req, res) => billingController.checkout(req, res));

// Cancelar assinatura
router.post('/cancel', (req, res) => billingController.cancelSubscription(req, res));

// Simulação Sandbox de Pagamento
router.post('/simulate-payment', (req, res) => billingController.simulatePayment(req, res));

export default router;
