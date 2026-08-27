import { AuditLog } from '../models/AuditLog.js';
import mongoose from 'mongoose';

export interface IAuditPayload {
  actorId?: mongoose.Types.ObjectId | string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

export const logAuditAction = async (payload: IAuditPayload): Promise<void> => {
  try {
    await AuditLog.create({
      actorId: payload.actorId,
      actorName: payload.actorName || 'System',
      actorRole: payload.actorRole || 'SYSTEM',
      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId,
      metadata: payload.metadata,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('[Audit Log Error] Failed to write audit record:', error);
  }
};
