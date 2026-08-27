import mongoose, { Document, Schema, Types } from 'mongoose';

export type ProcurementStatus = 'PENDING' | 'VERIFIED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
export type QualityGrade = 'Grade A' | 'Grade B' | 'Grade C' | 'FAQ';

export interface IProcurement extends Document {
  bookingId: Types.ObjectId;
  farmerId: Types.ObjectId;
  centreId: Types.ObjectId;
  authorityId: Types.ObjectId;
  cropType: string;
  expectedQuantity: number;
  actualQuantity: number;
  unit: string;
  qualityGrade: QualityGrade;
  moisturePercent: number;
  mspPricePerQuintal: number;
  totalPayout: number;
  digitalSlipNumber: string;
  status: ProcurementStatus;
  rejectionReason?: string;
  handoverToLogistics: boolean;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProcurementSchema = new Schema<IProcurement>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    centreId: { type: Schema.Types.ObjectId, ref: 'ProcurementCentre', required: true },
    authorityId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cropType: { type: String, required: true },
    expectedQuantity: { type: Number, required: true },
    actualQuantity: { type: Number, required: true },
    unit: { type: String, default: 'Quintal' },
    qualityGrade: {
      type: String,
      enum: ['Grade A', 'Grade B', 'Grade C', 'FAQ'],
      default: 'Grade A',
    },
    moisturePercent: { type: Number, default: 11.5 },
    mspPricePerQuintal: { type: Number, required: true, default: 2275 },
    totalPayout: { type: Number, required: true },
    digitalSlipNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'],
      default: 'COMPLETED',
    },
    rejectionReason: { type: String },
    handoverToLogistics: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ProcurementSchema.index({ farmerId: 1 });
ProcurementSchema.index({ centreId: 1, timestamp: -1 });
ProcurementSchema.index({ digitalSlipNumber: 1 });

export const Procurement = mongoose.model<IProcurement>('Procurement', ProcurementSchema);
