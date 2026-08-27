import { Notification, NotificationType, NotificationChannel } from '../models/Notification.js';
import { emitToUser } from '../sockets/socketManager.js';
import mongoose from 'mongoose';

export interface ISendNotificationParams {
  userId: mongoose.Types.ObjectId | string;
  type: NotificationType;
  title: string;
  message: string;
  channel?: NotificationChannel;
  metadata?: Record<string, any>;
}

export const sendNotification = async (params: ISendNotificationParams) => {
  try {
    const notification = await Notification.create({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      channel: params.channel || 'WEB',
      read: false,
      metadata: params.metadata,
    });

    // Real-time emission via Socket.IO
    emitToUser(params.userId.toString(), 'NOTIFICATION_RECEIVED', notification);

    return notification;
  } catch (error) {
    console.error('[Notification Error] Failed to create and send notification:', error);
    return null;
  }
};
