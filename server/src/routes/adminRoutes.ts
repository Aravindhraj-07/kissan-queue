import { Router } from 'express';
import {
  getAdminStats,
  getAllUsers,
  toggleUserStatus,
  getAuditLogs,
} from '../controllers/adminController.js';
import { authenticateJWT, requireRoles } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authenticateJWT, requireRoles('ADMIN'), getAdminStats);
router.get('/users', authenticateJWT, requireRoles('ADMIN'), getAllUsers);
router.patch('/users/:id/status', authenticateJWT, requireRoles('ADMIN'), toggleUserStatus);
router.get('/audit-logs', authenticateJWT, requireRoles('ADMIN'), getAuditLogs);

export default router;
