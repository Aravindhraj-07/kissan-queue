import { Request, Response } from 'express';
import { Booking } from '../models/Booking.js';
import { createBookingAtomic, cancelBooking } from '../services/bookingService.js';
import { AuthRequest } from '../middleware/auth.js';

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { centreId, slotId, cropType, requestedQuantity, unit, bookingSource } = req.body;

    if (!centreId || !slotId || !cropType || !requestedQuantity) {
      res.status(400).json({
        success: false,
        message: 'Centre, Slot, Crop Type, and Quantity are required.',
      });
      return;
    }

    const booking = await createBookingAtomic({
      farmerId: req.user._id.toString(),
      centreId,
      slotId,
      cropType,
      requestedQuantity: Number(requestedQuantity),
      unit: unit || 'Quintal',
      bookingSource: bookingSource || 'WEB',
      actorName: req.user.name,
      actorRole: req.user.role,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('centreId')
      .populate('slotId');

    res.status(201).json({
      success: true,
      message:
        booking.status === 'CONFIRMED'
          ? 'Slot booked successfully! Digital token generated.'
          : 'Slot was full. You are placed on the active waitlist.',
      data: populatedBooking,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const bookings = await Booking.find({ farmerId: req.user._id })
      .populate('centreId')
      .populate('slotId')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('farmerId', 'name phone email')
      .populate('centreId')
      .populate('slotId');

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    res.json({ success: true, data: booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingByToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tokenNumber } = req.params;
    const booking = await Booking.findOne({ tokenNumber: tokenNumber.toUpperCase() })
      .populate('farmerId', 'name phone email')
      .populate('centreId')
      .populate('slotId');

    if (!booking) {
      res.status(404).json({ success: false, message: `Token ${tokenNumber} not found.` });
      return;
    }

    res.json({ success: true, data: booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelMyBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const booking = await cancelBooking(id, req.user._id.toString(), req.user.name, req.user.role);

    res.json({ success: true, message: 'Booking cancelled successfully.', data: booking });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCentreBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { centreId } = req.params;
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const bookings = await Booking.find({ centreId, scheduledDate: date })
      .populate('farmerId', 'name phone email')
      .populate('slotId')
      .sort({ tokenSequence: 1 });

    res.json({ success: true, count: bookings.length, date, data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
