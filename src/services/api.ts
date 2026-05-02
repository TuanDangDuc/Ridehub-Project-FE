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
    try {
      const { data } = await apiClient.get<Station[]>('/station');
      return data;
    } catch {
      return [];
    }
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
  createPricing: async (pricePerMinutes: number): Promise<any> => {
    const { data } = await apiClient.post('/pricing', { pricePerMinutes });
    return data;
  },
  updatePricing: async (id: string, pricePerMinutes: number): Promise<void> => {
    await apiClient.put(`/pricing/${id}/pricePerMinutes`, null, { params: { pricePerMinutes } });
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
