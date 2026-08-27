import { TransportTask, TransportStatus } from '../models/TransportTask.js';
import { broadcastLogisticsUpdate } from '../sockets/socketManager.js';
import { logAuditAction } from './auditService.js';

export interface IAssignTransportInput {
  taskId: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone?: string;
  destinationWarehouse?: string;
  logisticsUser: any;
}

export const assignTransportTask = async (input: IAssignTransportInput) => {
  const { taskId, vehicleNumber, driverName, driverPhone, destinationWarehouse, logisticsUser } = input;

  const task = await TransportTask.findById(taskId);
  if (!task) {
    throw new Error('Transport task not found');
  }

  task.vehicleNumber = vehicleNumber.trim().toUpperCase();
  task.driverName = driverName.trim();
  if (driverPhone) {
    task.driverPhone = driverPhone.trim();
  }
  if (destinationWarehouse && destinationWarehouse.trim()) {
    task.destinationWarehouse = destinationWarehouse.trim();
  }
  task.logisticsUserId = logisticsUser._id;
  task.status = 'ASSIGNED';
  await task.save();

  await logAuditAction({
    actorId: logisticsUser._id,
    actorName: logisticsUser.name,
    actorRole: logisticsUser.role,
    action: 'ASSIGNED_TRANSPORT',
    entityType: 'TRANSPORT',
    entityId: task._id.toString(),
    metadata: { vehicleNumber: task.vehicleNumber, driverName: task.driverName },
  });

  broadcastLogisticsUpdate(task);
  return task;
};

export const updateTransportTaskStatus = async (
  taskId: string,
  status: TransportStatus,
  logisticsUser: any,
  notes?: string
) => {
  const task = await TransportTask.findById(taskId).populate('centreId');
  if (!task) {
    throw new Error('Transport task not found');
  }

  task.status = status;
  if (notes) task.notes = notes;

  if (status === 'PICKED_UP' || status === 'IN_TRANSIT') {
    task.pickupTime = task.pickupTime || new Date();
  }
  if (status === 'DELIVERED' || status === 'COMPLETED') {
    task.deliveryTime = new Date();
  }

  await task.save();

  await logAuditAction({
    actorId: logisticsUser._id,
    actorName: logisticsUser.name,
    actorRole: logisticsUser.role,
    action: `UPDATED_TRANSPORT_STATUS_${status}`,
    entityType: 'TRANSPORT',
    entityId: task._id.toString(),
    metadata: { status, vehicleNumber: task.vehicleNumber },
  });

  broadcastLogisticsUpdate(task);
  return task;
};
