import { Request, Response } from 'express';
import { Procurement } from '../models/Procurement.js';
import { recordProcurementTransaction } from '../services/procurementService.js';
import { AuthRequest } from '../middleware/auth.js';

export const recordProcurement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      bookingId,
      actualQuantity,
      qualityGrade = 'Grade A',
      moisturePercent = 11.5,
      mspPricePerQuintal = 2275,
      notes,
    } = req.body;

    if (!bookingId || !actualQuantity) {
      res.status(400).json({ success: false, message: 'Booking ID and actual quantity are required.' });
      return;
    }

    const result = await recordProcurementTransaction({
      bookingId,
      actualQuantity: Number(actualQuantity),
      qualityGrade,
      moisturePercent: Number(moisturePercent),
      mspPricePerQuintal: Number(mspPricePerQuintal),
      authorityUser: req.user,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Procurement recorded successfully. Slip generated and logistics task created.',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getProcurementsByCentre = async (req: Request, res: Response): Promise<void> => {
  try {
    const { centreId } = req.params;
    const procurements = await Procurement.find({ centreId })
      .populate('farmerId', 'name phone email')
      .populate('bookingId')
      .sort({ timestamp: -1 });

    res.json({ success: true, count: procurements.length, data: procurements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProcurementsByFarmer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const procurements = await Procurement.find({ farmerId: req.user._id })
      .populate('centreId', 'name centreCode district address')
      .populate('bookingId')
      .sort({ timestamp: -1 });

    res.json({ success: true, count: procurements.length, data: procurements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProcurementBySlipNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slipNumber } = req.params;
    const procurement = await Procurement.findOne({ digitalSlipNumber: slipNumber })
      .populate('farmerId', 'name phone email')
      .populate('centreId')
      .populate('authorityId', 'name phone')
      .populate('bookingId');

    if (!procurement) {
      res.status(404).json({ success: false, message: 'Procurement receipt not found.' });
      return;
    }

    res.json({ success: true, data: procurement });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
