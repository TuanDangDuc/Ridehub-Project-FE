import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Vehicle } from '../types';
import { Banknote } from 'lucide-react';
import { api } from '../services/api';
import styles from './VehicleCard.module.css';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const [price, setPrice] = useState<number>(vehicle.pricePerMinutes || 0);

  useEffect(() => {
    if (vehicle.pricingId) {
      api.getPricingById(vehicle.pricingId).then((data) => {
        if (data && typeof data.pricePerMinutes === 'number') {
          setPrice(data.pricePerMinutes);
        }
      });
    }
  }, [vehicle.pricingId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 5
    }).format(price);
  };

  return (
    <Link to={`/vehicles/${vehicle.id}`} className={styles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className={styles.imageContainer}>
        <img
          src={
            (vehicle.imageUrl && (vehicle.imageUrl.startsWith('http://') || vehicle.imageUrl.startsWith('https://')))
              ? vehicle.imageUrl
              : '/favicon.png'
          }
          alt={vehicle.name}
          className={styles.image}
          style={!(vehicle.imageUrl && (vehicle.imageUrl.startsWith('http://') || vehicle.imageUrl.startsWith('https://'))) ? { objectFit: 'contain', padding: '1rem', backgroundColor: '#f9f9f9' } : {}}
        />
        <div className={styles.statusBadge} data-status={vehicle.status}>
          {vehicle.status === 'AVAILABLE' ? 'Sẵn sàng' : vehicle.status === 'RENTED' ? 'Đang thuê' : 'Bảo trì'}
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{vehicle.name}</h3>
        </div>
        
        <p className={styles.type}>{vehicle.type}</p>
        
        <div className={styles.details}>
          <div className={styles.detailItem}>
            <Banknote size={16} />
            <span>{formatPrice(price)}/phút</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
