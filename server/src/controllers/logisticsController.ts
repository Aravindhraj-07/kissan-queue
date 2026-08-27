import { Request, Response } from 'express';
import { TransportTask } from '../models/TransportTask.js';
import {
  assignTransportTask,
  updateTransportTaskStatus,
} from '../services/logisticsService.js';
import { AuthRequest } from '../middleware/auth.js';

export const getTransportTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, centreId } = req.query;
    let query: any = {};
    if (status) query.status = status;
    if (centreId) query.centreId = centreId;

    const tasks = await TransportTask.find(query)
      .populate('centreId')
      .populate('farmerId', 'name phone')
      .populate('procurementId')
      .populate('logisticsUserId', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required to assign transport task.' });
      return;
    }

    const { id } = req.params;
    const { vehicleNumber, driverName, driverPhone, destinationWarehouse } = req.body;

    if (!vehicleNumber || !driverName) {
      res.status(400).json({ success: false, message: 'Vehicle registration number and driver full name are required.' });
      return;
    }

    const task = await assignTransportTask({
      taskId: id,
      vehicleNumber: vehicleNumber.trim(),
      driverName: driverName.trim(),
      driverPhone: driverPhone?.trim() || undefined,
      destinationWarehouse: destinationWarehouse?.trim() || undefined,
      logisticsUser: req.user,
    });

    const populated = await TransportTask.findById(task._id)
      .populate('centreId')
      .populate('farmerId', 'name phone')
      .populate('procurementId');

    res.json({ success: true, message: 'Transport task successfully assigned.', data: populated || task });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to assign transport task.' });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      res.status(400).json({ success: false, message: 'Status is required.' });
      return;
    }

    const task = await updateTransportTaskStatus(id, status, req.user, notes);
    const populated = await TransportTask.findById(task._id)
      .populate('centreId')
      .populate('farmerId', 'name phone')
      .populate('procurementId');

    res.json({ success: true, message: `Transport status updated to ${status}.`, data: populated || task });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
