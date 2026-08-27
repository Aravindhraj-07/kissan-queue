import { Router } from 'express';
import {
  getSlotsByCentreAndDate,
  createSlot,
  updateSlotCapacity,
} from '../controllers/slotController.js';
import { authenticateJWT, requireRoles } from '../middleware/auth.js';

const router = Router();

router.get('/centre/:centreId', getSlotsByCentreAndDate);
router.post('/', authenticateJWT, requireRoles('ADMIN', 'STORAGE_AUTHORITY'), createSlot);
router.patch('/:id', authenticateJWT, requireRoles('ADMIN', 'STORAGE_AUTHORITY'), updateSlotCapacity);

export default router;
