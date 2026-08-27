import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { ProcurementCentre } from '../models/ProcurementCentre.js';
import { Slot } from '../models/Slot.js';
import { Booking } from '../models/Booking.js';
import { createBookingAtomic } from '../services/bookingService.js';
import { getCentreLiveQueue } from '../services/queueService.js';

/**
 * Simulates incoming SMS command:
 * Example format: "BOOK <CENTRE_CODE> <CROP> <QUANTITY_QUINTALS>"
 * or "STATUS <TOKEN_NUMBER>"
 */
export const handleSmsWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fromPhone, messageText } = req.body;

    if (!fromPhone || !messageText) {
      res.status(400).json({ success: false, message: 'fromPhone and messageText required.' });
      return;
    }

    const text = messageText.trim();
    const parts = text.split(/\s+/);
    const command = parts[0].toUpperCase();

    // 1. STATUS command
    if (command === 'STATUS') {
      const tokenNumber = parts[1];
      if (!tokenNumber) {
        res.json({
          reply: 'ProcureX SMS: Please provide your token number. Format: STATUS TK-KNL-0001',
        });
        return;
      }

      const booking = await Booking.findOne({ tokenNumber: tokenNumber.toUpperCase() })
        .populate('centreId')
        .populate('slotId');

      if (!booking) {
        res.json({ reply: `ProcureX SMS: Token ${tokenNumber} not found.` });
        return;
      }

      const centre: any = booking.centreId;
      const todayStr = new Date().toISOString().split('T')[0];
      let queueStatusText = `Status: ${booking.status}`;

      if (booking.scheduledDate === todayStr) {
        const queueSummary = await getCentreLiveQueue(centre._id.toString(), todayStr);
        queueStatusText += ` | Current Token Serving: ${queueSummary.currentServingToken}`;
      }

      res.json({
        reply: `ProcureX: Token ${booking.tokenNumber} for ${booking.cropType} (${booking.requestedQuantity} Qtl) at ${centre.name} on ${booking.scheduledDate}. ${queueStatusText}`,
      });
      return;
    }

    // 2. BOOK command: "BOOK <CENTRE_CODE> <CROP> <QTY>"
    if (command === 'BOOK') {
      const centreCode = parts[1] || 'PC-KNL-01';
      const cropType = parts[2] || 'Wheat';
      const qty = parseFloat(parts[3] || '25');

      // Look up user by phone or create quick SMS farmer profile
      let user = await User.findOne({ phone: fromPhone });
      if (!user) {
        user = await User.create({
          name: `Farmer (${fromPhone.slice(-4)})`,
          phone: fromPhone,
          passwordHash: 'SMS_REGISTERED_USER',
          role: 'FARMER',
          status: 'ACTIVE',
        });
      }

      const centre = await ProcurementCentre.findOne({
        centreCode: { $regex: new RegExp(centreCode, 'i') },
      });

      if (!centre) {
        res.json({
          reply: `ProcureX SMS Error: Centre '${centreCode}' not found. Available centres: PC-KNL-01 (Karnal), PC-KHN-02 (Khanna), PC-NZB-03 (Nizamabad).`,
        });
        return;
      }

      const todayStr = new Date().toISOString().split('T')[0];
      // Get earliest available slot today
      let slot = await Slot.findOne({
        centreId: centre._id,
        date: todayStr,
        status: 'AVAILABLE',
      }).sort({ startTime: 1 });

      if (!slot) {
        slot = await Slot.findOne({ centreId: centre._id, date: todayStr }).sort({ startTime: 1 });
      }

      if (!slot) {
        slot = await Slot.create({
          centreId: centre._id,
          date: todayStr,
          startTime: '09:00',
          endTime: '11:00',
          capacity: 8,
          bookedCount: 0,
          remainingCapacity: 8,
          status: 'AVAILABLE',
        });
      }

      const booking = await createBookingAtomic({
        farmerId: user._id.toString(),
        centreId: centre._id.toString(),
        slotId: slot._id.toString(),
        cropType,
        requestedQuantity: qty,
        unit: 'Quintal',
        bookingSource: 'SMS',
        actorName: `SMS User (${fromPhone})`,
        actorRole: 'FARMER',
      });

      res.json({
        reply: `ProcureX SMS: Booking ${booking.status}! Your Token is ${booking.tokenNumber} for ${cropType} (${qty} Qtl) at ${centre.name} today (${slot.startTime}-${slot.endTime}). Track live at mandi gate.`,
        booking,
      });
      return;
    }

    res.json({
      reply: 'ProcureX SMS Help: Send "BOOK <CENTRE_CODE> <CROP> <QTY>" to book slot, or "STATUS <TOKEN>" to check queue.',
    });
  } catch (error: any) {
    res.json({ reply: `ProcureX SMS Error: ${error.message}` });
  }
};

/**
 * Simulates interactive USSD session (e.g. *999*26032#)
 */
export const handleUssdSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, phoneNumber, text } = req.body;
    const input = (text || '').trim();

    // USSD Menu Flow
    if (input === '') {
      res.json({
        response: `CON Welcome to ProcureX Mandi Services:\n1. Book Procurement Slot\n2. Check Token Queue Status\n3. View Nearest Mandis\n4. Help`,
      });
      return;
    }

    if (input === '1') {
      res.json({
        response: `CON Select Mandi:\n1. Karnal Grain Market (PC-KNL-01)\n2. Khanna Mandi (PC-KHN-02)\n3. Nizamabad Agri Centre (PC-NZB-03)`,
      });
      return;
    }

    if (input === '1*1') {
      res.json({
        response: `CON Select Crop for Karnal Mandi:\n1. Wheat\n2. Paddy / Basmati Rice\n3. Mustard\n4. Maize`,
      });
      return;
    }

    if (input === '1*1*1') {
      res.json({
        response: `CON Enter Produce Quantity in Quintals (e.g. 30):`,
      });
      return;
    }

    if (input.startsWith('1*1*1*')) {
      const qtyStr = input.split('*')[3];
      const qty = parseFloat(qtyStr || '30');

      let user = await User.findOne({ phone: phoneNumber });
      if (!user) {
        user = await User.create({
          name: `USSD Farmer (${phoneNumber.slice(-4)})`,
          phone: phoneNumber,
          passwordHash: 'USSD_REGISTERED_USER',
          role: 'FARMER',
          status: 'ACTIVE',
        });
      }

      const centre = await ProcurementCentre.findOne({ centreCode: 'PC-KNL-01' });
      const todayStr = new Date().toISOString().split('T')[0];
      const slot = await Slot.findOne({ centreId: centre?._id, date: todayStr });

      if (centre && slot) {
        const booking = await createBookingAtomic({
          farmerId: user._id.toString(),
          centreId: centre._id.toString(),
          slotId: slot._id.toString(),
          cropType: 'Wheat',
          requestedQuantity: qty,
          unit: 'Quintal',
          bookingSource: 'USSD',
          actorName: `USSD (${phoneNumber})`,
          actorRole: 'FARMER',
        });

        res.json({
          response: `END ProcureX: Token ${booking.tokenNumber} Generated!\nMandi: ${centre.name}\nCrop: Wheat (${qty} Qtl)\nDate: Today (${slot.startTime})\nSMS confirmation sent.`,
        });
        return;
      }
    }

    if (input === '2') {
      res.json({
        response: `CON Enter your Token Number (e.g. TK-KNL-0001):`,
      });
      return;
    }

    if (input.startsWith('2*')) {
      const token = input.split('*')[1];
      const booking = await Booking.findOne({ tokenNumber: token?.toUpperCase() });
      if (booking) {
        res.json({
          response: `END Token ${booking.tokenNumber}:\nStatus: ${booking.status}\nCrop: ${booking.cropType} (${booking.requestedQuantity} Qtl)\nDate: ${booking.scheduledDate}`,
        });
        return;
      } else {
        res.json({ response: `END Token ${token} was not found in ProcureX database.` });
        return;
      }
    }

    if (input === '3') {
      res.json({
        response: `END Active Mandis:\n1. Karnal Market (Haryana) - Open\n2. Khanna Mandi (Punjab) - Open\n3. Nizamabad Market (Telangana) - Open\nDial *999*26032# again to book.`,
      });
      return;
    }

    res.json({
      response: `END ProcureX Support: Helpline 1800-180-1551. Thank you for using ProcureX.`,
    });
  } catch (error: any) {
    res.json({ response: `END System Error: ${error.message}` });
  }
};
