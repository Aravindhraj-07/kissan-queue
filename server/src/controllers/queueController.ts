import { Request, Response } from 'express';
import {
  getCentreLiveQueue,
  callNextFarmer,
  markFarmerArrived,
  markFarmerNoShow,
} from '../services/queueService.js';
import { AuthRequest } from '../middleware/auth.js';

export const getQueue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { centreId } = req.params;
    const dateStr = req.query.date as string | undefined;

    const queueData = await getCentreLiveQueue(centreId, dateStr);
    res.json({ success: true, data: queueData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const callNext = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { centreId } = req.params;
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const result = await callNextFarmer(centreId, req.user);
    res.json({ success: true, message: 'Next token called successfully.', data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const markArrived = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const result = await markFarmerArrived(bookingId, req.user);
    res.json({ success: true, message: 'Farmer arrival marked.', data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const markNoShow = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const result = await markFarmerNoShow(bookingId, req.user);
    res.json({ success: true, message: 'Booking marked as No-Show and slot reallocated.', data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
