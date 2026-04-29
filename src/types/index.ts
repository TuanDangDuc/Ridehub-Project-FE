export type Role = 'USER' | 'ADMIN';


export interface User {
  id: string;

  username: string;
  email: string;
  firstname: string;
  lastname: string;
  sex: string;
  dateOfBirth: string;
  identityNumber: string;
  avatarUrl: string;
  phoneNumber: string;
  role?: any;
  status: 'ACTIVE' | 'BANNED' | string;
  createdAt?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  code: string;
  type: string;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
  imageUrl?: string;
  pricePerMinutes?: number;
  stationId?: string;
  pricingId?: string;

  // FE extras (can keep for UI compatibility if needed, or remove)
  brand?: string;
  ownerName?: string;
  ownerAvatar?: string;
  rating?: number;
  images?: string[];
  features?: Record<string, boolean>;
  priceSingle?: number;
  priceDay?: number;
  priceWeek?: number;
}

export interface Trip {
  id: string;
  startTime: string;
  endTime: string;
  distance: number;
  totalCost: number;
  tripStatus: 'COMPLETED' | 'ONGOING' | 'CANCELLED';
  startStationId: string;
  endStationId: string;
  vehicleId: string;
  pricingId?: string;
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
  latitude: number;
  longitude: number;
  capacity: number;
  currentVehicleCount: number;
  // Extras for FE if needed
  address?: string;
  city?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface DashboardStats {
  totalVehicles: number;
  rentedVehicles: number;
  totalRevenue: number;
}
