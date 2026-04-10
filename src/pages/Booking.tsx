import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { api } from '../services/api';
import type { Vehicle, User } from '../types';
import { Spinner } from '../components/Spinner';
import { Button } from '../components/Button';
import { Copy, CheckCircle, MapPin } from 'lucide-react';
import styles from './Booking.module.css';
import { MOCK_STATIONS } from '../utils/stations';

const Booking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [ticketType, setTicketType] = useState<'SINGLE' | 'DAY' | 'WEEK'>('SINGLE');
  const [pickupStationId, setPickupStationId] = useState<string>(MOCK_STATIONS[0].id);

  const [copiedField, setCopiedField] = useState('');

  const selectedStation = MOCK_STATIONS.find(s => s.id === pickupStationId) || MOCK_STATIONS[0];

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      if (!id) return;
      try {
        const [v, u] = await Promise.all([
          api.getVehicleById(id),
          api.getUserProfile('u1')
        ]);
        if (v) setVehicle(v);
        if (u) setUser(u);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) return <div className="container mt-8 text-center"><Spinner size="lg" /></div>;
  if (!vehicle) return <div className="container mt-8 text-center">Không tìm thấy phương tiện.</div>;

  const getPrice = (type: 'SINGLE' | 'DAY' | 'WEEK') => {
    const isEBike = vehicle?.type === 'Xe đạp điện';
    if (type === 'SINGLE') return vehicle?.priceSingle || (isEBike ? 20000 : 10000);
    if (type === 'DAY') return vehicle?.priceDay || (isEBike ? 100000 : 50000);
    if (type === 'WEEK') return vehicle?.priceWeek || (isEBike ? 300000 : 150000);
    return 0;
  };

  const calculateCost = () => {
    return getPrice(ticketType);
  };

  const getDurationText = () => {
    if (ticketType === 'SINGLE') return '1 giờ';
    if (ticketType === 'DAY') return '24 giờ';
    if (ticketType === 'WEEK') return '7 ngày';
    return '';
  };

  const getEndDate = () => {
    if (!startDate) return new Date();
    const end = new Date(startDate);
    if (ticketType === 'SINGLE') end.setHours(end.getHours() + 1);
    if (ticketType === 'DAY') end.setHours(end.getHours() + 24);
    if (ticketType === 'WEEK') end.setDate(end.getDate() + 7);
    return end;
  };

  const handlePreBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;
    setShowPayment(true);
  };

  const handleConfirmPayment = async () => {
    if (!startDate) return;

    setIsSubmitting(true);
    try {
      await api.createBooking({
        startTime: startDate.toISOString(),
        endTime: getEndDate().toISOString(),
        startStationId: pickupStationId,
        endStationId: 'any',
        vehicleId: vehicle.id,
        userId: 'u1',
        totalCost: calculateCost(),
        distance: 0
      });
      navigate('/my-bookings');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (showPayment) {
    return (
      <div className={styles.paymentContainer}>
        <div className={styles.bookingSummaryWrapper}>
          {user && (
            <div className={styles.userInfoBox}>
              <h3 className={styles.smallHeading}>Thông tin người đặt chuyến</h3>
              <p><strong>Họ và tên:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>SĐT / Email:</strong> {user.email}</p>
            </div>
          )}
          <div className={styles.userInfoBox} style={{ borderLeftColor: 'var(--color-success)' }}>
            <h3 className={styles.smallHeading}>Thông tin chuyến đi</h3>
            <p><strong>Nhận xe:</strong> {startDate?.toLocaleString('vi-VN')} tại {selectedStation.name} ({selectedStation.address})</p>
            <p><strong>Trả xe:</strong> {getEndDate().toLocaleString('vi-VN')} tại Bất kỳ trạm VNGo nào</p>
            <p><strong>Thời gian thuê:</strong> {getDurationText()}</p>
            <p><strong>Loại vé:</strong> {ticketType === 'SINGLE' ? 'Vé lượt' : ticketType === 'DAY' ? 'Vé ngày' : 'Vé tuần'}</p>
            <p style={{ marginTop: '0.5rem', fontSize: '1.1rem', color: 'var(--color-primary)' }}><strong>Tổng cộng: {formatPrice(calculateCost())}</strong></p>
          </div>
        </div>

        <h2 className={styles.paymentHeader}>Thông tin thanh toán</h2>

        <table className={styles.billingTable}>
          <tbody>
            <tr>
              <td className={styles.billingLabel}>Ngân hàng</td>
              <td className={styles.billingValue}>Chuyển khoản ngân hàng (MB Bank)</td>
            </tr>
            <tr>
              <td className={styles.billingLabel}>Số tài khoản:</td>
              <td className={styles.billingValue}>
                0822262802222
                <button type="button" className={styles.copyBtn} onClick={() => handleCopy('0822262802222', 'stk')} title="Copy">
                  {copiedField === 'stk' ? <CheckCircle size={16} color="var(--color-success)" /> : <Copy size={16} />}
                </button>
              </td>
            </tr>
            <tr>
              <td className={styles.billingLabel}>Tên tài khoản:</td>
              <td className={styles.billingValue}>NGUYEN MANH TUONG / Ngân Hàng MB</td>
            </tr>
            <tr>
              <td className={styles.billingLabel}>Số tiền:</td>
              <td className={styles.billingValue}>
                {formatPrice(calculateCost())}
                <button type="button" className={styles.copyBtn} onClick={() => handleCopy(calculateCost().toString(), 'money')} title="Copy">
                  {copiedField === 'money' ? <CheckCircle size={16} color="var(--color-success)" /> : <Copy size={16} />}
                </button>
              </td>
            </tr>
            <tr>
              <td className={styles.billingLabel}>Nội dung thanh toán:</td>
              <td className={styles.billingValue}>
                thanh toan dat xe
                <button type="button" className={styles.copyBtn} onClick={() => handleCopy('thanh toan dat xe', 'content')} title="Copy">
                  {copiedField === 'content' ? <CheckCircle size={16} color="var(--color-success)" /> : <Copy size={16} />}
                </button>
              </td>
            </tr>
            <tr className={styles.qrRow}>
              <td colSpan={2}>
                <div className={styles.qrInfoWrapper}>
                  <img src="/vietqr.png" alt="Mã QR VietQR" className={styles.actualQrImage} />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <p className={styles.paymentWarning}>
          Yêu cầu copy chính xác số tiền và nội dung chuyển khoản. Hệ thống sẽ hủy giao dịch nếu không nhận được thanh toán trong vòng 15 phút.
        </p>

        <div className={styles.paymentActions} style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '600px', margin: '0 auto', justifyContent: 'center' }}>
          <Button size="lg" variant="outline" onClick={() => setShowPayment(false)} disabled={isSubmitting}>
            Quay lại sửa
          </Button>
          <Button size="lg" onClick={handleConfirmPayment} isLoading={isSubmitting}>
            Đã thanh toán (Hoàn tất)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mt-8 mb-8 ${styles.bookingContainer}`}>
      <div className={styles.leftCol}>
        <h2>Chi tiết đặt xe</h2>
        <form onSubmit={handlePreBook} className={styles.formCard}>
          <div className={styles.formGroup}>
            <label>Loại vé thuê</label>
            <select 
              value={ticketType} 
              onChange={(e) => setTicketType(e.target.value as any)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '1rem', marginBottom: '1rem', backgroundColor: 'white' }}
            >
              <option value="SINGLE">Vé lượt ({formatPrice(getPrice('SINGLE'))})</option>
              <option value="DAY">Vé ngày ({formatPrice(getPrice('DAY'))})</option>
              <option value="WEEK">Vé tuần ({formatPrice(getPrice('WEEK'))})</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Thời gian nhận xe</label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              className={styles.datePicker}
              minDate={new Date()}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Trạm nhận xe</label>
            <select 
              value={pickupStationId} 
              onChange={(e) => setPickupStationId(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '1rem', marginBottom: '1rem', backgroundColor: 'white' }}
            >
              {MOCK_STATIONS.map(station => (
                <option key={station.id} value={station.id}>
                  {station.id} - {station.name}
                </option>
              ))}
            </select>

            <div className={styles.locationBox} style={{ backgroundColor: 'var(--color-bg)', border: 'none', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                <MapPin size={20} /> Địa chỉ nhận xe
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {selectedStation.address}
              </div>
            </div>

            <div className={styles.locationBox} style={{ marginTop: '1rem', backgroundColor: 'var(--color-bg)', border: 'none', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-secondary)' }}>
                <MapPin size={20} /> Trạm trả xe
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Bạn có thể trả xe tại <strong>Bất kỳ trạm VNGO nào</strong> trong quá trình sử dụng.
              </div>
            </div>
          </div>

          <div className={styles.summaryBox}>
            <div className={styles.summaryItem}>
              <span>Thời gian thuê:</span>
              <strong>{getDurationText()}</strong>
            </div>
            <div className={styles.summaryItem}>
              <span>Đơn giá:</span>
              <strong>{ticketType === 'SINGLE' ? 'Vé lượt' : ticketType === 'DAY' ? 'Vé ngày' : 'Vé tuần'}</strong>
            </div>
            <hr />
            <div className={styles.summaryTotal}>
              <span>Tổng cộng:</span>
              <span className={styles.totalPrice}>{formatPrice(calculateCost())}</span>
            </div>
          </div>

          <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
            Xác nhận đặt chuyến
          </Button>
        </form>
      </div>

      <div className={styles.rightCol}>
        <div className={styles.vehicleSummary}>
          <img src={vehicle.images[0]} alt={vehicle.name} />
          <div className={styles.vehicleInfo}>
            <h3>{vehicle.name}</h3>
            <p>{vehicle.type} &bull; {vehicle.code}</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Booking;
