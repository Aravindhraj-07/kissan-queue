import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { ProcurementCentre } from '../models/ProcurementCentre.js';
import { Slot } from '../models/Slot.js';
import { Booking } from '../models/Booking.js';
import { Procurement } from '../models/Procurement.js';
import { TransportTask } from '../models/TransportTask.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';

const seedDatabase = async () => {
  try {
    console.log(`[Seed] Connecting to MongoDB: ${ENV.MONGODB_URI}...`);
    await mongoose.connect(ENV.MONGODB_URI);
    console.log(`[Seed] Connected to database.`);

    // Clear existing collections
    console.log(`[Seed] Clearing old data...`);
    await Promise.all([
      User.deleteMany({}),
      FarmerProfile.deleteMany({}),
      ProcurementCentre.deleteMany({}),
      Slot.deleteMany({}),
      Booking.deleteMany({}),
      Procurement.deleteMany({}),
      TransportTask.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    const defaultPassword = 'Password@123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);
    const adminPasswordHash = await bcrypt.hash('Admin@123', salt);

    console.log(`[Seed] Creating User accounts...`);

    // 1. Admin
    const adminUser = await User.create({
      name: 'Dr. Rajiv Malhotra (IAS)',
      phone: '9999900001',
      email: 'admin@procurex.gov.in',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    // 2. Storage Authority Staff
    const authorityKarnal = await User.create({
      name: 'Shri Om Prakash (Mandi Secretary)',
      phone: '9999900002',
      email: 'authority@procurex.gov.in',
      passwordHash,
      role: 'STORAGE_AUTHORITY',
      status: 'ACTIVE',
    });

    const authorityKhanna = await User.create({
      name: 'Harpreet Singh Sandhu',
      phone: '9999900003',
      email: 'khanna.authority@procurex.gov.in',
      passwordHash,
      role: 'STORAGE_AUTHORITY',
      status: 'ACTIVE',
    });

    // 3. Logistics User
    const logisticsUser = await User.create({
      name: 'State Logistics Dispatch Cell',
      phone: '9999900004',
      email: 'logistics@procurex.gov.in',
      passwordHash,
      role: 'LOGISTICS',
      status: 'ACTIVE',
    });

    // 4. Farmers
    const farmer1 = await User.create({
      name: 'Sardar Gurpreet Singh',
      phone: '9876500001',
      email: 'farmer@procurex.gov.in',
      passwordHash,
      role: 'FARMER',
      status: 'ACTIVE',
    });

    const farmer2 = await User.create({
      name: 'Ramesh Kumar Verma',
      phone: '9876500002',
      email: 'farmer2@procurex.gov.in',
      passwordHash,
      role: 'FARMER',
      status: 'ACTIVE',
    });

    const farmer3 = await User.create({
      name: 'Baldev Singh Dhillon',
      phone: '9876500003',
      email: 'farmer3@procurex.gov.in',
      passwordHash,
      role: 'FARMER',
      status: 'ACTIVE',
    });

    const farmer4 = await User.create({
      name: 'K. Venkateshwar Rao',
      phone: '9876500004',
      email: 'farmer4@procurex.gov.in',
      passwordHash,
      role: 'FARMER',
      status: 'ACTIVE',
    });

    console.log(`[Seed] Creating Farmer Profiles...`);
    await FarmerProfile.create([
      {
        userId: farmer1._id,
        farmerId: 'FRM-2026-0101',
        address: 'House 42, Main Road, Taraori',
        village: 'Taraori',
        district: 'Karnal',
        state: 'Haryana',
        preferredLanguage: 'hi',
        farmDetails: {
          landAreaAcres: 8.5,
          primaryCrops: ['Wheat', 'Paddy / Basmati Rice', 'Mustard'],
          bankAccountNumber: 'SBI-98402910482',
          bankIfsc: 'SBIN0001234',
        },
      },
      {
        userId: farmer2._id,
        farmerId: 'FRM-2026-0102',
        address: 'VPO Indri, Near Canal Bridge',
        village: 'Indri',
        district: 'Karnal',
        state: 'Haryana',
        preferredLanguage: 'hi',
        farmDetails: {
          landAreaAcres: 5.0,
          primaryCrops: ['Wheat', 'Mustard'],
          bankAccountNumber: 'HDFC-8839201948',
          bankIfsc: 'HDFC0004321',
        },
      },
      {
        userId: farmer3._id,
        farmerId: 'FRM-2026-0103',
        address: 'GT Road Samrala',
        village: 'Samrala',
        district: 'Khanna',
        state: 'Punjab',
        preferredLanguage: 'pa',
        farmDetails: {
          landAreaAcres: 12.0,
          primaryCrops: ['Paddy / Rice', 'Wheat'],
          bankAccountNumber: 'PNB-7728193821',
          bankIfsc: 'PUNB0007890',
        },
      },
      {
        userId: farmer4._id,
        farmerId: 'FRM-2026-0104',
        address: 'Armoor Cross Road',
        village: 'Armoor',
        district: 'Nizamabad',
        state: 'Telangana',
        preferredLanguage: 'te',
        farmDetails: {
          landAreaAcres: 6.5,
          primaryCrops: ['Maize', 'Soybean', 'Cotton'],
          bankAccountNumber: 'ANDB-6628192011',
          bankIfsc: 'UBIN0005544',
        },
      },
    ]);

    console.log(`[Seed] Creating Procurement Centres...`);
    const centreKarnal = await ProcurementCentre.create({
      name: 'Karnal Grain Market (Main Yard)',
      centreCode: 'PC-KNL-01',
      location: { lat: 29.6857, lng: 76.9905 },
      address: 'Grain Market Complex, Sector 3, GT Road, Karnal',
      district: 'Karnal',
      state: 'Haryana',
      pincode: '132001',
      capacityPerDay: 800,
      currentServingToken: 'TK-KNL-0001',
      operatingHours: { open: '08:00', close: '18:00' },
      supportedCrops: ['Wheat', 'Paddy / Basmati Rice', 'Mustard', 'Maize'],
      status: 'ACTIVE',
      authorityId: authorityKarnal._id,
      contactPhone: '+91 184-2256789',
    });

    const centreKhanna = await ProcurementCentre.create({
      name: 'Khanna Asia Grain Mandi Complex',
      centreCode: 'PC-KHN-02',
      location: { lat: 30.7046, lng: 76.2163 },
      address: 'National Highway 44, Khanna Grain Terminal',
      district: 'Ludhiana',
      state: 'Punjab',
      pincode: '141401',
      capacityPerDay: 1500,
      currentServingToken: 'TK-KHN-0001',
      operatingHours: { open: '07:30', close: '19:00' },
      supportedCrops: ['Wheat', 'Paddy / Rice', 'Maize', 'Pulses'],
      status: 'ACTIVE',
      authorityId: authorityKhanna._id,
      contactPhone: '+91 1628-223344',
    });

    const centreNizamabad = await ProcurementCentre.create({
      name: 'Nizamabad Agricultural Produce Market',
      centreCode: 'PC-NZB-03',
      location: { lat: 18.6725, lng: 78.0941 },
      address: 'Market Yard Road, Shivaji Nagar, Nizamabad',
      district: 'Nizamabad',
      state: 'Telangana',
      pincode: '503001',
      capacityPerDay: 600,
      currentServingToken: 'None',
      operatingHours: { open: '08:30', close: '17:30' },
      supportedCrops: ['Maize', 'Soybean', 'Cotton', 'Paddy / Rice'],
      status: 'ACTIVE',
      contactPhone: '+91 8462-234567',
    });

    console.log(`[Seed] Generating Slots for today & next days...`);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const slot1 = await Slot.create({
      centreId: centreKarnal._id,
      date: todayStr,
      startTime: '08:30',
      endTime: '10:30',
      capacity: 8,
      bookedCount: 3,
      remainingCapacity: 5,
      status: 'AVAILABLE',
    });

    const slot2 = await Slot.create({
      centreId: centreKarnal._id,
      date: todayStr,
      startTime: '10:30',
      endTime: '12:30',
      capacity: 8,
      bookedCount: 1,
      remainingCapacity: 7,
      status: 'AVAILABLE',
    });

    const slot3 = await Slot.create({
      centreId: centreKarnal._id,
      date: todayStr,
      startTime: '13:30',
      endTime: '15:30',
      capacity: 8,
      bookedCount: 0,
      remainingCapacity: 8,
      status: 'AVAILABLE',
    });

    const slot4 = await Slot.create({
      centreId: centreKarnal._id,
      date: todayStr,
      startTime: '15:30',
      endTime: '17:30',
      capacity: 8,
      bookedCount: 0,
      remainingCapacity: 8,
      status: 'AVAILABLE',
    });

    // Slots for Khanna Mandi
    await Slot.create([
      {
        centreId: centreKhanna._id,
        date: todayStr,
        startTime: '08:00',
        endTime: '10:30',
        capacity: 10,
        bookedCount: 2,
        remainingCapacity: 8,
        status: 'AVAILABLE',
      },
      {
        centreId: centreKhanna._id,
        date: todayStr,
        startTime: '11:00',
        endTime: '13:30',
        capacity: 10,
        bookedCount: 0,
        remainingCapacity: 10,
        status: 'AVAILABLE',
      },
    ]);

    // Slots for Nizamabad
    await Slot.create([
      {
        centreId: centreNizamabad._id,
        date: todayStr,
        startTime: '09:00',
        endTime: '11:30',
        capacity: 8,
        bookedCount: 0,
        remainingCapacity: 8,
        status: 'AVAILABLE',
      },
    ]);

    console.log(`[Seed] Creating Today's Active Bookings & Live Queue...`);

    // Booking 1: Ramesh Verma (Currently PROCESSING at Weighbridge Counter)
    const booking1 = await Booking.create({
      bookingId: 'BK-2026-0001',
      farmerId: farmer2._id,
      centreId: centreKarnal._id,
      slotId: slot1._id,
      cropType: 'Wheat',
      requestedQuantity: 35,
      unit: 'Quintal',
      tokenNumber: 'TK-KNL-0001',
      tokenSequence: 1,
      queuePosition: 1,
      status: 'PROCESSING',
      bookingSource: 'WEB',
      scheduledDate: todayStr,
      arrivedAt: new Date(Date.now() - 30 * 60000),
      calledAt: new Date(Date.now() - 5 * 60000),
    });

    // Update centre serving booking ref
    centreKarnal.currentServingBookingId = booking1._id as any;
    await centreKarnal.save();

    // Booking 2: Gurpreet Singh (Demo Farmer - ARRIVED, in queue position 1)
    const booking2 = await Booking.create({
      bookingId: 'BK-2026-0002',
      farmerId: farmer1._id,
      centreId: centreKarnal._id,
      slotId: slot1._id,
      cropType: 'Wheat',
      requestedQuantity: 40,
      unit: 'Quintal',
      tokenNumber: 'TK-KNL-0002',
      tokenSequence: 2,
      queuePosition: 1,
      status: 'ARRIVED',
      bookingSource: 'WEB',
      scheduledDate: todayStr,
      arrivedAt: new Date(Date.now() - 15 * 60000),
    });

    // Booking 3: Baldev Singh (CONFIRMED, scheduled for today)
    const booking3 = await Booking.create({
      bookingId: 'BK-2026-0003',
      farmerId: farmer3._id,
      centreId: centreKarnal._id,
      slotId: slot1._id,
      cropType: 'Mustard',
      requestedQuantity: 20,
      unit: 'Quintal',
      tokenNumber: 'TK-KNL-0003',
      tokenSequence: 3,
      queuePosition: 2,
      status: 'CONFIRMED',
      bookingSource: 'WEB',
      scheduledDate: todayStr,
    });

    // Booking 4: Venkateshwar Rao (Slot 2)
    await Booking.create({
      bookingId: 'BK-2026-0004',
      farmerId: farmer4._id,
      centreId: centreKarnal._id,
      slotId: slot2._id,
      cropType: 'Maize',
      requestedQuantity: 50,
      unit: 'Quintal',
      tokenNumber: 'TK-KNL-0004',
      tokenSequence: 4,
      queuePosition: 3,
      status: 'CONFIRMED',
      bookingSource: 'SMS',
      scheduledDate: todayStr,
    });

    // Past completed booking for Gurpreet Singh with a real procurement slip
    const pastBooking = await Booking.create({
      bookingId: 'BK-2026-0099',
      farmerId: farmer1._id,
      centreId: centreKarnal._id,
      slotId: slot1._id,
      cropType: 'Paddy / Basmati Rice',
      requestedQuantity: 45,
      unit: 'Quintal',
      tokenNumber: 'TK-KNL-0099',
      tokenSequence: 99,
      queuePosition: 0,
      status: 'COMPLETED',
      bookingSource: 'WEB',
      scheduledDate: todayStr,
      arrivedAt: new Date(Date.now() - 120 * 60000),
      completedAt: new Date(Date.now() - 60 * 60000),
    });

    console.log(`[Seed] Creating Completed Procurement Record & Logistics Task...`);
    const completedProcurement = await Procurement.create({
      bookingId: pastBooking._id,
      farmerId: farmer1._id,
      centreId: centreKarnal._id,
      authorityId: authorityKarnal._id,
      cropType: 'Paddy / Basmati Rice',
      expectedQuantity: 45,
      actualQuantity: 46.5,
      unit: 'Quintal',
      qualityGrade: 'Grade A',
      moisturePercent: 11.2,
      mspPricePerQuintal: 2320,
      totalPayout: 107880,
      digitalSlipNumber: 'PRC-784019-902',
      status: 'COMPLETED',
      handoverToLogistics: true,
      timestamp: new Date(Date.now() - 60 * 60000),
    });

    // Logistics Task 1: READY_FOR_PICKUP
    await TransportTask.create({
      procurementId: completedProcurement._id,
      centreId: centreKarnal._id,
      destinationWarehouse: 'FCI Central Silo Complex, GT Road, Kurukshetra',
      cropType: 'Paddy / Basmati Rice',
      quantity: 46.5,
      unit: 'Quintal',
      status: 'READY_FOR_PICKUP',
      notes: 'High-grade Basmati batch ready for dispatch to Central Silo.',
    });

    // Logistics Task 2: IN_TRANSIT
    await TransportTask.create({
      procurementId: completedProcurement._id,
      centreId: centreKhanna._id,
      destinationWarehouse: 'Punjab State Warehousing Silo Hub 1',
      cropType: 'Wheat',
      quantity: 120.0,
      unit: 'Quintal',
      vehicleNumber: 'PB-10-CZ-9912',
      driverName: 'Jagjit Singh',
      driverPhone: '+91 98140-55441',
      logisticsUserId: logisticsUser._id,
      status: 'IN_TRANSIT',
      pickupTime: new Date(Date.now() - 90 * 60000),
      notes: 'Dispatched from Khanna Mandi. GPS tracking active.',
    });

    // Initial Notifications
    console.log(`[Seed] Creating Initial Notifications...`);
    await Notification.create([
      {
        userId: farmer1._id,
        type: 'SLOT_BOOKED',
        title: 'Booking Confirmed for Today!',
        message: `Your booking at Karnal Grain Market is CONFIRMED for ${todayStr} (08:30 - 10:30). Token: TK-KNL-0002.`,
        channel: 'WEB',
      },
      {
        userId: farmer1._id,
        type: 'QUEUE_ALERT',
        title: 'Arrival Verified at Gate ✅',
        message: 'Your token TK-KNL-0002 is active in queue. 1 farmer ahead of you.',
        channel: 'WEB',
      },
      {
        userId: authorityKarnal._id,
        type: 'SYSTEM_ALERT',
        title: 'Morning Operations Commenced',
        message: 'Karnal Grain Market daily live queue opened. 4 farmers booked today.',
        channel: 'WEB',
      },
    ]);

    // Initial Audit Logs
    console.log(`[Seed] Creating Audit Logs...`);
    await AuditLog.create([
      {
        actorId: adminUser._id,
        actorName: adminUser.name,
        actorRole: 'ADMIN',
        action: 'SYSTEM_INITIALIZED',
        entityType: 'SYSTEM',
        metadata: { centres: 3, season: 'Rabi 2026' },
      },
      {
        actorId: authorityKarnal._id,
        actorName: authorityKarnal.name,
        actorRole: 'STORAGE_AUTHORITY',
        action: 'VERIFIED_FARMER_ARRIVAL',
        entityType: 'BOOKING',
        entityId: booking2._id.toString(),
        metadata: { tokenNumber: 'TK-KNL-0002' },
      },
      {
        actorId: authorityKarnal._id,
        actorName: authorityKarnal.name,
        actorRole: 'STORAGE_AUTHORITY',
        action: 'CALLED_NEXT_TOKEN',
        entityType: 'CENTRE',
        entityId: centreKarnal._id.toString(),
        metadata: { tokenNumber: 'TK-KNL-0001' },
      },
    ]);

    console.log(`\n=======================================================`);
    console.log(`  🌾 ProcureX Database Seed Completed Successfully!`);
    console.log(`=======================================================`);
    console.log(`  DEMO CREDENTIALS:`);
    console.log(`  -----------------------------------------------------`);
    console.log(`  👨‍🌾 FARMER:            farmer@procurex.gov.in     / Password@123`);
    console.log(`  🏢 STORAGE AUTHORITY: authority@procurex.gov.in  / Password@123`);
    console.log(`  🚚 LOGISTICS:         logistics@procurex.gov.in  / Password@123`);
    console.log(`  🏛️ ADMIN:             admin@procurex.gov.in      / Admin@123`);
    console.log(`=======================================================\n`);

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
