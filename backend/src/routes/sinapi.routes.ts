import { Router } from 'express';
import multer from 'multer';
import { sinapiController } from '../controllers/sinapi.controller.js';
import { authMiddleware, requireRole } from '../middlewares/auth.js';

const router = Router();
const memUpload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

router.get('/search', (req, res) => sinapiController.search(req, res));
router.post('/seed', requireRole(['ADMIN', 'ENGENHEIRO']), (req, res) => sinapiController.seed(req, res));
router.post('/upload', requireRole(['ADMIN', 'ENGENHEIRO']), memUpload.single('file'), (req, res) =>
  sinapiController.uploadSinapiFile(req, res)
);

export default router;
