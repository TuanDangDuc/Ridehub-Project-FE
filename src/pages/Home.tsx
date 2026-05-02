import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import type { DecodedToken } from '../services/auth';
import { apiClient } from '../services/apiClient';
import styles from './Home.module.css';
import { api } from '../services/api';
import type { Vehicle } from '../types';
import { VehicleCard } from '../components/VehicleCard';
import { Spinner } from '../components/Spinner';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    const handleOAuth2Callback = async () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get('token');

      if (token) {
        localStorage.setItem('token', token);
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          const usernameOrEmail = decoded.sub;

          try {
            const userResponse = await apiClient.get(`/user/info/${usernameOrEmail}`);
            const userData = userResponse.data;

            let finalRole = 'ROLE_USER';
            if (Array.isArray(userData.role)) {
              const apiRole = userData.role.some((r: any) => r.authority === 'ROLE_ADMIN');
              if (apiRole) finalRole = 'ROLE_ADMIN';
            } else if (userData.role === 'ROLE_ADMIN' || userData.role === 'ADMIN') {
              finalRole = 'ROLE_ADMIN';
            }

            if (finalRole !== 'ROLE_ADMIN') {
              if (Array.isArray(decoded.role)) {
                const tokenRole = decoded.role.some((r: any) => r.authority === 'ROLE_ADMIN');
                if (tokenRole) finalRole = 'ROLE_ADMIN';
              } else if (decoded.role === 'ROLE_ADMIN' || decoded.role === 'ADMIN') {
                finalRole = 'ROLE_ADMIN';
              }
            }

            userData.role = finalRole;
            localStorage.setItem('user', JSON.stringify(userData));
            window.dispatchEvent(new Event('user-auth-change'));

            if (userData.role === 'ROLE_ADMIN') {
              navigate('/admin');
            } else {
              navigate('/');
            }
          } catch (apiError) {
            console.error("Không lấy được thông tin user:", apiError);
            let roleStr = 'ROLE_USER';
            if (Array.isArray(decoded.role)) {
              const tokenRole = decoded.role.some((r: any) => r.authority === 'ROLE_ADMIN');
              if (tokenRole) roleStr = 'ROLE_ADMIN';
            } else if (decoded.role === 'ROLE_ADMIN' || decoded.role === 'ADMIN') {
              roleStr = 'ROLE_ADMIN';
            }

            const fallbackData = {
              id: decoded.sub,
              email: decoded.sub,
              name: decoded.name || decoded.sub,
              role: roleStr
            };
            localStorage.setItem('user', JSON.stringify(fallbackData));
            window.dispatchEvent(new Event('user-auth-change'));
          }
        } catch (e) {
          console.error("Invalid token format", e);
        }
      }
    };

    handleOAuth2Callback();
    const fetchHomeData = async () => {
      try {
        const vehiclesData = await api.getVehicles();
        setVehicles(vehiclesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroDecor}>
          <div className={styles.circle1}></div>
          <div className={styles.circle2}></div>
          <div className={styles.circle3}></div>
        </div>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <h1>Kết nối giao thông thông minh</h1>
            <p>Trải nghiệm dịch vụ thuê xe hiện đại, tiện lợi và tiết kiệm cùng Ridehub.</p>
          </div>
        </div>
      </section>

      {/* How to use */}
      <section className={`container mt-8 ${styles.section}`}>
        <div className="text-center mb-8">
          <h2 className={styles.sectionTitle}>Cách sử dụng</h2>
          <p className={styles.sectionSubtitle}>Sau khi Đăng ký, sử dụng dễ dàng với 3 bước: Mở khóa - Đi xe - Trả xe</p>
        </div>
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNum}>1</div>
            <h3>Khởi động</h3>
            <p>Sử dụng ứng dụng để quét mã QR trên xe & mở khóa.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNum}>2</div>
            <h3>Hành trình</h3>
            <p>Di chuyển linh hoạt tới mọi nơi trong thành phố.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNum}>3</div>
            <h3>Kết thúc</h3>
            <p>Đậu xe vào trạm đón/trả và khóa xe để kết thúc chuyến đi.</p>
          </div>
        </div>
      </section>


      {/* Vehicle Listing / Explore */}
      <section className={`container mt-8 mb-8 ${styles.section}`}>
        <div className="flex justify-between items-center mb-8 w-full">
          <h2 className={styles.sectionTitle}>Khám phá phương tiện</h2>
          <div className={styles.filters}>
            <select
              className={styles.filterSelect}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option>Tất cả loại xe</option>
              <option>Xe đạp</option>
              <option>Xe đạp điện</option>
            </select>

          </div>
        </div>

        {loading ? (
          <div className="text-center mt-8"><Spinner size="lg" /></div>
        ) : (
          <React.Fragment>
            {(() => {
              const filteredVehicles = vehicles.filter((v) => {
                if (filterType === 'ALL') return true;
                return v.type === filterType;
              });

              return filteredVehicles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-secondary)', width: '100%' }}>
                  <h3>Không tìm thấy phương tiện nào.</h3>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {filteredVehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              );
            })()}
          </React.Fragment>
        )}
      </section>
    </div>
  );
};

export default Home;
