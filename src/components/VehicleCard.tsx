import React from 'react';
import { Link } from 'react-router-dom';
import type { Vehicle } from '../types';
import { Star, Battery, Banknote } from 'lucide-react';
import styles from './VehicleCard.module.css';
import { Button } from './Button';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img
          src={vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : '/public/images/default-vehicle.png'}
          alt={vehicle.name}
          className={styles.image}
        />
        <div className={styles.statusBadge} data-status={vehicle.status}>
          {vehicle.status === 'AVAILABLE' ? 'Sẵn sàng' : vehicle.status === 'RENTED' ? 'Đang thuê' : 'Bảo trì'}
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{vehicle.name}</h3>
          <div className={styles.rating}>
            <Star size={16} fill="var(--color-warning)" color="var(--color-warning)" />
            <span>{vehicle.rating}</span>
          </div>
        </div>
        
        <p className={styles.type}>{vehicle.type} &bull; {vehicle.brand}</p>
        
        <div className={styles.details}>
          <div className={styles.detailItem}>
            <Banknote size={16} />
            <span>{formatPrice(Math.round((vehicle.priceSingle || (vehicle.type === 'Xe đạp điện' ? 20000 : 10000)) / 60))}/phút</span>
          </div>
          {vehicle.batteryLevel && (
            <div className={styles.detailItem}>
              <Battery size={16} />
              <span>{vehicle.batteryLevel}% Pin</span>
            </div>
          )}
        </div>
        
        <div className={styles.footer}>
          <div className={styles.ownerInfo}>
            <img src={vehicle.ownerAvatar} alt={vehicle.ownerName} className={styles.ownerAvatar} />
            <span className={styles.ownerName}>{vehicle.ownerName}</span>
          </div>
          <Link to={`/vehicles/${vehicle.id}`}>
            <Button size="sm">Xem chi tiết</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
