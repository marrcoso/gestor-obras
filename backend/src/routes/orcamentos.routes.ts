import { Router } from 'express';
import { orcamentosController } from '../controllers/orcamentos.controller.js';
import { authMiddleware, requireRole } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res) => orcamentosController.list(req, res));
router.get('/:id', (req, res) => orcamentosController.getById(req, res));
router.post('/', requireRole(['ADMIN', 'ENGENHEIRO']), (req, res) => orcamentosController.create(req, res));
router.post('/:id/itens', requireRole(['ADMIN', 'ENGENHEIRO']), (req, res) =>
  orcamentosController.addItem(req, res)
);
router.delete('/:id/itens/:itemId', requireRole(['ADMIN', 'ENGENHEIRO']), (req, res) =>
  orcamentosController.deleteItem(req, res)
);

export default router;
