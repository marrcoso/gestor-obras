import { Router } from 'express';
import { contasReceberController } from '../controllers/contas-receber.controller.js';
import { authMiddleware, requireRole } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res) => contasReceberController.list(req, res));
router.get('/radar', (req, res) => contasReceberController.getInadimplenciaRadar(req, res));
router.get('/:id/whatsapp-cobranca', (req, res) => contasReceberController.getWhatsappCobrancaMessage(req, res));
router.post('/', requireRole(['ADMIN', 'ENGENHEIRO']), (req, res) => contasReceberController.create(req, res));
router.patch('/:id/receber', requireRole(['ADMIN', 'ENGENHEIRO']), (req, res) =>
  contasReceberController.marcarRecebido(req, res)
);
router.patch('/:id/contato', requireRole(['ADMIN', 'ENGENHEIRO']), (req, res) =>
  contasReceberController.registrarContatoCobranca(req, res)
);

export default router;
