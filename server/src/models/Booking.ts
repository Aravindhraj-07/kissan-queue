import mongoose, { Document, Schema, Types } from 'mongoose';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'WAITLISTED'
  | 'ARRIVED'
  | 'IN_QUEUE'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'EXPIRED';

export type BookingSource = 'WEB' | 'SMS' | 'USSD';

export interface IBooking extends Document {
  bookingId: string;
  farmerId: Types.ObjectId;
  centreId: Types.ObjectId;
  slotId: Types.ObjectId;
  cropType: string;
  requestedQuantity: number;
  unit: string;
  tokenNumber: string;
  tokenSequence: number;
  queuePosition: number;
  status: BookingStatus;
  bookingSource: BookingSource;
  scheduledDate: string; // YYYY-MM-DD
  arrivedAt?: Date;
  calledAt?: Date;
  completedAt?: Date;
  cancellationReason?: string;
  reallocatedFromBookingId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingId: { type: String, required: true, unique: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    centreId: { type: Schema.Types.ObjectId, ref: 'ProcurementCentre', required: true },
    slotId: { type: Schema.Types.ObjectId, ref: 'Slot', required: true },
    cropType: { type: String, required: true },
    requestedQuantity: { type: Number, required: true },
    unit: { type: String, default: 'Quintal' },
    tokenNumber: { type: String, required: true },
    tokenSequence: { type: Number, required: true, default: 1 },
    queuePosition: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        'PENDING',
        'CONFIRMED',
        'WAITLISTED',
        'ARRIVED',
        'IN_QUEUE',
        'PROCESSING',
        'COMPLETED',
        'CANCELLED',
        'NO_SHOW',
        'EXPIRED',
      ],
      default: 'CONFIRMED',
    },
    bookingSource: {
      type: String,
      enum: ['WEB', 'SMS', 'USSD'],
      default: 'WEB',
    },
    scheduledDate: { type: String, required: true },
    arrivedAt: { type: Date },
    calledAt: { type: Date },
    completedAt: { type: Date },
    cancellationReason: { type: String },
    reallocatedFromBookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
  },
  { timestamps: true }
);

BookingSchema.index({ farmerId: 1, scheduledDate: 1 });
BookingSchema.index({ centreId: 1, scheduledDate: 1, status: 1 });
BookingSchema.index({ tokenNumber: 1 });
BookingSchema.index({ slotId: 1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
