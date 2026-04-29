import { apiClient } from './apiClient';
import type { User, Vehicle, Station, Trip, Review, DashboardStats } from '../types';

export const api = {
  // Vehicles
  getVehicles: async (): Promise<Vehicle[]> => {
    // MOCK API matching BE DTO: id, name, code, type, imageUrl, status, pricePerMinutes, stationId
    return [
      { id: 'v1', name: 'Xe đạp VNGo 01', code: 'VNGO-B01', type: 'Xe đạp', status: 'AVAILABLE', imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format', pricePerMinutes: 200, stationId: '11111111-1111-1111-1111-111111111111' },
      { id: 'v2', name: 'Xe đạp điện VNGo E01', code: 'VNGO-E01', type: 'Xe đạp điện', status: 'RENTED', imageUrl: 'https://images.unsplash.com/photo-1572295727871-7638149ea3d7?w=500&auto=format', pricePerMinutes: 500, stationId: '22222222-2222-2222-2222-222222222222' },
    ];
  },
  getVehicleById: async (id: string): Promise<Vehicle | undefined> => {
    try {
      const { data } = await apiClient.get<Vehicle>(`/vehicle/${id}`);
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) return undefined;
      throw error;
    }
  },
  getVehicleByCode: async (code: string): Promise<Vehicle | undefined> => {
    try {
      const { data } = await apiClient.get<Vehicle>(`/vehicle/code/${code}`);
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) return undefined;
      throw error;
    }
  },

  // Stations
  getStations: async (): Promise<Station[]> => {
    // MOCK API matching BE DTO: id, name, latitude, longitude, capacity, currentVehicleCount
    return [
      { id: '11111111-1111-1111-1111-111111111111', name: 'Trạm 1 - Hàm Nghi', latitude: 10.7715, longitude: 106.6908, capacity: 20, currentVehicleCount: 5, address: '10 Hàm Nghi - Phường Bến Nghé - Quận 1' },
      { id: '22222222-2222-2222-2222-222222222222', name: 'Trạm 2 - Nguyễn Huệ', latitude: 10.7730, longitude: 106.6925, capacity: 15, currentVehicleCount: 10, address: '1 Nguyễn Huệ - Phường Bến Nghé - Quận 1' },
      { id: '33333333-3333-3333-3333-333333333333', name: 'Trạm 3 - Thảo Cầm Viên', latitude: 10.7877, longitude: 106.7049, capacity: 30, currentVehicleCount: 12, address: '2 Nguyễn Bỉnh Khiêm - Phường Bến Nghé - Quận 1' },
      { id: '44444444-4444-4444-4444-444444444444', name: 'Trạm 4 - Công viên Tao Đàn', latitude: 10.7745, longitude: 106.6912, capacity: 25, currentVehicleCount: 8, address: 'Công viên Tao Đàn - Trương Định - Phường Bến Thành' },
    ];
  },

  // Pricings
  getPricings: async (): Promise<any[]> => {
    try {
      const { data } = await apiClient.get<any[]>('/pricing');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  // Users
  getUserProfile: async (id: string): Promise<User | undefined> => {
    try {
      const { data } = await apiClient.get<User>(`/user/${id}`);
      return data;
    } catch {
      return undefined;
    }
  },

  updateUserProfile: async (_userId: string, profileData: any): Promise<void> => {
    await apiClient.put(`/user`, profileData);
  },

  // Trips & Booking
  getUserTrips: async (userId: string): Promise<Trip[]> => {
    try {
      const { data } = await apiClient.get<Trip[]>(`/trip/user/${userId}`);
      return data;
    } catch {
      return [];
    }
  },

  getTripById: async (tripId: string): Promise<Trip | undefined> => {
    try {
      const { data } = await apiClient.get<Trip>(`/trip/${tripId}`);
      return data;
    } catch {
      return undefined;
    }
  },

  createTrip: async (payload: {
    userId: string;
    vehicleId: string;
    startStationId?: string;
    endStationId?: string;
    pricingId?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<Trip> => {
    const { data } = await apiClient.post<Trip>('/trip/start', payload);
    return data;
  },

  returnVehicle: async (tripId: string, endStationId?: string): Promise<Trip> => {
    const { data } = await apiClient.put<Trip>(`/trip/${tripId}/end`, {}, {
      params: { endStationId }
    });
    return data;
  },

  // Reviews
  getVehicleReviews: async (vehicleId: string): Promise<Review[]> => {
    try {
      const { data } = await apiClient.get(`/vehicle/${vehicleId}/reviews`);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  // Admin / Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const { data } = await apiClient.get('/dashboard/stats');
      return data || { totalVehicles: 0, rentedVehicles: 0, totalRevenue: 0 };
    } catch {
      return { totalVehicles: 0, rentedVehicles: 0, totalRevenue: 0 };
    }
  }
};
