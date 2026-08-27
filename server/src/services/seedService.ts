import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { ProcurementCentre } from '../models/ProcurementCentre.js';
import { Slot } from '../models/Slot.js';

export const ensureDefaultAccounts = async (): Promise<void> => {
  try {
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Password@123', salt);
    const adminPasswordHash = await bcrypt.hash('Admin@123', salt);

    // 1. Ensure Admin Account
    const existingAdmin = await User.findOne({
      $or: [{ email: 'admin@procurex.gov.in' }, { phone: '9999900001' }],
    });

    if (!existingAdmin) {
      await User.create({
        name: 'Dr. Rajiv Malhotra (IAS)',
        phone: '9999900001',
        email: 'admin@procurex.gov.in',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      });
      console.log('  [SeedService] Default Admin user created: admin@procurex.gov.in / 9999900001');
    }

    // 2. Ensure Storage Authority Account
    const existingAuthority = await User.findOne({
      $or: [{ email: 'authority@procurex.gov.in' }, { phone: '9999900002' }],
    });

    let authorityUser = existingAuthority;
    if (!existingAuthority) {
      authorityUser = await User.create({
        name: 'Shri Om Prakash (Mandi Secretary)',
        phone: '9999900002',
        email: 'authority@procurex.gov.in',
        passwordHash: defaultPasswordHash,
        role: 'STORAGE_AUTHORITY',
        status: 'ACTIVE',
      });
      console.log('  [SeedService] Default Storage Authority user created: authority@procurex.gov.in / 9999900002');
    }

    // 3. Ensure Logistics Account
    const existingLogistics = await User.findOne({
      $or: [{ email: 'logistics@procurex.gov.in' }, { phone: '9999900004' }],
    });

    if (!existingLogistics) {
      await User.create({
        name: 'State Logistics Dispatch Cell',
        phone: '9999900004',
        email: 'logistics@procurex.gov.in',
        passwordHash: defaultPasswordHash,
        role: 'LOGISTICS',
        status: 'ACTIVE',
      });
      console.log('  [SeedService] Default Logistics user created: logistics@procurex.gov.in / 9999900004');
    }

    // 4. Ensure Farmer Account & Profile
    const existingFarmer = await User.findOne({
      $or: [{ email: 'farmer@procurex.gov.in' }, { phone: '9876500001' }],
    });

    if (!existingFarmer) {
      const farmer = await User.create({
        name: 'Sardar Gurpreet Singh',
        phone: '9876500001',
        email: 'farmer@procurex.gov.in',
        passwordHash: defaultPasswordHash,
        role: 'FARMER',
        status: 'ACTIVE',
      });

      await FarmerProfile.create({
        userId: farmer._id,
        farmerId: 'FRM-2026-0101',
        address: 'House 42, Main Road, Taraori',
        village: 'Taraori',
        district: 'Karnal',
        state: 'Haryana',
        preferredLanguage: 'en',
        farmDetails: {
          landAreaAcres: 8.5,
          primaryCrops: ['Wheat', 'Paddy / Basmati Rice', 'Mustard'],
          bankAccountNumber: 'SBI-98402910482',
          bankIfsc: 'SBIN0001234',
        },
      });
      console.log('  [SeedService] Default Farmer user created: farmer@procurex.gov.in / 9876500001');
    }

    // 5. Ensure Mandis exist
    const centreCount = await ProcurementCentre.countDocuments();
    if (centreCount === 0) {
      const defaultCentres = await ProcurementCentre.create([
        {
          name: 'Karnal Grain Market (Main Yard)',
          centreCode: 'PC-KNL-01',
          location: { lat: 29.6857, lng: 76.9905 },
          address: 'Sector 4, GT Road, Grain Market Complex',
          district: 'Karnal',
          state: 'Haryana',
          pincode: '132001',
          capacityPerDay: 800,
          currentServingToken: 'None',
          operatingHours: { open: '08:00', close: '18:00' },
          supportedCrops: ['Wheat', 'Paddy / Rice', 'Mustard', 'Maize'],
          status: 'ACTIVE',
          authorityId: authorityUser?._id,
          contactPhone: '+91 184-225-0101',
        },
        {
          name: 'Panipat Anaj Mandi Complex',
          centreCode: 'PC-PNP-04',
          location: { lat: 29.3909, lng: 76.9635 },
          address: 'Old Industrial Area, Near GT Road Toll',
          district: 'Panipat',
          state: 'Haryana',
          pincode: '132103',
          capacityPerDay: 650,
          currentServingToken: 'None',
          operatingHours: { open: '08:00', close: '18:00' },
          supportedCrops: ['Wheat', 'Paddy / Rice', 'Cotton', 'Mustard'],
          status: 'ACTIVE',
          contactPhone: '+91 180-264-0404',
        },
        {
          name: 'Kurukshetra Grain Market (Pipli Yard)',
          centreCode: 'PC-KRK-03',
          location: { lat: 29.9695, lng: 76.8783 },
          address: 'Pipli Highway Junction, Grain Market Yard',
          district: 'Kurukshetra',
          state: 'Haryana',
          pincode: '136131',
          capacityPerDay: 700,
          currentServingToken: 'None',
          operatingHours: { open: '08:00', close: '18:00' },
          supportedCrops: ['Wheat', 'Paddy / Rice', 'Maize', 'Soybean'],
          status: 'ACTIVE',
          contactPhone: '+91 1744-230-303',
        },
      ]);

      console.log('  [SeedService] Default Mandi Centres created.');

      // Generate today and tomorrow slots for the first centre
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const timeWindows = [
        { startTime: '08:30', endTime: '10:30', capacity: 10 },
        { startTime: '10:30', endTime: '12:30', capacity: 10 },
        { startTime: '13:30', endTime: '15:30', capacity: 10 },
        { startTime: '15:30', endTime: '17:30', capacity: 10 },
      ];

      for (const centre of defaultCentres) {
        for (const date of [today, tomorrow]) {
          for (const tw of timeWindows) {
            await Slot.create({
              centreId: centre._id,
              date,
              startTime: tw.startTime,
              endTime: tw.endTime,
              capacity: tw.capacity,
              bookedCount: 0,
              remainingCapacity: tw.capacity,
              bookedQuantityQuintals: 0,
              status: 'AVAILABLE',
            });
          }
        }
      }
      console.log('  [SeedService] Initial slot windows configured.');
    }
  } catch (err) {
    console.error('  [SeedService] Error ensuring default accounts:', err);
  }
};
