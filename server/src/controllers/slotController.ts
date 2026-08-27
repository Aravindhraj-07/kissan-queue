import { Request, Response } from 'express';
import { Slot } from '../models/Slot.js';
import { ProcurementCentre } from '../models/ProcurementCentre.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditAction } from '../services/auditService.js';

export const getSlotsByCentreAndDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { centreId } = req.params;
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const centre = await ProcurementCentre.findById(centreId);
    if (!centre) {
      res.status(404).json({ success: false, message: 'Procurement centre not found' });
      return;
    }

    const slots = await Slot.find({ centreId, date }).sort({ startTime: 1 });
    res.json({ success: true, count: slots.length, date, data: slots });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSlot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { centreId, date, startTime, endTime, capacity } = req.body;

    if (!centreId || !date || !startTime || !endTime) {
      res.status(400).json({ success: false, message: 'Centre ID, Date, Start Time, and End Time are required.' });
      return;
    }

    const slot = await Slot.create({
      centreId,
      date,
      startTime,
      endTime,
      capacity: Number(capacity) || 8,
      bookedCount: 0,
      remainingCapacity: Number(capacity) || 8,
      status: 'AVAILABLE',
    });

    if (req.user) {
      await logAuditAction({
        actorId: req.user._id,
        actorName: req.user.name,
        actorRole: req.user.role,
        action: 'CREATED_SLOT',
        entityType: 'SLOT',
        entityId: slot._id.toString(),
        metadata: { date, startTime, endTime, capacity },
      });
    }

    res.status(201).json({ success: true, message: 'Slot created successfully.', data: slot });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSlotCapacity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { capacity, status } = req.body;

    const slot = await Slot.findById(id);
    if (!slot) {
      res.status(404).json({ success: false, message: 'Slot not found' });
      return;
    }

    if (capacity !== undefined) {
      const newCap = Number(capacity);
      slot.capacity = newCap;
      slot.remainingCapacity = Math.max(0, newCap - slot.bookedCount);
      if (slot.remainingCapacity === 0) slot.status = 'FULL';
      else if (slot.status === 'FULL') slot.status = 'AVAILABLE';
    }

    if (status) {
      slot.status = status;
    }

    await slot.save();

    if (req.user) {
      await logAuditAction({
        actorId: req.user._id,
        actorName: req.user.name,
        actorRole: req.user.role,
        action: 'UPDATED_SLOT_CAPACITY',
        entityType: 'SLOT',
        entityId: slot._id.toString(),
        metadata: { capacity, status },
      });
    }

    res.json({ success: true, message: 'Slot updated successfully.', data: slot });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
