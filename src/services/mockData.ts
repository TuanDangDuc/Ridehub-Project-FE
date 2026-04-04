import type { User, Vehicle, Trip, Review, DashboardStats } from '../types';

export const mockUsers: User[] = [
  {
    id: 'u1',
    userName: 'john_doe',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    avatarUrl: 'https://i.pravatar.cc/150?u=u1',
    role: 'USER',
    status: 'ACTIVE'
  },
  {
    id: 'a1',
    userName: 'admin_vngo',
    email: 'admin@vngo.vn',
    firstName: 'System',
    lastName: 'Admin',
    avatarUrl: 'https://i.pravatar.cc/150?u=a1',
    role: 'ADMIN',
    status: 'ACTIVE'
  }
];

export const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    name: 'VNGo E-Bike',
    code: 'TN-EBK-001',
    type: 'Xe đạp điện',
    status: 'AVAILABLE',
    batteryLevel: 85,
    priceSingle: 20000,
    priceDay: 100000,
    priceWeek: 300000,
    brand: 'VNGo',
    ownerName: 'VNGo HCM',
    ownerAvatar: 'https://i.pravatar.cc/150?u=vngo',
    rating: 4.8,
    images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800'],
    features: { 'GPS': true, 'Helmet': true, 'Insurance': true },
    stationId: '001'
  },
  {
    id: 'v2',
    name: 'VNGo City Bike',
    code: 'TN-CBK-203',
    type: 'Xe đạp',
    status: 'AVAILABLE',
    priceSingle: 10000,
    priceDay: 50000,
    priceWeek: 150000,
    brand: 'VNGo',
    ownerName: 'VNGo HCM',
    ownerAvatar: 'https://i.pravatar.cc/150?u=vngo',
    rating: 4.5,
    images: ['https://images.unsplash.com/photo-1579621970221-5a046205ed86?auto=format&fit=crop&q=80&w=800'],
    features: { 'Helmet': true, 'Insurance': false },
    stationId: '001'
  },
  {
    id: 'v3',
    name: 'VNGo Pro E-Bike',
    code: 'TN-PEB-012',
    type: 'Xe đạp điện',
    status: 'RENTED',
    batteryLevel: 42,
    priceSingle: 20000,
    priceDay: 100000,
    priceWeek: 300000,
    brand: 'VNGo',
    ownerName: 'VNGo Premium',
    ownerAvatar: 'https://i.pravatar.cc/150?u=vngo2',
    rating: 4.9,
    images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800'],
    features: { 'GPS': true, 'Helmet': true },
    stationId: '001'
  },
  {
    id: 'v4',
    name: 'VNGo City Bike Plus',
    code: 'TN-CBP-555',
    type: 'Xe đạp',
    status: 'AVAILABLE',
    priceSingle: 10000,
    priceDay: 50000,
    priceWeek: 150000,
    brand: 'VNGo',
    ownerName: 'Nguyen Van A',
    ownerAvatar: 'https://i.pravatar.cc/150?u=a2',
    rating: 4.6,
    images: ['https://images.unsplash.com/photo-1549317661-bc32c63f5001?auto=format&fit=crop&q=80&w=800'],
    features: { 'Helmet': true },
    stationId: '001'
  }
];

export const mockReviews: Review[] = [
  {
    id: 'r1',
    userId: 'u1',
    vehicleId: 'v1',
    content: 'Xe chạy êm, pin trâu, quy trình nhận xe nhanh chóng.',
    rating: 5
  },
  {
    id: 'r2',
    userId: 'u1',
    vehicleId: 'v4',
    content: 'Xe sạch sẽ, tuy nhiên điều hòa hơi yếu một chút.',
    rating: 4
  }
];

export const mockTrips: Trip[] = [
  {
    id: 't1',
    startTime: '2026-03-28T08:00:00Z',
    endTime: '2026-03-28T10:00:00Z',
    distance: 15.5,
    totalCost: 360000,
    status: 'COMPLETED',
    startStationId: 's1',
    endStationId: 's3',
    vehicleId: 'v1',
    userId: 'u1'
  }
];

export const mockDashboardStats: DashboardStats = {
  totalVehicles: 154,
  rentedVehicles: 42,
  totalRevenue: 25400000
};
