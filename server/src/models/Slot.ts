import mongoose, { Document, Schema, Types } from 'mongoose';

export type SlotStatus = 'AVAILABLE' | 'FULL' | 'CLOSED' | 'COMPLETED' | 'CANCELLED';

export interface ISlot extends Document {
  centreId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm e.g. "09:00"
  endTime: string; // HH:mm e.g. "10:30"
  capacity: number; // Maximum bookings/farmers per slot
  bookedCount: number;
  remainingCapacity: number;
  maxQuantityQuintals?: number;
  bookedQuantityQuintals: number;
  status: SlotStatus;
  createdAt: Date;
  updatedAt: Date;
}

const SlotSchema = new Schema<ISlot>(
  {
    centreId: { type: Schema.Types.ObjectId, ref: 'ProcurementCentre', required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    capacity: { type: Number, required: true, default: 8 },
    bookedCount: { type: Number, required: true, default: 0 },
    remainingCapacity: { type: Number, required: true, default: 8 },
    maxQuantityQuintals: { type: Number, default: 400 },
    bookedQuantityQuintals: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['AVAILABLE', 'FULL', 'CLOSED', 'COMPLETED', 'CANCELLED'],
      default: 'AVAILABLE',
    },
  },
  { timestamps: true }
);

SlotSchema.index({ centreId: 1, date: 1 });
SlotSchema.index({ date: 1, status: 1 });

export const Slot = mongoose.model<ISlot>('Slot', SlotSchema);
