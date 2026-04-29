import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Vehicle, Review } from '../types';
import { Spinner } from '../components/Spinner';
import { Button } from '../components/Button';
import { Star, CheckCircle } from 'lucide-react';
import styles from './VehicleDetail.module.css';

const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        const [vData, rData] = await Promise.all([
          api.getVehicleById(id),
          api.getVehicleReviews(id)
        ]);
        if (vData) setVehicle(vData);
        setReviews(rData);
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

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="container mt-8 mb-8">
      {/* Overview Section */}
      <div className={styles.overviewGrid}>
        <div className={styles.gallery}>
          <img src={vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800'} alt={vehicle.name} className={styles.mainImage} />
        </div>
        <div className={styles.info}>
          <div className={styles.header}>
            <h1>{vehicle.name}</h1>
            <div className={styles.statusBadge} data-status={vehicle.status}>
              {vehicle.status === 'AVAILABLE' ? 'Sẵn sàng' : 'Không có sẵn'}
            </div>
          </div>
          <p className={styles.subtitle}>{vehicle.type} &bull; {vehicle.brand}</p>

          <div className={styles.rating}>
            <Star fill="var(--color-warning)" color="var(--color-warning)" size={20} />
            <span className={styles.ratingScore}>{vehicle.rating}</span>
            <span className={styles.ratingCount}>({reviews.length} đánh giá)</span>
          </div>

          <div className={styles.priceBox}>
            <div className={styles.price}>{formatPrice(Math.round((vehicle.priceSingle || (vehicle.type === 'Xe đạp điện' ? 20000 : 10000)) / 60))}<span>/phút</span></div>
            <p>Bao gồm bảo hiểm cơ bản & hỗ trợ 24/7</p>
          </div>
          <div className={styles.owner}>
            <p className={styles.sectionTitle}>Chủ sở hữu</p>
            <div className={styles.ownerInfo}>
              <img src={vehicle.ownerAvatar} alt={vehicle.ownerName} />
              <span>{vehicle.ownerName}</span>
            </div>
          </div>
        </div>
      </div>



      {/* Features & Reviews */}
      <div className={styles.detailsGrid}>
        <div className={styles.featuresSection}>
          <h2>Tính năng nổi bật</h2>
          <div className={styles.featuresList}>
            {Object.entries(vehicle.features || {}).map(([key, value]) => (
              <div key={key} className={`${styles.featureItem} ${!value ? styles.featureDisabled : ''}`}>
                <CheckCircle size={20} color={value ? 'var(--color-success)' : 'var(--color-border)'} />
                <span>{key}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.reviewsSection}>
          <h2>Đánh giá từ khách hàng</h2>
          {reviews.length === 0 ? (
            <p>Chưa có đánh giá nào.</p>
          ) : (
            <div className={styles.reviewList}>
              {reviews.map(review => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewerAvatar}></div>
                    <div className={styles.reviewerInfo}>
                      <h4>User_{review.userId}</h4>
                      <div className={styles.stars}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} fill={i < review.rating ? "var(--color-warning)" : "var(--color-border)"} color={i < review.rating ? "var(--color-warning)" : "var(--color-border)"} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className={styles.reviewContent}>{review.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
