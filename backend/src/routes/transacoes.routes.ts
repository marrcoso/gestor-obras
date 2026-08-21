import { Router } from 'express';
import { transacoesController } from '../controllers/transacoes.controller.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res) => transacoesController.list(req, res));
router.get('/resumo', (req, res) => transacoesController.getFluxoResumo(req, res));
router.post('/', (req, res) => transacoesController.create(req, res));
router.patch('/:id/status', (req, res) => transacoesController.updateStatus(req, res));
router.delete('/:id', (req, res) => transacoesController.delete(req, res));

export default router;
