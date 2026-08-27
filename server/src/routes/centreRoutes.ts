import { Router } from 'express';
import {
  getCentres,
  getCentreById,
  createCentre,
  updateCentre,
} from '../controllers/centreController.js';
import { authenticateJWT, requireRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', getCentres);
router.get('/:id', getCentreById);
router.post('/', authenticateJWT, requireRoles('ADMIN', 'STORAGE_AUTHORITY'), createCentre);
router.patch('/:id', authenticateJWT, requireRoles('ADMIN', 'STORAGE_AUTHORITY'), updateCentre);

export default router;
