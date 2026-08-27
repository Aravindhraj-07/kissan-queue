import { Router } from 'express';
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/notificationController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateJWT, getMyNotifications);
router.patch('/:id/read', authenticateJWT, markNotificationAsRead);
router.patch('/read-all', authenticateJWT, markAllNotificationsAsRead);

export default router;
