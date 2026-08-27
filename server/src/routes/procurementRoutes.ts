import { Router } from 'express';
import {
  recordProcurement,
  getProcurementsByCentre,
  getProcurementsByFarmer,
  getProcurementBySlipNumber,
} from '../controllers/procurementController.js';
import { authenticateJWT, requireRoles } from '../middleware/auth.js';

const router = Router();

router.post(
  '/',
  authenticateJWT,
  requireRoles('STORAGE_AUTHORITY', 'ADMIN'),
  recordProcurement
);
router.get('/centre/:centreId', authenticateJWT, getProcurementsByCentre);
router.get('/my', authenticateJWT, getProcurementsByFarmer);
router.get('/slip/:slipNumber', getProcurementBySlipNumber);

export default router;
