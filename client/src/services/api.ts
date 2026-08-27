import axios from 'axios';
import {
  IUser,
  IProcurementCentre,
  ISlot,
  IBooking,
  IProcurement,
  ITransportTask,
  INotification,
  ILiveQueueSummary,
} from '../types';

const defaultDeployedBackend = 'https://kissan-queue.onrender.com';
const backendUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? defaultDeployedBackend : '');
const apiBase = backendUrl ? `${backendUrl.replace(/\/$/, '')}/api` : '/api';

const API = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token to all outgoing requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('procurex_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle session expiry
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clean up token if unauthorized or expired
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('procurex_token');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints (Production - No demo logins)
export const authApi = {
  login: (identifier: string, password: string) =>
    API.post<{ success: boolean; token: string; user: IUser; profile?: any; centre?: any }>('/auth/login', {
      identifier,
      password,
    }),
  register: (data: any) =>
    API.post<{ success: boolean; token: string; user: IUser; profile?: any }>('/auth/register', data),
  getMe: () =>
    API.get<{ success: boolean; user: IUser; profile?: any; centre?: any }>('/auth/me'),
};

// Centres Endpoints
export const centresApi = {
  getCentres: (params?: { lat?: number; lng?: number; district?: string; crop?: string }) =>
    API.get<{ success: boolean; count: number; data: IProcurementCentre[] }>('/centres', { params }),
  getCentreById: (id: string) =>
    API.get<{ success: boolean; data: IProcurementCentre }>(`/centres/${id}`),
  createCentre: (data: any) =>
    API.post<{ success: boolean; data: IProcurementCentre }>('/centres', data),
  updateCentre: (id: string, data: any) =>
    API.patch<{ success: boolean; data: IProcurementCentre }>(`/centres/${id}`, data),
};

// Slots Endpoints
export const slotsApi = {
  getSlots: (centreId: string, date?: string) =>
    API.get<{ success: boolean; count: number; date: string; data: ISlot[] }>(
      `/slots/centre/${centreId}`,
      { params: { date } }
    ),
  createSlot: (data: any) => API.post<{ success: boolean; data: ISlot }>('/slots', data),
  updateCapacity: (id: string, data: { capacity?: number; status?: string }) =>
    API.patch<{ success: boolean; data: ISlot }>(`/slots/${id}`, data),
};

// Bookings Endpoints
export const bookingsApi = {
  createBooking: (data: {
    centreId: string;
    slotId: string;
    cropType: string;
    requestedQuantity: number;
    unit?: string;
  }) => API.post<{ success: boolean; message: string; data: IBooking }>('/bookings', data),
  getMyBookings: () =>
    API.get<{ success: boolean; count: number; data: IBooking[] }>('/bookings/my'),
  getBookingById: (id: string) =>
    API.get<{ success: boolean; data: IBooking }>(`/bookings/${id}`),
  getBookingByToken: (tokenNumber: string) =>
    API.get<{ success: boolean; data: IBooking }>(`/bookings/token/${tokenNumber}`),
  cancelBooking: (id: string) =>
    API.patch<{ success: boolean; message: string; data: IBooking }>(`/bookings/${id}/cancel`),
  getCentreBookings: (centreId: string, date?: string) =>
    API.get<{ success: boolean; count: number; date: string; data: IBooking[] }>(
      `/bookings/centre/${centreId}`,
      { params: { date } }
    ),
};

// Live Queue Endpoints
export const queueApi = {
  getQueue: (centreId: string, date?: string) =>
    API.get<{ success: boolean; data: ILiveQueueSummary }>(`/queue/${centreId}`, {
      params: { date },
    }),
  callNext: (centreId: string) =>
    API.post<{ success: boolean; message: string; data: any }>(`/queue/${centreId}/next`),
  markArrived: (bookingId: string) =>
    API.post<{ success: boolean; message: string; data: any }>(`/queue/${bookingId}/arrived`),
  markNoShow: (bookingId: string) =>
    API.post<{ success: boolean; message: string; data: any }>(`/queue/${bookingId}/no-show`),
};

// Procurement Endpoints
export const procurementApi = {
  recordProcurement: (data: {
    bookingId: string;
    actualQuantity: number;
    qualityGrade?: string;
    moisturePercent?: number;
    mspPricePerQuintal?: number;
    notes?: string;
  }) => API.post<{ success: boolean; message: string; data: any }>('/procurement', data),
  getCentreProcurements: (centreId: string) =>
    API.get<{ success: boolean; count: number; data: IProcurement[] }>(
      `/procurement/centre/${centreId}`
    ),
  getMyProcurements: () =>
    API.get<{ success: boolean; count: number; data: IProcurement[] }>('/procurement/my'),
  getSlip: (slipNumber: string) =>
    API.get<{ success: boolean; data: IProcurement }>(`/procurement/slip/${slipNumber}`),
};

// Logistics Endpoints
export const logisticsApi = {
  getTasks: (params?: { status?: string; centreId?: string }) =>
    API.get<{ success: boolean; count: number; data: ITransportTask[] }>('/logistics/tasks', {
      params,
    }),
  assignTask: (
    id: string,
    data: { vehicleNumber: string; driverName: string; driverPhone?: string; destinationWarehouse?: string }
  ) => API.post<{ success: boolean; message: string; data: ITransportTask }>(`/logistics/tasks/${id}/assign`, data),
  updateStatus: (id: string, data: { status: string; notes?: string }) =>
    API.patch<{ success: boolean; message: string; data: ITransportTask }>(`/logistics/tasks/${id}/status`, data),
};

// Admin Endpoints
export const adminApi = {
  getStats: () => API.get<{ success: boolean; stats: any }>('/admin/stats'),
  getUsers: (params?: { role?: string; search?: string; page?: number; limit?: number }) =>
    API.get<{ success: boolean; count: number; total: number; page: number; totalPages: number; data: IUser[] }>(
      '/admin/users',
      { params }
    ),
  toggleUserStatus: (id: string, status: string) =>
    API.patch<{ success: boolean; message: string; data: IUser }>(`/admin/users/${id}/status`, {
      status,
    }),
  getAuditLogs: (params?: { page?: number; limit?: number }) =>
    API.get<{ success: boolean; count: number; total: number; page: number; totalPages: number; data: any[] }>(
      '/admin/audit-logs',
      { params }
    ),
};

// Notifications Endpoints
export const notificationsApi = {
  getMyNotifications: () =>
    API.get<{ success: boolean; count: number; unreadCount: number; data: INotification[] }>(
      '/notifications'
    ),
  markRead: (id: string) => API.patch<{ success: boolean; data: INotification }>(`/notifications/${id}/read`),
  markAllRead: () => API.patch<{ success: boolean; message: string }>('/notifications/read-all'),
};

// Farmer Endpoints
export const farmerApi = {
  getProfile: () => API.get<{ success: boolean; data: any; user: IUser }>('/farmers/profile'),
  updateProfile: (data: any) =>
    API.patch<{ success: boolean; message: string; data: any }>('/farmers/profile', data),
  getOverview: () => API.get<{ success: boolean; data: any }>('/farmers/overview'),
};

// SMS / USSD Simulators
export const simulatorApi = {
  sendSms: (fromPhone: string, messageText: string) =>
    API.post<{ reply: string; booking?: any }>('/sms/webhook', { fromPhone, messageText }),
  sendUssd: (sessionId: string, phoneNumber: string, text: string) =>
    API.post<{ response: string }>('/ussd/session', { sessionId, phoneNumber, text }),
};

export default API;
