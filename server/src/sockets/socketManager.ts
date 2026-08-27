import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { ENV } from '../config/env.js';

let ioInstance: SocketIOServer | null = null;

export const initSocketIO = (httpServer: HttpServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join specific room for a user (for private alerts, SMS simulator, token callouts)
    socket.on('join_user_room', (userId: string) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined user room: user_${userId}`);
      }
    });

    // Join specific procurement centre room (for live token queue updates, digital signboards)
    socket.on('join_centre_room', (centreId: string) => {
      if (centreId) {
        socket.join(`centre_${centreId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined centre room: centre_${centreId}`);
      }
    });

    socket.on('leave_centre_room', (centreId: string) => {
      if (centreId) {
        socket.leave(`centre_${centreId}`);
        console.log(`[Socket.IO] Socket ${socket.id} left centre room: centre_${centreId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  ioInstance = io;
  return io;
};

export const getIO = (): SocketIOServer | null => {
  return ioInstance;
};

export const broadcastQueueUpdate = (centreId: string, queueData: any): void => {
  if (ioInstance) {
    ioInstance.to(`centre_${centreId}`).emit('QUEUE_UPDATED', queueData);
  }
};

export const emitToUser = (userId: string, event: string, payload: any): void => {
  if (ioInstance) {
    ioInstance.to(`user_${userId}`).emit(event, payload);
  }
};

export const broadcastLogisticsUpdate = (taskData: any): void => {
  if (ioInstance) {
    ioInstance.emit('LOGISTICS_UPDATED', taskData);
  }
};

export const broadcastSlotUpdate = (centreId: string, slotData: any): void => {
  if (ioInstance) {
    ioInstance.to(`centre_${centreId}`).emit('SLOT_UPDATED', slotData);
  }
};
