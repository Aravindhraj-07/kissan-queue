import { Booking, IBooking } from '../models/Booking.js';
import { ProcurementCentre } from '../models/ProcurementCentre.js';
import { sendNotification } from './notificationService.js';
import { logAuditAction } from './auditService.js';
import { broadcastQueueUpdate, emitToUser } from '../sockets/socketManager.js';
import { reallocateVacantSlot } from './reallocationService.js';
import { ENV } from '../config/env.js';

export const getCentreLiveQueue = async (centreId: string, dateStr?: string) => {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];

  const centre = await ProcurementCentre.findById(centreId);
  if (!centre) {
    throw new Error('Procurement centre not found');
  }

  // Fetch all today's active bookings for this centre
  const bookings = await Booking.find({
    centreId,
    scheduledDate: targetDate,
    status: { $nin: ['CANCELLED', 'EXPIRED'] },
  })
    .populate('farmerId', 'name phone email avatarUrl')
    .populate('slotId', 'startTime endTime')
    .sort({ tokenSequence: 1, createdAt: 1 });

  // Separate into categorised queues
  const processing = bookings.find((b) => b.status === 'PROCESSING') || null;
  const arrivedWaiting = bookings.filter((b) => b.status === 'ARRIVED' || b.status === 'IN_QUEUE');
  const upcomingScheduled = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING');
  const completedToday = bookings.filter((b) => b.status === 'COMPLETED');
  const noShows = bookings.filter((b) => b.status === 'NO_SHOW');
  const waitlisted = bookings.filter((b) => b.status === 'WAITLISTED');

  // Compute dynamic live positions and estimated wait times
  const activeQueue = arrivedWaiting.map((item, index) => {
    const position = index + 1;
    const estWaitMinutes = position * ENV.AVG_PROCUREMENT_MINUTES;
    return {
      bookingId: item._id,
      tokenNumber: item.tokenNumber,
      farmer: item.farmerId,
      cropType: item.cropType,
      requestedQuantity: item.requestedQuantity,
      unit: item.unit,
      slot: item.slotId,
      status: item.status,
      arrivedAt: item.arrivedAt,
      queuePosition: position,
      estimatedWaitMinutes: estWaitMinutes,
    };
  });

  const queueSummary = {
    centreId: centre._id,
    centreName: centre.name,
    centreCode: centre.centreCode,
    date: targetDate,
    currentServingToken: centre.currentServingToken || (processing ? processing.tokenNumber : 'None'),
    currentProcessingBooking: processing,
    totalBookedToday: bookings.length,
    arrivedCount: arrivedWaiting.length + (processing ? 1 : 0),
    waitingInQueueCount: arrivedWaiting.length,
    completedCount: completedToday.length,
    noShowCount: noShows.length,
    upcomingCount: upcomingScheduled.length,
    activeQueue,
    upcomingScheduled,
    completedToday,
    noShows,
    waitlisted,
  };

  return queueSummary;
};

/**
 * Storage Authority calls the next farmer in line.
 */
export const callNextFarmer = async (centreId: string, authorityUser: any) => {
  const targetDate = new Date().toISOString().split('T')[0];

  const centre = await ProcurementCentre.findById(centreId);
  if (!centre) {
    throw new Error('Procurement centre not found');
  }

  // 1. If someone was currently in PROCESSING, mark them completed if not done yet
  if (centre.currentServingBookingId) {
    const currentBooking = await Booking.findById(centre.currentServingBookingId);
    if (currentBooking && currentBooking.status === 'PROCESSING') {
      currentBooking.status = 'COMPLETED';
      currentBooking.completedAt = new Date();
      await currentBooking.save();
    }
  }

  // 2. Find next arrived farmer waiting in queue (ARRIVED or IN_QUEUE)
  let nextBooking = await Booking.findOne({
    centreId,
    scheduledDate: targetDate,
    status: { $in: ['ARRIVED', 'IN_QUEUE'] },
  }).sort({ arrivedAt: 1, tokenSequence: 1 });

  // If no arrived farmers, fall back to earliest scheduled confirmed farmer
  if (!nextBooking) {
    nextBooking = await Booking.findOne({
      centreId,
      scheduledDate: targetDate,
      status: 'CONFIRMED',
    }).sort({ tokenSequence: 1 });
  }

  if (!nextBooking) {
    centre.currentServingToken = 'None';
    centre.currentServingBookingId = undefined;
    await centre.save();

    const queueData = await getCentreLiveQueue(centreId, targetDate);
    broadcastQueueUpdate(centreId, queueData);
    return { message: 'No more farmers currently waiting in queue.', queueData };
  }

  // 3. Update next booking to PROCESSING
  nextBooking.status = 'PROCESSING';
  nextBooking.calledAt = new Date();
  await nextBooking.save();

  // 4. Update centre serving state
  centre.currentServingToken = nextBooking.tokenNumber;
  centre.currentServingBookingId = nextBooking._id as any;
  await centre.save();

  // 5. Send high-priority notification to the called farmer
  await sendNotification({
    userId: nextBooking.farmerId,
    type: 'TURN_NOW',
    title: '🔔 YOUR TURN HAS ARRIVED!',
    message: `Token ${nextBooking.tokenNumber} is now called for weighing & inspection at ${centre.name}. Please proceed to Weighbridge Counter 1 immediately.`,
    metadata: {
      bookingId: nextBooking._id,
      tokenNumber: nextBooking.tokenNumber,
      centreName: centre.name,
    },
  });

  // 6. Notify the next upcoming farmers in line that their turn is approaching
  const upcomingTwo = await Booking.find({
    centreId,
    scheduledDate: targetDate,
    status: { $in: ['ARRIVED', 'IN_QUEUE'] },
    _id: { $ne: nextBooking._id },
  })
    .sort({ arrivedAt: 1, tokenSequence: 1 })
    .limit(2);

  for (let i = 0; i < upcomingTwo.length; i++) {
    const upcoming = upcomingTwo[i];
    await sendNotification({
      userId: upcoming.farmerId,
      type: 'TURN_APPROACHING',
      title: '⏳ Your Turn is Approaching!',
      message: `Token ${centre.currentServingToken} is currently serving. You are position #${i + 1} in line. Please stay near the verification counter.`,
      metadata: {
        tokenNumber: upcoming.tokenNumber,
        position: i + 1,
      },
    });
  }

  // 7. Audit log
  await logAuditAction({
    actorId: authorityUser._id,
    actorName: authorityUser.name,
    actorRole: authorityUser.role,
    action: 'CALLED_NEXT_TOKEN',
    entityType: 'CENTRE',
    entityId: centre._id.toString(),
    metadata: {
      tokenNumber: nextBooking.tokenNumber,
      farmerId: nextBooking.farmerId,
    },
  });

  // 8. Broadcast live update to all screens in that Mandi room
  const queueData = await getCentreLiveQueue(centreId, targetDate);
  broadcastQueueUpdate(centreId, queueData);

  return {
    calledToken: nextBooking.tokenNumber,
    booking: nextBooking,
    queueData,
  };
};

/**
 * Marks farmer as ARRIVED at the centre gate/counter.
 */
export const markFarmerArrived = async (bookingId: string, authorityUser: any) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }

  booking.status = 'ARRIVED';
  booking.arrivedAt = new Date();
  await booking.save();

  await sendNotification({
    userId: booking.farmerId,
    type: 'QUEUE_ALERT',
    title: 'Arrival Verified ✅',
    message: `Your arrival with Token ${booking.tokenNumber} is verified. You are now in the live queue.`,
  });

  await logAuditAction({
    actorId: authorityUser._id,
    actorName: authorityUser.name,
    actorRole: authorityUser.role,
    action: 'VERIFIED_FARMER_ARRIVAL',
    entityType: 'BOOKING',
    entityId: booking._id.toString(),
    metadata: { tokenNumber: booking.tokenNumber },
  });

  const queueData = await getCentreLiveQueue(booking.centreId.toString(), booking.scheduledDate);
  broadcastQueueUpdate(booking.centreId.toString(), queueData);

  return { success: true, booking, queueData };
};

/**
 * Marks booking as NO_SHOW and triggers dynamic slot reallocation.
 */
export const markFarmerNoShow = async (bookingId: string, authorityUser: any) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }

  booking.status = 'NO_SHOW';
  await booking.save();

  await sendNotification({
    userId: booking.farmerId,
    type: 'SYSTEM_ALERT',
    title: 'Marked as No-Show',
    message: `Your booking with Token ${booking.tokenNumber} for ${booking.scheduledDate} was marked as No-Show.`,
  });

  await logAuditAction({
    actorId: authorityUser._id,
    actorName: authorityUser.name,
    actorRole: authorityUser.role,
    action: 'MARKED_NO_SHOW',
    entityType: 'BOOKING',
    entityId: booking._id.toString(),
    metadata: { tokenNumber: booking.tokenNumber },
  });

  // Reallocate slot to waitlist
  await reallocateVacantSlot(booking.centreId.toString(), booking.slotId.toString());

  const queueData = await getCentreLiveQueue(booking.centreId.toString(), booking.scheduledDate);
  broadcastQueueUpdate(booking.centreId.toString(), queueData);

  return { success: true, booking, queueData };
};
