import axios from 'axios';
import type { User, Vehicle, Station, Trip, Review, DashboardStats } from '../types';

// Connect exactly to the user's real backend
const apiClient = axios.create({
  baseURL: 'https://api.anhchuno.id.vn',
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

import { mockVehicles, mockTrips } from './mockData';

const getLocalVehicles = () => {
    const saved = localStorage.getItem('vehicles_v4');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('vehicles_v4', JSON.stringify(mockVehicles));
    return mockVehicles;
};

const getLocalTrips = () => {
    const saved = localStorage.getItem('trips_v3');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('trips_v3', JSON.stringify(mockTrips));
    return mockTrips;
};

export const api = {
  //login
  login: async (payload: any) => {
    const res = await apiClient.post('/auth/login', payload);
    return res.data;
  },
  //register
  register: async (payload: any) => {
    const res = await apiClient.post('/auth/register', payload);
    return res.data;
  },
  // Vehicles
  getVehicles: async (): Promise<Vehicle[]> => {
    return getLocalVehicles();
  },
  getVehicleById: async (id: string): Promise<Vehicle | undefined> => {
    return getLocalVehicles().find((v: any) => v.id === id);
  },

  // Stations
  getStations: async (): Promise<Station[]> => {
    const saved = localStorage.getItem('stations_v1');
    if (saved) {
      return JSON.parse(saved);
    }
    try {
      const response = await apiClient.get('/stations');
      if (response.data && response.data.length > 0) {
        localStorage.setItem('stations_v1', JSON.stringify(response.data));
        return response.data;
      }
      throw new Error();
    } catch {
      const { MOCK_STATIONS } = await import('../utils/stations');
      const mapped = MOCK_STATIONS.map((s: any) => ({
        ...s,
        vehicleCapacity: 20,
        currentVehicleCount: s.id === '001' ? 4 : 0
      }));
      localStorage.setItem('stations_v1', JSON.stringify(mapped));
      return mapped;
    }
  },

  // Users
  getUserProfile: async (id: string): Promise<User | undefined> => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch {
      return undefined;
    }
  },

  // Trips & Booking
  getUserTrips: async (userId: string): Promise<Trip[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getLocalTrips().filter((t: any) => t.userId === userId));
      }, 400); // Simulate network latency
    });
  },
  createBooking: async (tripData: Partial<Trip>): Promise<Trip> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTrip: Trip = {
          id: 't' + Date.now(),
          startTime: tripData.startTime || new Date().toISOString(),
          endTime: tripData.endTime || new Date().toISOString(),
          distance: tripData.distance || 0,
          totalCost: tripData.totalCost || 0,
          status: 'ONGOING',
          startStationId: tripData.startStationId || 's1',
          endStationId: tripData.endStationId || 's1',
          vehicleId: tripData.vehicleId || 'v1',
          userId: tripData.userId || 'u1'
        };
        const trips = getLocalTrips();
        trips.unshift(newTrip); // Add new trip to the top
        localStorage.setItem('trips_v3', JSON.stringify(trips));
        
        // UPDATE VEHICLE STATUS TO RENTED
        const vehicles = getLocalVehicles();
        const vIndex = vehicles.findIndex((v: any) => v.id === tripData.vehicleId);
        if (vIndex !== -1) {
            vehicles[vIndex].status = 'RENTED';
            localStorage.setItem('vehicles_v4', JSON.stringify(vehicles));
        }

        resolve(newTrip);
      }, 600);
    });
  },
  createTrip: async (code: string, userId: string): Promise<Trip> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const vehicles = getLocalVehicles();
        const vehicle = vehicles.find((v: any) => v.code.toUpperCase() === code.toUpperCase() || v.id === code);
        
        if (!vehicle) {
          return reject(new Error('Mã xe không tồn tại hoặc không hợp lệ.'));
        }
        if (vehicle.status !== 'AVAILABLE') {
          return reject(new Error('Xe này hiện không sẵn sàng để thuê.'));
        }

        const balanceStr = localStorage.getItem(`vngo_wallet_balance_${userId}`);
        const balance = balanceStr ? parseInt(balanceStr, 10) : 0;
        
        if (vehicle.type === 'Xe đạp điện' && balance < 30000) {
          return reject(new Error('Tài khoản không đủ 30.000đ, hãy nạp thêm.'));
        } else if (balance < 15000) {
          return reject(new Error('Tài khoản không đủ 15.000đ, hãy nạp thêm.'));
        }
        
        // Create trip
        const newTrip: Trip = {
          id: 't' + Date.now().toString().substring(5),
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(), // Will update when finished
          distance: 0,
          totalCost: 0,
          status: 'ONGOING',
          startStationId: vehicle.stationId || '001',
          endStationId: vehicle.stationId || '001',
          vehicleId: vehicle.id,
          userId: userId
        };
        
        const trips = getLocalTrips();
        trips.unshift(newTrip);
        localStorage.setItem('trips_v3', JSON.stringify(trips));
        
        // Update vehicle status
        vehicle.status = 'RENTED';
        localStorage.setItem('vehicles_v4', JSON.stringify(vehicles));
        
        window.dispatchEvent(new Event('vehicle-updated'));
        
        resolve(newTrip);
      }, 500);
    });
  },

  returnVehicle: async (tripId: string, endStationId: string): Promise<Trip> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const trips = getLocalTrips();
        const tIndex = trips.findIndex((t: any) => t.id === tripId);
        if (tIndex === -1) return reject(new Error('Chuyến đi không tồn tại'));
        
        const trip = trips[tIndex];
        const vehicles = getLocalVehicles();
        const vIndex = vehicles.findIndex((v: any) => v.id === trip.vehicleId);
        if (vIndex === -1) return reject(new Error('Lỗi dữ liệu phương tiện'));
        
        trip.endTime = new Date().toISOString();
        const start = new Date(trip.startTime).getTime();
        const end = new Date(trip.endTime).getTime();
        const mins = Math.max(1, Math.floor((end - start) / 60000));
        
        const pricePerMin = vehicles[vIndex].priceSingle / 60;
        const total = Math.round(mins * pricePerMin);
        
        const balanceStr = localStorage.getItem(`vngo_wallet_balance_${trip.userId}`);
        const balance = balanceStr ? parseInt(balanceStr, 10) : 0;
        
        let newBalance = balance;
        if (balance < total) {
          const debtStr = localStorage.getItem(`vngo_wallet_debt_${trip.userId}`);
          const debt = debtStr ? parseInt(debtStr, 10) : 0;
          const remainingToPay = total - balance;
          localStorage.setItem(`vngo_wallet_debt_${trip.userId}`, (debt + remainingToPay).toString());
          newBalance = 0;
        } else {
          newBalance = balance - total;
        }
        
        trip.totalCost = total;
        trip.status = 'COMPLETED';
        trip.endStationId = endStationId;
        
        localStorage.setItem('trips_v3', JSON.stringify(trips));
        
        vehicles[vIndex].status = 'AVAILABLE';
        vehicles[vIndex].stationId = endStationId;
        localStorage.setItem('vehicles_v4', JSON.stringify(vehicles));
        
        localStorage.setItem(`vngo_wallet_balance_${trip.userId}`, newBalance.toString());
        window.dispatchEvent(new Event('wallet-updated'));
        window.dispatchEvent(new Event('vehicle-updated'));
        
        resolve(trip);
      }, 500);
    });
  },

  // Reviews
  getVehicleReviews: async (vehicleId: string): Promise<Review[]> => {
    try {
       const response = await apiClient.get(`/vehicles/${vehicleId}/reviews`);
       return response.data || [];
    } catch {
       return [];
    }
  },

  // Admin / Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await apiClient.get('/dashboard/stats');
      return response.data || { totalVehicles: 0, rentedVehicles: 0, totalRevenue: 0 };
    } catch {
      return { totalVehicles: 0, rentedVehicles: 0, totalRevenue: 0 };
    }
  },

  // Users
  updateUserProfile: async (_userId: string, data: any): Promise<void> => {
    const saved = localStorage.getItem('user');
    if (saved) {
      const user = JSON.parse(saved);
      const oldEmail = user.email;
      const updatedUser = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const userIndex = users.findIndex((u: any) => u.email === oldEmail);
        if (userIndex !== -1) {
            if (data.name) {
                const nameParts = data.name.split(' ');
                users[userIndex].firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : data.name;
                users[userIndex].lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
            }
            if (data.email) users[userIndex].email = data.email;
            if (data.phone) users[userIndex].phone = data.phone;
            if (data.avatarUrl) users[userIndex].avatarUrl = data.avatarUrl;
            
            localStorage.setItem('users', JSON.stringify(users));
            window.dispatchEvent(new Event('users-list-updated'));
        }
      }

      setTimeout(() => window.dispatchEvent(new Event('user-auth-change')), 100);
    }
  }
};
