import mongoose, { Document, Schema, Types } from 'mongoose';

export type NotificationType =
  | 'SLOT_BOOKED'
  | 'QUEUE_ALERT'
  | 'TURN_APPROACHING'
  | 'TURN_NOW'
  | 'PROCUREMENT_COMPLETED'
  | 'LOGISTICS_DISPATCH'
  | 'SLOT_REALLOCATION'
  | 'SYSTEM_ALERT';

export type NotificationChannel = 'WEB' | 'SMS' | 'USSD';

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'SLOT_BOOKED',
        'QUEUE_ALERT',
        'TURN_APPROACHING',
        'TURN_NOW',
        'PROCUREMENT_COMPLETED',
        'LOGISTICS_DISPATCH',
        'SLOT_REALLOCATION',
        'SYSTEM_ALERT',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    channel: {
      type: String,
      enum: ['WEB', 'SMS', 'USSD'],
      default: 'WEB',
    },
    read: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ read: 1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
