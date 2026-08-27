import { Router } from 'express';
import {
  getFarmerProfile,
  updateFarmerProfile,
  getFarmerDashboardOverview,
} from '../controllers/farmerController.js';
import { authenticateJWT, requireRoles } from '../middleware/auth.js';

const router = Router();

router.get('/profile', authenticateJWT, requireRoles('FARMER', 'ADMIN'), getFarmerProfile);
router.patch('/profile', authenticateJWT, requireRoles('FARMER', 'ADMIN'), updateFarmerProfile);
router.get('/overview', authenticateJWT, requireRoles('FARMER', 'ADMIN'), getFarmerDashboardOverview);

export default router;
