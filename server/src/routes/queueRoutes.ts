import { Router } from 'express';
import {
  getQueue,
  callNext,
  markArrived,
  markNoShow,
} from '../controllers/queueController.js';
import { authenticateJWT, requireRoles } from '../middleware/auth.js';

const router = Router();

router.get('/:centreId', getQueue);
router.post(
  '/:centreId/next',
  authenticateJWT,
  requireRoles('STORAGE_AUTHORITY', 'ADMIN'),
  callNext
);
router.post(
  '/:bookingId/arrived',
  authenticateJWT,
  requireRoles('STORAGE_AUTHORITY', 'ADMIN'),
  markArrived
);
router.post(
  '/:bookingId/no-show',
  authenticateJWT,
  requireRoles('STORAGE_AUTHORITY', 'ADMIN'),
  markNoShow
);

export default router;
