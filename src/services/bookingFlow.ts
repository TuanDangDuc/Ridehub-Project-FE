import { api } from './api';
import { vehicleService } from './vehicle';

export const bookingFlow = {
  /**
   * Gọi khi người dùng nhập mã Code hoặc quét mã QR thành công và chốt đặt xe.
   * Chạy luồng: createTrip -> updateVehicleStatus(IN_USE)
   */
  handleBookVehicle: async (payload: {
    userId: string;
    vehicleId: string;
    startStationId: string;
    endStationId: string;
    pricingId: string;
    latitude?: number;
    longitude?: number;
  }) => {
    try {
      // 1. Khởi tạo chuyến đi (Bắt đầu tính giờ/tính phí)
      const trip = await api.createTrip(payload);
      
      // 2. Cập nhật trạng thái xe thành IN_USE (Khóa xe)
      await vehicleService.updateStatus(payload.vehicleId, 'IN_USE');
      
      return trip;
    } catch (error) {
      console.error("Lỗi trong quá trình Đặt xe: ", error);
      throw error;
    }
  },

  /**
   * Gọi khi người dùng bấm nút Kết thúc chuyến đi (Trả xe).
   * Chạy luồng: endTrip -> updateVehicleStatus(AVAILABLE)
   */
  handleEndTrip: async (tripId: string, vehicleId: string) => {
    try {
      // 1. Kết thúc chuyến đi (Tính tiền, chốt giờ)
      const trip = await api.returnVehicle(tripId);
      
      // 2. Trả trạng thái xe về AVAILABLE (Sẵn sàng phục vụ)
      await vehicleService.updateStatus(vehicleId, 'AVAILABLE');
      
      return trip;
    } catch (error) {
      console.error("Lỗi trong quá trình Trả xe: ", error);
      throw error;
    }
  }
};
