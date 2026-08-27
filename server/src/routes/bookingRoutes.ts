import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  getBookingByToken,
  cancelMyBooking,
  getCentreBookings,
} from '../controllers/bookingController.js';
import { authenticateJWT, requireRoles } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateJWT, createBooking);
router.get('/my', authenticateJWT, getMyBookings);
router.get('/token/:tokenNumber', getBookingByToken);
router.get('/centre/:centreId', authenticateJWT, getCentreBookings);
router.get('/:id', authenticateJWT, getBookingById);
router.patch('/:id/cancel', authenticateJWT, cancelMyBooking);

export default router;
