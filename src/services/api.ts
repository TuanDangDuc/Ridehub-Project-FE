import { apiClient } from './apiClient';
import type { User, Vehicle, Station, Trip, Review, DashboardStats } from '../types';

export const api = {
  // Vehicles
  getVehicles: async (): Promise<Vehicle[]> => {
    try {
      const { data } = await apiClient.get<Vehicle[]>('/vehicle');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
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

      return Array.isArray(data) ? data : [];
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
  getPricingById: async (id: string): Promise<any> => {
    try {
      const { data } = await apiClient.get<any>(`/pricing/${id}`);
      return data;
    } catch {
      return undefined;
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

  getUserBalance: async (id: string): Promise<number> => {
    const { data } = await apiClient.get<number>(`/user/balance/${id}`);
    return data;
  },

  minusUserBalance: async (id: string, amount: number): Promise<void> => {
    await apiClient.patch(`/user/${id}/minusBalance/${amount}`);
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
