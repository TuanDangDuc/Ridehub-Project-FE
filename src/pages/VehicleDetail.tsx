import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Vehicle } from '../types';
import { Spinner } from '../components/Spinner';
import { Button } from '../components/Button';
import styles from './VehicleDetail.module.css';

const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState<number>(0);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        const [vData] = await Promise.all([
          api.getVehicleById(id)
        ]);
        if (vData) {
          setVehicle(vData);
          setPrice(vData.pricePerMinutes || 0);
          if (vData.pricingId) {
            api.getPricingById(vData.pricingId).then((pData) => {
              if (pData && typeof pData.pricePerMinutes === 'number') {
                setPrice(pData.pricePerMinutes);
              }
            });
          }
        }
      } catch (error) {
        console.error('Error fetching vehicle details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);


  if (loading) return <div className="container mt-8 text-center"><Spinner size="lg" /></div>;
  if (!vehicle) return <div className="container mt-8 text-center"><p>Không tìm thấy phương tiện.</p><Button onClick={() => navigate('/')}>Quay lại</Button></div>;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 5
    }).format(price);
  };

  return (
    <div className="container mt-8 mb-8">
      {/* Overview Section */}
      <div className={styles.overviewGrid}>
        <div className={styles.gallery}>
          <img 
            src={
              (vehicle.imageUrl && (vehicle.imageUrl.startsWith('http://') || vehicle.imageUrl.startsWith('https://')))
                ? vehicle.imageUrl
                : '/favicon.png'
            } 
            alt={vehicle.name} 
            className={styles.mainImage} 
            style={!(vehicle.imageUrl && (vehicle.imageUrl.startsWith('http://') || vehicle.imageUrl.startsWith('https://'))) ? { objectFit: 'contain', padding: '2rem', backgroundColor: '#f9f9f9' } : {}}
          />
        </div>
        <div className={styles.info}>
          <div className={styles.header}>
            <h1>{vehicle.name}</h1>
            <div className={styles.statusBadge} data-status={vehicle.status}>
              {vehicle.status === 'AVAILABLE' ? 'Sẵn sàng' : 'Không có sẵn'}
            </div>
          </div>
          <p className={styles.subtitle}>{vehicle.type} &bull; {vehicle.brand}</p>

          <div className={styles.priceBox}>
            <div className={styles.price}>{formatPrice(price)}<span>/phút</span></div>
            <p>Bao gồm bảo hiểm cơ bản & hỗ trợ 24/7</p>
          </div>
        </div>
      </div>




    </div>
  );
};

export default VehicleDetail;
