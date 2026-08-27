import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFarmDetails {
  landAreaAcres?: number;
  primaryCrops?: string[];
  bankAccountNumber?: string;
  bankIfsc?: string;
  aadhaarNumber?: string;
}

export interface IFarmerProfile extends Document {
  userId: Types.ObjectId;
  farmerId: string; // e.g. FRM-2026-0042
  address: string;
  village: string;
  district: string;
  state: string;
  preferredLanguage: string;
  farmDetails: IFarmDetails;
  createdAt: Date;
  updatedAt: Date;
}

const FarmerProfileSchema = new Schema<IFarmerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    farmerId: { type: String, required: true, unique: true },
    address: { type: String, default: '' },
    village: { type: String, default: '' },
    district: { type: String, default: '' },
    state: { type: String, default: '' },
    preferredLanguage: { type: String, default: 'en' },
    farmDetails: {
      landAreaAcres: { type: Number, default: 0 },
      primaryCrops: [{ type: String }],
      bankAccountNumber: { type: String, default: '' },
      bankIfsc: { type: String, default: '' },
      aadhaarNumber: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

FarmerProfileSchema.index({ district: 1 });

export const FarmerProfile = mongoose.model<IFarmerProfile>('FarmerProfile', FarmerProfileSchema);
