import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware, requireRole } from '../middlewares/auth.js';

const router = Router();

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.get('/me', authMiddleware, (req, res) => authController.me(req, res));
router.get('/team', authMiddleware, (req, res) => authController.listTeamMembers(req, res));
router.post('/team', authMiddleware, requireRole(['ADMIN', 'ENGENHEIRO']), (req, res) =>
  authController.createTeamMember(req, res)
);

export default router;
