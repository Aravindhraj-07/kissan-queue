import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { ProcurementCentre } from '../models/ProcurementCentre.js';
import { ENV } from '../config/env.js';
import { logAuditAction } from '../services/auditService.js';
import { AuthRequest } from '../middleware/auth.js';

const generateToken = (userId: string, role: UserRole): string => {
  return jwt.sign({ id: userId, role }, ENV.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email, password, role = 'FARMER', village, district, state, landAreaAcres } = req.body;

    if (!name || !phone || !password) {
      res.status(400).json({ success: false, message: 'Name, mobile number, and password are required.' });
      return;
    }

    const cleanPhone = phone.trim().replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 10) {
      res.status(400).json({ success: false, message: 'Please provide a valid mobile number.' });
      return;
    }

    const existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with this mobile number already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      phone: cleanPhone,
      email: email ? email.trim().toLowerCase() : undefined,
      passwordHash,
      role,
      status: 'ACTIVE',
    });

    let profile = null;
    if (role === 'FARMER') {
      const farmerCount = await FarmerProfile.countDocuments();
      const farmerId = `FRM-2026-${(farmerCount + 101).toString().padStart(4, '0')}`;
      profile = await FarmerProfile.create({
        userId: user._id,
        farmerId,
        village: village?.trim() || '',
        district: district?.trim() || '',
        state: state?.trim() || '',
        farmDetails: {
          landAreaAcres: Number(landAreaAcres) || 0,
          primaryCrops: ['Wheat', 'Paddy / Rice'],
        },
      });
    }

    const token = generateToken(user._id.toString(), user.role);

    await logAuditAction({
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: user._id.toString(),
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Registration failed.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ success: false, message: 'Mobile number/Email and password are required.' });
      return;
    }

    const cleanIdentifier = identifier.trim();
    const user = await User.findOne({
      $or: [{ phone: cleanIdentifier }, { email: cleanIdentifier.toLowerCase() }],
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials. User account not found.' });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({ success: false, message: 'Your account is suspended. Please contact Mandi Administration.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
      return;
    }

    const token = generateToken(user._id.toString(), user.role);
    let profile = null;
    let centre = null;

    if (user.role === 'FARMER') {
      profile = await FarmerProfile.findOne({ userId: user._id });
    } else if (user.role === 'STORAGE_AUTHORITY') {
      centre = await ProcurementCentre.findOne({ authorityId: user._id });
      if (!centre) {
        centre = await ProcurementCentre.findOne({ status: 'ACTIVE' });
      }
    }

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      profile,
      centre,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Login failed.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized session.' });
      return;
    }

    let profile = null;
    let centre = null;

    if (req.user.role === 'FARMER') {
      profile = await FarmerProfile.findOne({ userId: req.user._id });
    } else if (req.user.role === 'STORAGE_AUTHORITY') {
      centre = await ProcurementCentre.findOne({ authorityId: req.user._id });
      if (!centre) {
        centre = await ProcurementCentre.findOne({ status: 'ACTIVE' });
      }
    }

    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        phone: req.user.phone,
        email: req.user.email,
        role: req.user.role,
      },
      profile,
      centre,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
