import { apiClient } from './apiClient';
import type { Vehicle } from '../types';

export const vehicleService = {
  getAll: async (): Promise<Vehicle[]> => {
    // MOCK API matching BE DTO: id, name, code, type, imageUrl, status, pricePerMinutes, stationId
    return [
      { id: 'v1', name: 'Xe đạp Ridehub 01', code: 'RH-B01', type: 'Xe đạp', status: 'AVAILABLE', imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format', pricePerMinutes: 200, stationId: '11111111-1111-1111-1111-111111111111' },
      { id: 'v2', name: 'Xe đạp điện Ridehub E01', code: 'RH-E01', type: 'Xe đạp điện', status: 'RENTED', imageUrl: 'https://images.unsplash.com/photo-1572295727871-7638149ea3d7?w=500&auto=format', pricePerMinutes: 500, stationId: '22222222-2222-2222-2222-222222222222' },
    ];
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
