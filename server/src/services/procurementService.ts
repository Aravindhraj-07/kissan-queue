import { Procurement, QualityGrade } from '../models/Procurement.js';
import { Booking } from '../models/Booking.js';
import { TransportTask } from '../models/TransportTask.js';
import { Produce } from '../models/Produce.js';
import { generateProcurementSlipId } from '../utils/tokenGenerator.js';
import { sendNotification } from './notificationService.js';
import { logAuditAction } from './auditService.js';
import { broadcastQueueUpdate, broadcastLogisticsUpdate } from '../sockets/socketManager.js';
import { getCentreLiveQueue } from './queueService.js';

export interface IRecordProcurementInput {
  bookingId: string;
  actualQuantity: number;
  qualityGrade: QualityGrade;
  moisturePercent: number;
  mspPricePerQuintal: number;
  authorityUser: any;
  notes?: string;
}

export const recordProcurementTransaction = async (input: IRecordProcurementInput) => {
  const {
    bookingId,
    actualQuantity,
    qualityGrade,
    moisturePercent,
    mspPricePerQuintal,
    authorityUser,
    notes,
  } = input;

  const booking = await Booking.findById(bookingId).populate('centreId');
  if (!booking) {
    throw new Error('Booking not found');
  }

  const totalPayout = parseFloat((actualQuantity * mspPricePerQuintal).toFixed(2));
  const digitalSlipNumber = generateProcurementSlipId();

  // 1. Create Procurement Record
  const procurement = await Procurement.create({
    bookingId: booking._id,
    farmerId: booking.farmerId,
    centreId: booking.centreId,
    authorityId: authorityUser._id,
    cropType: booking.cropType,
    expectedQuantity: booking.requestedQuantity,
    actualQuantity,
    unit: booking.unit,
    qualityGrade,
    moisturePercent,
    mspPricePerQuintal,
    totalPayout,
    digitalSlipNumber,
    status: 'COMPLETED',
    handoverToLogistics: true,
    notes,
    timestamp: new Date(),
  });

  // 2. Mark booking as COMPLETED
  booking.status = 'COMPLETED';
  booking.completedAt = new Date();
  await booking.save();

  // 3. Update Produce status to PROCURED
  await Produce.updateMany(
    { farmerId: booking.farmerId, cropType: booking.cropType, status: 'SLOT_BOOKED' },
    { status: 'PROCURED' }
  );

  // 4. Automatically create Transport Task for Logistics dispatch
  const centreObj: any = booking.centreId;
  const transportTask = await TransportTask.create({
    procurementId: procurement._id,
    farmerId: booking.farmerId,
    centreId: centreObj._id,
    destinationWarehouse: `State Food & Civil Supplies Silo - Hub ${centreObj.district || 'Central'}`,
    cropType: booking.cropType,
    quantity: actualQuantity,
    unit: booking.unit,
    status: 'READY_FOR_PICKUP',
    notes: `Procured from Farmer token ${booking.tokenNumber} (Slip: ${digitalSlipNumber})`,
  });

  // Populate references for real-time broadcast
  const populatedTask = await TransportTask.findById(transportTask._id)
    .populate('centreId')
    .populate('farmerId', 'name phone')
    .populate('procurementId');

  broadcastLogisticsUpdate(populatedTask || transportTask);

  // 5. Send Confirmation Notification to Farmer
  await sendNotification({
    userId: booking.farmerId,
    type: 'PROCUREMENT_COMPLETED',
    title: '🌾 Procurement Completed & Slip Generated!',
    message: `Your produce (${actualQuantity} ${booking.unit} ${booking.cropType}) was weighed & inspected successfully. Total Payout: ₹${totalPayout.toLocaleString('en-IN')}. Slip: ${digitalSlipNumber}`,
    metadata: {
      slipNumber: digitalSlipNumber,
      totalPayout,
      actualQuantity,
      procurementId: procurement._id,
    },
  });

  // 6. Audit Log
  await logAuditAction({
    actorId: authorityUser._id,
    actorName: authorityUser.name,
    actorRole: authorityUser.role,
    action: 'COMPLETED_PROCUREMENT',
    entityType: 'PROCUREMENT',
    entityId: procurement._id.toString(),
    metadata: {
      slipNumber: digitalSlipNumber,
      actualQuantity,
      totalPayout,
      transportTaskId: transportTask._id,
    },
  });

  // 7. Broadcast updated queue
  const todayStr = new Date().toISOString().split('T')[0];
  const queueData = await getCentreLiveQueue(centreObj._id.toString(), todayStr);
  broadcastQueueUpdate(centreObj._id.toString(), queueData);

  return { procurement, transportTask };
};
