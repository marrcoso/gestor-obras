import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller.js';

const router = Router();

// Webhook público do Asaas
router.post('/asaas', (req, res) => webhookController.handleAsaasWebhook(req, res));

export default router;
