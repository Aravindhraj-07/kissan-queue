import { Booking } from '../models/Booking.js';
import { Slot } from '../models/Slot.js';
import { sendNotification } from './notificationService.js';
import { logAuditAction } from './auditService.js';
import { broadcastSlotUpdate } from '../sockets/socketManager.js';

/**
 * Trigger dynamic reallocation when a slot becomes vacant due to cancellation or no-show.
 * Searches for the earliest waitlisted farmer for that centre and slot, and automatically promotes them.
 */
export const reallocateVacantSlot = async (centreId: string, slotId: string) => {
  try {
    // 1. Check if there are any WAITLISTED bookings for this slot or centre on that date
    const waitlistedBooking = await Booking.findOne({
      slotId,
      status: 'WAITLISTED',
    }).sort({ createdAt: 1 });

    if (waitlistedBooking) {
      // Promote waitlisted farmer to CONFIRMED
      waitlistedBooking.status = 'CONFIRMED';
      await waitlistedBooking.save();

      // Decrement remaining slot capacity
      const slot = await Slot.findById(slotId);
      if (slot && slot.remainingCapacity > 0) {
        slot.remainingCapacity -= 1;
        slot.bookedCount += 1;
        if (slot.remainingCapacity <= 0) {
          slot.status = 'FULL';
        }
        await slot.save();
        broadcastSlotUpdate(centreId.toString(), slot);
      }

      // Notify the farmer
      await sendNotification({
        userId: waitlistedBooking.farmerId,
        type: 'SLOT_REALLOCATION',
        title: '🎉 Slot Confirmed via Auto-Reallocation!',
        message: `A vacant slot opened up! Your token ${waitlistedBooking.tokenNumber} is now CONFIRMED for ${waitlistedBooking.scheduledDate}.`,
        metadata: {
          bookingId: waitlistedBooking._id,
          tokenNumber: waitlistedBooking.tokenNumber,
        },
      });

      await logAuditAction({
        actorName: 'System Reallocation Engine',
        actorRole: 'SYSTEM',
        action: 'AUTO_REALLOCATED_SLOT',
        entityType: 'BOOKING',
        entityId: waitlistedBooking._id.toString(),
        metadata: {
          tokenNumber: waitlistedBooking.tokenNumber,
          slotId,
        },
      });

      console.log(`[Reallocation] Promoted waitlisted booking ${waitlistedBooking.tokenNumber} to CONFIRMED`);
      return waitlistedBooking;
    }

    // If no waitlisted farmer for this exact slot, restore 1 capacity to the slot
    const slot = await Slot.findById(slotId);
    if (slot) {
      slot.remainingCapacity = Math.min(slot.capacity, slot.remainingCapacity + 1);
      slot.bookedCount = Math.max(0, slot.bookedCount - 1);
      if (slot.remainingCapacity > 0 && slot.status === 'FULL') {
        slot.status = 'AVAILABLE';
      }
      await slot.save();
      broadcastSlotUpdate(centreId.toString(), slot);
    }

    return null;
  } catch (error) {
    console.error('[Reallocation Error] Failed to process slot reallocation:', error);
    return null;
  }
};
