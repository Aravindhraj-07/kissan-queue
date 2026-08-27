import { Request, Response } from 'express';
import { ProcurementCentre } from '../models/ProcurementCentre.js';
import { calculateDistanceKm } from '../utils/geo.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditAction } from '../services/auditService.js';

export const getCentres = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, district, crop } = req.query;

    let query: any = { status: { $in: ['ACTIVE', 'MAINTENANCE'] } };
    if (district) {
      query.district = { $regex: new RegExp(district as string, 'i') };
    }
    if (crop) {
      query.supportedCrops = { $in: [crop as string] };
    }

    let centres = await ProcurementCentre.find(query).populate('authorityId', 'name phone email');

    // If user provided GPS coordinates, calculate distance & sort
    if (lat && lng) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);

      if (!isNaN(userLat) && !isNaN(userLng)) {
        const centresWithDist = centres.map((centre) => {
          const distanceKm = calculateDistanceKm(
            userLat,
            userLng,
            centre.location.lat,
            centre.location.lng
          );
          return {
            ...centre.toObject(),
            distanceKm,
          };
        });

        centresWithDist.sort((a, b) => a.distanceKm - b.distanceKm);
        res.json({ success: true, count: centresWithDist.length, data: centresWithDist });
        return;
      }
    }

    res.json({ success: true, count: centres.length, data: centres });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCentreById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const centre = await ProcurementCentre.findById(id).populate('authorityId', 'name phone email');
    if (!centre) {
      res.status(404).json({ success: false, message: 'Procurement centre not found.' });
      return;
    }
    res.json({ success: true, data: centre });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCentre = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      centreCode,
      lat,
      lng,
      address,
      district,
      state,
      pincode,
      capacityPerDay,
      operatingHours,
      supportedCrops,
      authorityId,
      contactPhone,
    } = req.body;

    const centre = await ProcurementCentre.create({
      name,
      centreCode,
      location: { lat: Number(lat), lng: Number(lng) },
      address,
      district,
      state,
      pincode,
      capacityPerDay: Number(capacityPerDay) || 500,
      operatingHours: operatingHours || { open: '08:00', close: '18:00' },
      supportedCrops: supportedCrops || ['Wheat', 'Paddy / Rice', 'Maize', 'Mustard', 'Cotton'],
      authorityId: authorityId || req.user?._id,
      contactPhone: contactPhone || '+91 1800-180-1551',
      status: 'ACTIVE',
    });

    if (req.user) {
      await logAuditAction({
        actorId: req.user._id,
        actorName: req.user.name,
        actorRole: req.user.role,
        action: 'CREATED_PROCUREMENT_CENTRE',
        entityType: 'CENTRE',
        entityId: centre._id.toString(),
        metadata: { name, centreCode },
      });
    }

    res.status(201).json({ success: true, message: 'Procurement centre created.', data: centre });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCentre = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const centre = await ProcurementCentre.findByIdAndUpdate(id, updateData, { new: true });
    if (!centre) {
      res.status(404).json({ success: false, message: 'Centre not found' });
      return;
    }

    if (req.user) {
      await logAuditAction({
        actorId: req.user._id,
        actorName: req.user.name,
        actorRole: req.user.role,
        action: 'UPDATED_PROCUREMENT_CENTRE',
        entityType: 'CENTRE',
        entityId: centre._id.toString(),
        metadata: updateData,
      });
    }

    res.json({ success: true, message: 'Centre updated successfully.', data: centre });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
