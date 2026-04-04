export type Role = 'USER' | 'ADMIN';
export type Status = 'ACTIVE' | 'BANNED' | 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';

export interface User {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  role: Role;
  status: 'ACTIVE' | 'BANNED';
}

export interface Vehicle {
  id: string;
  name: string;
  code: string;
  type: string; // e.g. 'Xe đạp', 'Xe đạp điện'
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
  batteryLevel?: number; // mostly for electric
  pricePerMinutes?: number; // legacy
  priceSingle?: number;
  priceDay?: number;
  priceWeek?: number;
  brand: string;
  ownerName: string;
  ownerAvatar: string;
  rating: number;
  // Extras
  images: string[];
  features: Record<string, boolean>;
  stationId?: string; // Where it is currently located
}

export interface Trip {
  id: string;
  startTime: string;
  endTime: string;
  distance: number;
  totalCost: number;
  status: 'COMPLETED' | 'ONGOING' | 'CANCELLED';
  startStationId: string;
  endStationId: string;
  vehicleId: string;
  userId: string;
}

export interface Review {
  id: string;
  userId: string;
  vehicleId: string;
  content: string;
  rating: number;
}

export interface Station {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  city: string;
  vehicleCapacity: number;
  currentVehicleCount: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface DashboardStats {
  totalVehicles: number;
  rentedVehicles: number;
  totalRevenue: number;
}
