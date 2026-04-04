import React, { useState, useEffect } from 'react';
import { X, MapPin, Wallet, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import type { Trip, Station, Vehicle } from '../types';
import styles from './ReturnVehicleModal.module.css';

interface ReturnVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
  stations: Station[];
  vehicle: Vehicle | undefined;
}

export const ReturnVehicleModal: React.FC<ReturnVehicleModalProps> = ({ 
  isOpen, 
  onClose, 
  trip,
  stations,
  vehicle
}) => {
  const [selectedStationId, setSelectedStationId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentCost, setCurrentCost] = useState(0);

  useEffect(() => {
    if (isOpen && trip && vehicle) {
      // Calculate active cost initially
      const updateCost = () => {
        const start = new Date(trip.startTime).getTime();
        const end = new Date().getTime(); // Now
        const mins = Math.max(1, Math.floor((end - start) / 60000));
        const pricePerMin = vehicle?.priceSingle ? vehicle.priceSingle / 60 : 166;
        setCurrentCost(Math.round(mins * pricePerMin));
      };
      
      updateCost();
      const timer = setInterval(updateCost, 60000);
      return () => clearInterval(timer);
    }
  }, [isOpen, trip, vehicle]);

  if (!isOpen || !trip) return null;

  const handleSubmit = async () => {
    if (!selectedStationId) {
      setError('Vui lòng chọn trạm trả xe.');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      await api.returnVehicle(trip.id, selectedStationId);
      window.dispatchEvent(new Event('trip-updated'));
      onClose();
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi thanh toán.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const currentBalance = currentUser ? parseInt(localStorage.getItem(`vngo_wallet_balance_${currentUser.id || 'u1'}`) || '0', 10) : 0;
  const isInsufficient = currentBalance < currentCost;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div style={{ width: 24 }}></div>
          <h2 className={styles.title}>Thanh toán & Trả xe</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span>Mã chuyến:</span>
              <strong>#{trip.id}</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Biển số / Mã xe:</span>
              <strong>{vehicle?.code}</strong>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <MapPin size={18} color="var(--color-primary)" /> Trạm trả xe
            </label>
            <select 
              className={styles.select} 
              value={selectedStationId} 
              onChange={(e) => setSelectedStationId(e.target.value)}
            >
              <option value="" disabled>-- Chọn trạm gần nhất --</option>
              {stations.map(s => (
                <option key={s.id} value={s.id}>{s.id} - {s.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.summaryBox}>
            <div className={styles.summaryRow}>
              <span>Tổng thời gian:</span>
              <strong>
                {Math.max(1, Math.floor((new Date().getTime() - new Date(trip.startTime).getTime()) / 60000))} phút
              </strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Đơn giá:</span>
              <strong>{vehicle?.priceSingle ? Math.round(vehicle.priceSingle / 60) : 0} đ/phút</strong>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.summaryRow} style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>
              <span>Tổng chi phí:</span>
              <strong>{new Intl.NumberFormat('vi-VN').format(currentCost)} VNĐ</strong>
            </div>
          </div>

          <div className={styles.balanceBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wallet size={20} color={isInsufficient ? "var(--color-error)" : "var(--color-success)"} />
              <span>Số dư VNGo hiện tại:</span>
            </div>
            <strong style={{ color: isInsufficient ? 'var(--color-error)' : 'inherit' }}>
              {new Intl.NumberFormat('vi-VN').format(currentBalance)} VNĐ
            </strong>
          </div>

          {error && (
            <div className={styles.errorBox}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          
          {isInsufficient && !error && (
            <div className={styles.errorBox} style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', color: '#d97706', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
              <AlertCircle size={18} />
              <span>Số dư không đủ. Phần còn thiếu sẽ được ghi vào nợ cước.</span>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button 
            className={styles.submitBtn} 
            onClick={handleSubmit}
            disabled={isSubmitting || selectedStationId === ''}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
          </button>
        </div>
      </div>
    </div>
  );
};
