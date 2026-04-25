import { apiClient } from './apiClient';
import type { User, Vehicle, Station, Trip, Review, DashboardStats } from '../types';

export const api = {
  // Vehicles
  getVehicles: async (): Promise<Vehicle[]> => {
    const { data } = await apiClient.get<Vehicle[]>('/vehicle');
    return data;
  },
  getVehicleById: async (id: string): Promise<Vehicle | undefined> => {
    const { data } = await apiClient.get<Vehicle>(`/vehicle/${id}`);
    return data;
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
      return data;
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

  updateUserProfile: async (userId: string, profileData: any): Promise<void> => {
    await apiClient.put(`/user`, { ...profileData, id: userId });
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

  createBooking: async (tripData: Partial<Trip>): Promise<Trip> => {
    // Assuming backend endpoint to create a trip mapping
    const { data } = await apiClient.post<Trip>('/trip', tripData);
    return data;
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
      return data || [];
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
