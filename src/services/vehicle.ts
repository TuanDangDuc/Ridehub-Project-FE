import { apiClient } from './apiClient';
import type { Vehicle } from '../types';

export const vehicleService = {
  getAll: async (): Promise<Vehicle[]> => {
    const { data } = await apiClient.get<Vehicle[]>('/vehicle');
    return data;
  },
  
  getById: async (id: string): Promise<Vehicle> => {
    const { data } = await apiClient.get<Vehicle>(`/vehicle/${id}`);
    return data;
  },

  getByCode: async (code: string): Promise<Vehicle> => {
    const { data } = await apiClient.get<Vehicle>(`/vehicle/code/${code}`);
    return data;
  },

  addVehicle: async (payload: any) => {
    const { data } = await apiClient.post('/vehicle', payload);
    return data;
  },

  updateStatus: async (id: string, status: string) => {
    const { data } = await apiClient.patch(`/vehicle/${id}/status?status=${status}`);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/vehicle/${id}`);
    return data;
  }
};
