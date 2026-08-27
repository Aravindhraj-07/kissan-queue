import { Request, Response } from 'express';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { Booking } from '../models/Booking.js';
import { Procurement } from '../models/Procurement.js';
import { AuthRequest } from '../middleware/auth.js';
import { getCentreLiveQueue } from '../services/queueService.js';

export const getFarmerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let profile = await FarmerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      const farmerCount = await FarmerProfile.countDocuments();
      profile = await FarmerProfile.create({
        userId: req.user._id,
        farmerId: `FRM-2026-${(farmerCount + 101).toString().padStart(4, '0')}`,
        village: 'Karnal Village',
        district: 'Karnal',
        state: 'Haryana',
        farmDetails: {
          landAreaAcres: 5,
          primaryCrops: ['Wheat', 'Paddy / Rice'],
        },
      });
    }

    res.json({ success: true, data: profile, user: req.user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFarmerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { address, village, district, state, preferredLanguage, farmDetails } = req.body;

    const profile = await FarmerProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        address,
        village,
        district,
        state,
        preferredLanguage,
        farmDetails,
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Profile updated successfully.', data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFarmerDashboardOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Today's active booking if any
    const todayBooking = await Booking.findOne({
      farmerId: req.user._id,
      scheduledDate: todayStr,
      status: { $nin: ['CANCELLED', 'EXPIRED'] },
    })
      .populate('centreId')
      .populate('slotId');

    let liveQueueInfo = null;
    if (todayBooking) {
      try {
        const queueSummary = await getCentreLiveQueue(
          todayBooking.centreId._id.toString(),
          todayStr
        );
        const myQueueItem = queueSummary.activeQueue.find(
          (q) => q.bookingId.toString() === todayBooking._id.toString()
        );

        liveQueueInfo = {
          currentServingToken: queueSummary.currentServingToken,
          peopleAhead: myQueueItem ? myQueueItem.queuePosition - 1 : 0,
          estimatedWaitMinutes: myQueueItem ? myQueueItem.estimatedWaitMinutes : 0,
          isMyTurn: queueSummary.currentServingToken === todayBooking.tokenNumber,
        };
      } catch (err) {
        console.error('Error fetching live queue info:', err);
      }
    }

    // Historical counts
    const [totalBookingsCount, pastProcurements] = await Promise.all([
      Booking.countDocuments({ farmerId: req.user._id }),
      Procurement.find({ farmerId: req.user._id }).sort({ timestamp: -1 }),
    ]);

    const totalIncomeINR = pastProcurements.reduce((acc, curr) => acc + (curr.totalPayout || 0), 0);
    const totalQuantityQuintals = pastProcurements.reduce((acc, curr) => acc + (curr.actualQuantity || 0), 0);

    res.json({
      success: true,
      data: {
        todayBooking,
        liveQueueInfo,
        totalBookingsCount,
        pastProcurementsCount: pastProcurements.length,
        totalIncomeINR,
        totalQuantityQuintals,
        recentProcurements: pastProcurements.slice(0, 5),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
