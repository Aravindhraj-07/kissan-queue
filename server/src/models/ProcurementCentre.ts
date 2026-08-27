import mongoose, { Document, Schema, Types } from 'mongoose';

export type CentreStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface IOperatingHours {
  open: string;
  close: string;
}

export interface ILocation {
  lat: number;
  lng: number;
}

export interface IProcurementCentre extends Document {
  name: string;
  centreCode: string; // e.g. PC-KNL-01
  location: ILocation;
  address: string;
  district: string;
  state: string;
  pincode: string;
  capacityPerDay: number; // in Quintals
  currentServingToken?: string;
  currentServingBookingId?: Types.ObjectId;
  operatingHours: IOperatingHours;
  supportedCrops: string[];
  status: CentreStatus;
  authorityId?: Types.ObjectId;
  contactPhone: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProcurementCentreSchema = new Schema<IProcurementCentre>(
  {
    name: { type: String, required: true, trim: true },
    centreCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    address: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    capacityPerDay: { type: Number, required: true, default: 500 },
    currentServingToken: { type: String, default: 'None' },
    currentServingBookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    operatingHours: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' },
    },
    supportedCrops: {
      type: [String],
      default: ['Wheat', 'Paddy / Rice', 'Maize', 'Mustard', 'Cotton', 'Soybean', 'Pulses'],
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
      default: 'ACTIVE',
    },
    authorityId: { type: Schema.Types.ObjectId, ref: 'User' },
    contactPhone: { type: String, default: '+91 1800-180-1551' },
  },
  { timestamps: true }
);

ProcurementCentreSchema.index({ district: 1 });
ProcurementCentreSchema.index({ 'location.lat': 1, 'location.lng': 1 });

export const ProcurementCentre = mongoose.model<IProcurementCentre>(
  'ProcurementCentre',
  ProcurementCentreSchema
);
