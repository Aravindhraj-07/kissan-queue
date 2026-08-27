import { Router } from 'express';
import {
  getTransportTasks,
  assignTask,
  updateTaskStatus,
} from '../controllers/logisticsController.js';
import { authenticateJWT, requireRoles } from '../middleware/auth.js';

const router = Router();

router.get('/tasks', authenticateJWT, getTransportTasks);
router.post(
  '/tasks/:id/assign',
  authenticateJWT,
  requireRoles('LOGISTICS', 'ADMIN', 'STORAGE_AUTHORITY'),
  assignTask
);
router.patch(
  '/tasks/:id/status',
  authenticateJWT,
  requireRoles('LOGISTICS', 'ADMIN', 'STORAGE_AUTHORITY'),
  updateTaskStatus
);

export default router;
