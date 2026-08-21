import { Router } from 'express';
import { obrasController } from '../controllers/obras.controller.js';
import { authMiddleware, requireRole } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res) => obrasController.list(req, res));
router.get('/:id', (req, res) => obrasController.getById(req, res));
router.post('/', requireRole(['ADMIN', 'ENGENHEIRO']), (req, res) => obrasController.create(req, res));
router.put('/:id', requireRole(['ADMIN', 'ENGENHEIRO']), (req, res) => obrasController.update(req, res));
router.delete('/:id', requireRole(['ADMIN']), (req, res) => obrasController.delete(req, res));

export default router;
