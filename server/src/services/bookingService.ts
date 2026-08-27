import { Booking, BookingSource } from '../models/Booking.js';
import { Slot } from '../models/Slot.js';
import { ProcurementCentre } from '../models/ProcurementCentre.js';
import { Produce } from '../models/Produce.js';
import { generateTokenNumber } from '../utils/tokenGenerator.js';
import { sendNotification } from './notificationService.js';
import { logAuditAction } from './auditService.js';
import { reallocateVacantSlot } from './reallocationService.js';
import { broadcastSlotUpdate, broadcastQueueUpdate } from '../sockets/socketManager.js';
import { getCentreLiveQueue } from './queueService.js';
import mongoose from 'mongoose';

export interface ICreateBookingInput {
  farmerId: string;
  centreId: string;
  slotId: string;
  cropType: string;
  requestedQuantity: number;
  unit?: string;
  bookingSource?: BookingSource;
  actorName?: string;
  actorRole?: string;
}

export const createBookingAtomic = async (input: ICreateBookingInput) => {
  const {
    farmerId,
    centreId,
    slotId,
    cropType,
    requestedQuantity,
    unit = 'Quintal',
    bookingSource = 'WEB',
    actorName = 'Farmer',
    actorRole = 'FARMER',
  } = input;

  const centre = await ProcurementCentre.findById(centreId);
  if (!centre) {
    throw new Error('Procurement centre not found');
  }

  const slot = await Slot.findById(slotId);
  if (!slot) {
    throw new Error('Slot not found');
  }

  // 1. Check if farmer already has an active booking for this centre and date
  const existingBooking = await Booking.findOne({
    farmerId,
    centreId,
    scheduledDate: slot.date,
    status: { $in: ['PENDING', 'CONFIRMED', 'ARRIVED', 'IN_QUEUE', 'PROCESSING'] },
  });

  if (existingBooking) {
    throw new Error(`You already have an active booking (${existingBooking.tokenNumber}) for this date.`);
  }

  // 2. Count existing bookings today at this centre to generate sequence
  const todayCount = await Booking.countDocuments({
    centreId,
    scheduledDate: slot.date,
  });
  const sequenceNumber = todayCount + 1;
  const tokenNumber = generateTokenNumber(centre.centreCode, sequenceNumber);
  const bookingId = `BK-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  // 3. Atomic capacity check and allocation
  const updatedSlot = await Slot.findOneAndUpdate(
    {
      _id: slotId,
      remainingCapacity: { $gt: 0 },
      status: 'AVAILABLE',
    },
    {
      $inc: { remainingCapacity: -1, bookedCount: 1, bookedQuantityQuintals: requestedQuantity },
    },
    { new: true }
  );

  let initialStatus = 'CONFIRMED';
  if (!updatedSlot) {
    initialStatus = 'WAITLISTED';
  } else {
    if (updatedSlot.remainingCapacity <= 0) {
      updatedSlot.status = 'FULL';
      await updatedSlot.save();
    }
    broadcastSlotUpdate(centreId, updatedSlot);
  }

  // 4. Create the booking record
  const booking = await Booking.create({
    bookingId,
    farmerId,
    centreId,
    slotId,
    cropType,
    requestedQuantity,
    unit,
    tokenNumber,
    tokenSequence: sequenceNumber,
    queuePosition: sequenceNumber,
    status: initialStatus,
    bookingSource,
    scheduledDate: slot.date,
  });

  // 5. Persist Produce Record in MongoDB
  await Produce.create({
    farmerId: new mongoose.Types.ObjectId(farmerId),
    cropType,
    quantity: requestedQuantity,
    unit,
    status: 'SLOT_BOOKED',
    notes: `Linked to Booking ${bookingId} (Token: ${tokenNumber})`,
  });

  // 6. Send Notification
  if (initialStatus === 'CONFIRMED') {
    await sendNotification({
      userId: farmerId,
      type: 'SLOT_BOOKED',
      title: 'Digital Token Issued 🎉',
      message: `Your booking at ${centre.name} is CONFIRMED for ${slot.date} (${slot.startTime} - ${slot.endTime}). Token: ${tokenNumber}.`,
      metadata: {
        bookingId: booking._id,
        tokenNumber,
        slotDate: slot.date,
        centreName: centre.name,
      },
    });
  } else {
    await sendNotification({
      userId: farmerId,
      type: 'SLOT_BOOKED',
      title: 'Slot Waitlisted ⏳',
      message: `Slot was full. You are on the WAITLIST (Token: ${tokenNumber}). You will be auto-allocated if any cancellation occurs.`,
      metadata: {
        bookingId: booking._id,
        tokenNumber,
      },
    });
  }

  // 7. Audit log
  await logAuditAction({
    actorId: new mongoose.Types.ObjectId(farmerId),
    actorName,
    actorRole,
    action: initialStatus === 'CONFIRMED' ? 'BOOKED_SLOT' : 'JOINED_WAITLIST',
    entityType: 'BOOKING',
    entityId: booking._id.toString(),
    metadata: {
      tokenNumber,
      centreName: centre.name,
      cropType,
      requestedQuantity,
    },
  });

  // 8. If scheduled for today, refresh live queue
  const todayStr = new Date().toISOString().split('T')[0];
  if (slot.date === todayStr) {
    const queueData = await getCentreLiveQueue(centreId, todayStr);
    broadcastQueueUpdate(centreId, queueData);
  }

  return booking;
};

export const cancelBooking = async (bookingId: string, farmerId: string, actorName: string, actorRole: string) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
    throw new Error(`Cannot cancel a booking in ${booking.status} state.`);
  }

  booking.status = 'CANCELLED';
  booking.cancellationReason = 'Cancelled by farmer';
  await booking.save();

  await reallocateVacantSlot(booking.centreId.toString(), booking.slotId.toString());

  await sendNotification({
    userId: booking.farmerId,
    type: 'SYSTEM_ALERT',
    title: 'Booking Cancelled',
    message: `Your booking (${booking.tokenNumber}) for ${booking.scheduledDate} has been cancelled.`,
  });

  await logAuditAction({
    actorId: new mongoose.Types.ObjectId(farmerId),
    actorName,
    actorRole,
    action: 'CANCELLED_BOOKING',
    entityType: 'BOOKING',
    entityId: booking._id.toString(),
    metadata: { tokenNumber: booking.tokenNumber },
  });

  const todayStr = new Date().toISOString().split('T')[0];
  if (booking.scheduledDate === todayStr) {
    const queueData = await getCentreLiveQueue(booking.centreId.toString(), todayStr);
    broadcastQueueUpdate(booking.centreId.toString(), queueData);
  }

  return booking;
};
