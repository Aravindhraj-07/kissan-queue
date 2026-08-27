import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { ProcurementCentre } from '../models/ProcurementCentre.js';
import { Booking } from '../models/Booking.js';
import { Procurement } from '../models/Procurement.js';
import { TransportTask } from '../models/TransportTask.js';
import { AuditLog } from '../models/AuditLog.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditAction } from '../services/auditService.js';

export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const [
      totalFarmers,
      activeCentres,
      todayBookings,
      totalProcuredDocs,
      pendingLogistics,
      inTransitLogistics,
      recentAuditLogs,
    ] = await Promise.all([
      User.countDocuments({ role: 'FARMER' }),
      ProcurementCentre.countDocuments({ status: 'ACTIVE' }),
      Booking.find({ scheduledDate: todayStr }),
      Procurement.find(),
      TransportTask.countDocuments({ status: { $in: ['READY_FOR_PICKUP', 'ASSIGNED'] } }),
      TransportTask.countDocuments({ status: { $in: ['PICKUP_IN_PROGRESS', 'IN_TRANSIT'] } }),
      AuditLog.find().sort({ timestamp: -1 }).limit(10),
    ]);

    // Breakdown
    const todayConfirmed = todayBookings.filter((b) => b.status === 'CONFIRMED').length;
    const todayArrived = todayBookings.filter((b) => b.status === 'ARRIVED' || b.status === 'IN_QUEUE').length;
    const todayCompleted = todayBookings.filter((b) => b.status === 'COMPLETED').length;
    const todayNoShows = todayBookings.filter((b) => b.status === 'NO_SHOW').length;

    // Totals
    const totalProcuredQuintals = totalProcuredDocs.reduce((acc, curr) => acc + (curr.actualQuantity || 0), 0);
    const totalPayoutINR = totalProcuredDocs.reduce((acc, curr) => acc + (curr.totalPayout || 0), 0);

    // Crop distribution
    const cropDistributionMap: Record<string, number> = {};
    totalProcuredDocs.forEach((p) => {
      if (p.cropType) {
        cropDistributionMap[p.cropType] = (cropDistributionMap[p.cropType] || 0) + p.actualQuantity;
      }
    });

    const cropDistribution = Object.entries(cropDistributionMap).map(([crop, qty]) => ({
      crop,
      quantityQuintals: parseFloat(qty.toFixed(1)),
    }));

    const noShowRate =
      todayBookings.length > 0 ? ((todayNoShows / todayBookings.length) * 100).toFixed(1) : '0.0';

    res.json({
      success: true,
      stats: {
        totalFarmers,
        activeCentres,
        totalBookingsToday: todayBookings.length,
        todayConfirmed,
        todayArrived,
        todayCompleted,
        todayNoShows,
        noShowRatePercent: noShowRate,
        totalProcuredQuintals: parseFloat(totalProcuredQuintals.toFixed(1)),
        totalProcuredMetricTons: (totalProcuredQuintals / 10).toFixed(1),
        totalPayoutINR,
        pendingLogistics,
        inTransitLogistics,
        cropDistribution,
        recentAuditLogs,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, search, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, parseInt(limit as string, 10));
    const skip = (pageNum - 1) * limitNum;

    let query: any = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { phone: { $regex: search as string, $options: 'i' } },
        { email: { $regex: search as string, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: users.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['ACTIVE', 'SUSPENDED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status must be ACTIVE or SUSPENDED.' });
      return;
    }

    const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (req.user) {
      await logAuditAction({
        actorId: req.user._id,
        actorName: req.user.name,
        actorRole: req.user.role,
        action: status === 'ACTIVE' ? 'ACTIVATED_USER' : 'SUSPENDED_USER',
        entityType: 'USER',
        entityId: user._id.toString(),
        metadata: { targetUserPhone: user.phone },
      });
    }

    res.json({ success: true, message: `User status updated to ${status}`, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.max(1, parseInt(req.query.limit as string || '50', 10));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ timestamp: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(),
    ]);

    res.json({
      success: true,
      count: logs.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: logs,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
