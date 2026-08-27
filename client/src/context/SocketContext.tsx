import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { ILiveQueueSummary, INotification, ITransportTask } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinCentreQueue: (centreId: string) => void;
  leaveCentreQueue: (centreId: string) => void;
  latestQueueData: ILiveQueueSummary | null;
  latestNotification: INotification | null;
  latestLogisticsTask: ITransportTask | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode; userId?: string }> = ({
  children,
  userId,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latestQueueData, setLatestQueueData] = useState<ILiveQueueSummary | null>(null);
  const [latestNotification, setLatestNotification] = useState<INotification | null>(null);
  const [latestLogisticsTask, setLatestLogisticsTask] = useState<ITransportTask | null>(null);

  useEffect(() => {
    // Connect to server (VITE_API_URL for deployed link or origin for local proxy)
    const defaultDeployedBackend = 'https://kissan-queue.onrender.com';
    const socketOrigin =
      import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
      (import.meta.env.PROD ? defaultDeployedBackend : window.location.origin);

    const newSocket = io(socketOrigin, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('[Socket Context] Connected to ProcureX Socket server');
      setIsConnected(true);

      if (userId) {
        newSocket.emit('join_user_room', userId);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket Context] Disconnected from server');
      setIsConnected(false);
    });

    // Real-time Queue Updates
    newSocket.on('QUEUE_UPDATED', (queueData: ILiveQueueSummary) => {
      console.log('[Socket Event] Received QUEUE_UPDATED:', queueData.currentServingToken);
      setLatestQueueData(queueData);
    });

    // Real-time Push Notifications
    newSocket.on('NOTIFICATION_RECEIVED', (notification: INotification) => {
      console.log('[Socket Event] Received NOTIFICATION_RECEIVED:', notification.title);
      setLatestNotification(notification);

      // Play audio notification chime if supported
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.6;
        audio.play().catch(() => {});
      } catch (e) {}
    });

    // Real-time Logistics Updates
    newSocket.on('LOGISTICS_UPDATED', (task: ITransportTask) => {
      console.log('[Socket Event] Received LOGISTICS_UPDATED:', task.status);
      setLatestLogisticsTask(task);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  const joinCentreQueue = (centreId: string) => {
    if (socket && centreId) {
      socket.emit('join_centre_room', centreId);
      console.log(`[Socket] Subscribed to Mandi Room: centre_${centreId}`);
    }
  };

  const leaveCentreQueue = (centreId: string) => {
    if (socket && centreId) {
      socket.emit('leave_centre_room', centreId);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinCentreQueue,
        leaveCentreQueue,
        latestQueueData,
        latestNotification,
        latestLogisticsTask,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
