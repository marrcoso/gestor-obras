import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware, requireRole } from '../middlewares/auth.js';

const router = Router();

// Rotas públicas
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));

// Rotas protegidas de usuário e perfil
router.get('/me', authMiddleware, (req, res) => authController.me(req, res));
router.patch('/profile', authMiddleware, (req, res) => authController.updateProfile(req, res));
router.post('/change-password', authMiddleware, (req, res) => authController.changePassword(req, res));
router.patch('/tenant', authMiddleware, requireRole(['ADMIN']), (req, res) =>
  authController.updateTenant(req, res)
);

// Rotas de equipe e auditoria
router.get('/team', authMiddleware, (req, res) => authController.listTeamMembers(req, res));
router.post('/team', authMiddleware, requireRole(['ADMIN', 'ENGENHEIRO']), (req, res) =>
  authController.createTeamMember(req, res)
);
router.patch('/team/:id/status', authMiddleware, requireRole(['ADMIN']), (req, res) =>
  authController.updateTeamMemberStatus(req, res)
);
router.get('/activity-logs', authMiddleware, (req, res) => authController.getActivityLogs(req, res));

export default router;
