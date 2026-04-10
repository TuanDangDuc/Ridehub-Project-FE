import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Trip, Station, Vehicle } from '../types';
import { Spinner } from '../components/Spinner';
import { ReturnVehicleModal } from '../components/ReturnVehicleModal';
import { Button } from '../components/Button';
import { CalendarX } from 'lucide-react';
import styles from './MyBookings.module.css';

const MyBookings: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [returningTripId, setReturningTripId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [, setTick] = useState(0);

  // Force re-render every second for ONGOING trips
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const getDurationString = (start: string, end: string, status: string) => {
    const startDate = new Date(start);
    const endDate = status === 'ONGOING' ? new Date() : new Date(end);
    const diffMs = Math.max(0, endDate.getTime() - startDate.getTime());
    
    const diffSecsTotal = Math.floor(diffMs / 1000);
    const secs = diffSecsTotal % 60;
    const diffMins = Math.floor(diffSecsTotal / 60);
    
    if (diffMins < 60) return `${diffMins} phút ${secs} giây`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours} giờ ${mins > 0 ? mins + ' phút ' : ''}${secs} giây`;
  };

  useEffect(() => {
    const checkUserAndFetchTrips = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }
      
      try {
        const [userTrips, allVehicles, allStations] = await Promise.all([
          api.getUserTrips('u1'),
          api.getVehicles(),
          api.getStations()
        ]);
        setTrips(userTrips);
        setVehicles(allVehicles);
        setStations(allStations);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    checkUserAndFetchTrips();

    window.addEventListener('trip-updated', checkUserAndFetchTrips);
    return () => {
      window.removeEventListener('trip-updated', checkUserAndFetchTrips);
    };
  }, []);



  if (loading) return <div className="container mt-8 text-center"><Spinner size="lg" /></div>;

  if (!isLoggedIn) {
    return (
      <div className="container mt-8 mb-8">
        <h1 className={styles.pageTitle}>Quản lý chuyến đi</h1>
        <div className={styles.emptyState}>
          <CalendarX size={72} color="var(--color-primary)" style={{ opacity: 0.8, marginBottom: '1.5rem' }} />
          <h3>Vui lòng đăng nhập</h3>
          <p>Bạn cần đăng nhập để xem thông tin các chuyến đi của mình.</p>
          <Button onClick={() => window.location.href='/login'}>Đăng nhập ngay</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-8 mb-8">
      <h1 className={styles.pageTitle}>Quản lý chuyến đi</h1>
      
      {trips.length === 0 ? (
        <div className={styles.emptyState}>
          <CalendarX size={72} color="var(--color-primary)" style={{ opacity: 0.8, marginBottom: '1.5rem' }} />
          <h3>Bạn chưa có chuyến đi nào</h3>
          <p>Hàng ngàn chiếc xe đang chờ bạn khám phá. Bắt đầu ngay!</p>
          <Button onClick={() => window.location.href='/vehicles'}>Thuê xe ngay</Button>
        </div>
      ) : (
        <div className={styles.tripList}>
          {trips.map(trip => (
            <div key={trip.id} className={styles.tripCard}>
              <div className={styles.tripHeader}>
                <div className={styles.tripId}>Mã chuyến: #{trip.id}</div>
                <div className={styles.statusBadge} data-status={trip.status}>
                  {trip.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang diễn ra'}
                </div>
              </div>
              
              <div className={styles.tripBody}>
                <div className={styles.routeInfo}>
                  <div className={styles.routeItem}>
                    <strong>Nhận xe</strong>
                    <span>{new Date(trip.startTime).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className={styles.routeLine}></div>
                  <div className={styles.routeItem}>
                    <strong>Trả xe</strong>
                    <span>{trip.status === 'ONGOING' ? 'Chưa trả xe' : new Date(trip.endTime).toLocaleString('vi-VN')}</span>
                  </div>
                </div>

                <div className={styles.tripStats}>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Thời gian thuê</span>
                    <strong className={styles.statValue} style={{ color: trip.status === 'ONGOING' ? '#d97706' : 'inherit' }}>
                      {getDurationString(trip.startTime, trip.endTime, trip.status)}
                    </strong>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Tổng chi phí</span>
                    <strong className={styles.statValue}>
                      {trip.status === 'ONGOING' 
                        ? <span style={{ color: '#d97706' }}>Đang tính...</span> 
                        : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(trip.totalCost)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className={styles.tripFooter}>
                <Button variant="outline" size="sm" onClick={() => setExpandedTripId(expandedTripId === trip.id ? null : trip.id)}>
                  {expandedTripId === trip.id ? 'Thu gọn hóa đơn' : 'Xem chi tiết hóa đơn'}
                </Button>
                {trip.status === 'ONGOING' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button variant="primary" size="sm" onClick={() => setReturningTripId(trip.id)}>Trả xe</Button>
                  </div>
                )}
              </div>
              
              {expandedTripId === trip.id && (() => {
                const vehicle = vehicles.find(v => v.id === trip.vehicleId);
                const startStation = stations.find(s => s.id === trip.startStationId);
                const pricePerMin = vehicle?.priceSingle ? Math.round(vehicle.priceSingle / 60) : 0;
                
                return (
                  <div className={styles.invoiceDetail}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Thông tin chuyến đi</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.95rem' }}>
                      <p><strong>Mã số xe:</strong> {vehicle?.code || 'Không xác định'}</p>
                      <p><strong>Giá thuê mỗi phút:</strong> {pricePerMin} đ/phút</p>
                      <p><strong>Nhận xe:</strong> {new Date(trip.startTime).toLocaleString('vi-VN')} tại {startStation ? startStation.name : 'Trạm không xác định'}</p>
                      <p>
                        <strong>Trả xe:</strong> {trip.status === 'ONGOING' ? <span style={{ color: '#d97706', fontWeight: 600 }}>Chưa trả xe (Thời gian đang tính)</span> : `${new Date(trip.endTime).toLocaleString('vi-VN')} tại ${stations.find(s => s.id === trip.endStationId)?.name || 'Trạm VNGo'}`}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      )}

      <ReturnVehicleModal
        isOpen={!!returningTripId}
        onClose={() => setReturningTripId(null)}
        trip={trips.find(t => t.id === returningTripId) || null}
        stations={stations}
        vehicle={vehicles.find(v => v.id === trips.find(t => t.id === returningTripId)?.vehicleId)}
      />
    </div>
  );
};

export default MyBookings;
