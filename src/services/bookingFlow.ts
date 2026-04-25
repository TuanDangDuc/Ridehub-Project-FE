import { api } from './api';

export const bookingFlow = {
  /**
   * Gọi khi người dùng nhập mã Code hoặc quét mã QR thành công và chốt đặt xe.
   * Chạy luồng: createTrip (Backend sẽ tự động chuyển trạng thái xe sang IN_USE)
   */
  handleBookVehicle: async (payload: {
    userId: string;
    vehicleId: string;
    startStationId?: string;
    endStationId?: string;
    pricingId?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    try {
      // 1. Khởi tạo chuyến đi (Backend tự tính giờ/tính phí và khóa xe IN_USE)
      const trip = await api.createTrip(payload);
      
      return trip;
    } catch (error) {
      console.error("Lỗi trong quá trình Đặt xe: ", error);
      throw error;
    }
  },

  /**
   * Gọi khi người dùng bấm nút Kết thúc chuyến đi (Trả xe).
   * Chạy luồng: endTrip (Backend sẽ tự động chuyển trạng thái xe sang AVAILABLE)
   */
  handleEndTrip: async (tripId: string, endStationId?: string) => {
    try {
      // 1. Kết thúc chuyến đi (Backend chốt giờ, tính tiền, và trả xe về AVAILABLE)
      const trip = await api.returnVehicle(tripId, endStationId);
      
      return trip;
    } catch (error) {
      console.error("Lỗi trong quá trình Trả xe: ", error);
      throw error;
    }
  }
};
