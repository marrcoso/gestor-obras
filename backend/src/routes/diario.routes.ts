import { Router } from 'express';
import { diarioController } from '../controllers/diario.controller.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// Rota pública para cliente final visualizar o relatório de evolução
router.get('/relatorio-cliente/:obraId', (req, res) => diarioController.getClientReport(req, res));

router.use(authMiddleware);

router.get('/', (req, res) => diarioController.list(req, res));
router.post('/', (req, res) => diarioController.create(req, res));

export default router;
