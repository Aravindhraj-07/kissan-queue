import mongoose, { Document, Schema, Types } from 'mongoose';

export type ProduceStatus = 'DECLARED' | 'SLOT_BOOKED' | 'PROCURED';

export interface IProduce extends Document {
  farmerId: Types.ObjectId;
  cropType: string;
  variety?: string;
  quantity: number;
  unit: string;
  estimatedHarvestDate?: Date;
  status: ProduceStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProduceSchema = new Schema<IProduce>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cropType: { type: String, required: true },
    variety: { type: String },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'Quintal' },
    estimatedHarvestDate: { type: Date },
    status: {
      type: String,
      enum: ['DECLARED', 'SLOT_BOOKED', 'PROCURED'],
      default: 'SLOT_BOOKED',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

ProduceSchema.index({ farmerId: 1 });
ProduceSchema.index({ cropType: 1 });

export const Produce = mongoose.model<IProduce>('Produce', ProduceSchema);
