import mongoose, { Document, Schema, Types } from 'mongoose';

export type TransportStatus =
  | 'READY_FOR_PICKUP'
  | 'ASSIGNED'
  | 'PICKUP_IN_PROGRESS'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ITransportTask extends Document {
  procurementId: Types.ObjectId;
  farmerId: Types.ObjectId;
  centreId: Types.ObjectId;
  destinationWarehouse: string;
  cropType: string;
  quantity: number;
  unit: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  logisticsUserId?: Types.ObjectId;
  status: TransportStatus;
  pickupTime?: Date;
  deliveryTime?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransportTaskSchema = new Schema<ITransportTask>(
  {
    procurementId: { type: Schema.Types.ObjectId, ref: 'Procurement', required: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    centreId: { type: Schema.Types.ObjectId, ref: 'ProcurementCentre', required: true },
    destinationWarehouse: {
      type: String,
      required: true,
      default: 'State Central Food Grain Silo - Hub A',
    },
    cropType: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'Quintal' },
    vehicleNumber: { type: String },
    driverName: { type: String },
    driverPhone: { type: String },
    logisticsUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: [
        'READY_FOR_PICKUP',
        'ASSIGNED',
        'PICKUP_IN_PROGRESS',
        'PICKED_UP',
        'IN_TRANSIT',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED',
      ],
      default: 'READY_FOR_PICKUP',
    },
    pickupTime: { type: Date },
    deliveryTime: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

TransportTaskSchema.index({ status: 1 });
TransportTaskSchema.index({ centreId: 1 });
TransportTaskSchema.index({ farmerId: 1 });
TransportTaskSchema.index({ logisticsUserId: 1 });

export const TransportTask = mongoose.model<ITransportTask>(
  'TransportTask',
  TransportTaskSchema
);
