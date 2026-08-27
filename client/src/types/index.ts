export type UserRole = 'FARMER' | 'STORAGE_AUTHORITY' | 'LOGISTICS' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface IUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface IFarmerProfile {
  _id: string;
  userId: string;
  farmerId: string;
  address: string;
  village: string;
  district: string;
  state: string;
  preferredLanguage: string;
  farmDetails: {
    landAreaAcres?: number;
    primaryCrops?: string[];
    bankAccountNumber?: string;
    bankIfsc?: string;
    aadhaarNumber?: string;
  };
}

export interface ILocation {
  lat: number;
  lng: number;
}

export interface IProcurementCentre {
  _id: string;
  name: string;
  centreCode: string;
  location: ILocation;
  address: string;
  district: string;
  state: string;
  pincode: string;
  capacityPerDay: number;
  currentServingToken?: string;
  currentServingBookingId?: string;
  operatingHours: { open: string; close: string };
  supportedCrops: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  contactPhone: string;
  distanceKm?: number;
}

export interface ISlot {
  _id: string;
  centreId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  remainingCapacity: number;
  status: 'AVAILABLE' | 'FULL' | 'CLOSED' | 'COMPLETED' | 'CANCELLED';
}

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

export interface IBooking {
  _id: string;
  bookingId: string;
  farmerId: IUser;
  centreId: IProcurementCentre;
  slotId: ISlot;
  cropType: string;
  requestedQuantity: number;
  unit: string;
  tokenNumber: string;
  tokenSequence: number;
  queuePosition: number;
  status: BookingStatus;
  bookingSource: 'WEB' | 'SMS' | 'USSD';
  scheduledDate: string;
  arrivedAt?: string;
  calledAt?: string;
  completedAt?: string;
  cancellationReason?: string;
  createdAt: string;
}

export interface IProcurement {
  _id: string;
  bookingId: IBooking;
  farmerId: IUser;
  centreId: IProcurementCentre;
  authorityId: IUser;
  cropType: string;
  expectedQuantity: number;
  actualQuantity: number;
  unit: string;
  qualityGrade: 'Grade A' | 'Grade B' | 'Grade C' | 'FAQ';
  moisturePercent: number;
  mspPricePerQuintal: number;
  totalPayout: number;
  digitalSlipNumber: string;
  status: 'PENDING' | 'VERIFIED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  rejectionReason?: string;
  timestamp: string;
}

export type TransportStatus =
  | 'READY_FOR_PICKUP'
  | 'ASSIGNED'
  | 'PICKUP_IN_PROGRESS'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ITransportTask {
  _id: string;
  procurementId: IProcurement;
  farmerId?: IUser;
  centreId: IProcurementCentre;
  destinationWarehouse: string;
  cropType: string;
  quantity: number;
  unit: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  logisticsUserId?: IUser;
  status: TransportStatus;
  pickupTime?: string;
  deliveryTime?: string;
  notes?: string;
  createdAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  channel: 'WEB' | 'SMS' | 'USSD';
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface IAuditLog {
  _id: string;
  actorId?: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface ILiveQueueSummary {
  centreId: string;
  centreName: string;
  centreCode: string;
  date: string;
  currentServingToken: string;
  currentProcessingBooking: IBooking | null;
  totalBookedToday: number;
  arrivedCount: number;
  waitingInQueueCount: number;
  completedCount: number;
  noShowCount: number;
  upcomingCount: number;
  activeQueue: Array<{
    bookingId: string;
    tokenNumber: string;
    farmer: IUser;
    cropType: string;
    requestedQuantity: number;
    unit: string;
    slot: ISlot;
    status: BookingStatus;
    arrivedAt?: string;
    queuePosition: number;
    estimatedWaitMinutes: number;
  }>;
  upcomingScheduled: IBooking[];
  completedToday: IBooking[];
  noShows: IBooking[];
  waitlisted: IBooking[];
}
