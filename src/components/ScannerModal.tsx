import React, { useState } from 'react';
import { X, Scan, Keyboard, Flashlight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Scanner } from '@yudiel/react-qr-scanner';
import styles from './ScannerModal.module.css';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('Vui lòng nhập mã xe');
      return;
    }
    setError('');
    setIsSubmitting(true);
    
    try {
      // Check if user is logged in
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!token || !user) {
        setError('Vui lòng đăng nhập trước khi thuê xe.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const parsedUser = user ? JSON.parse(user) : null;
      const userId = parsedUser?.id;
      
      if (!userId) {
        setError('Không tìm thấy ID người dùng. Vui lòng đăng xuất và đăng nhập lại.');
        return;
      }

      let vehicle;
      
      // Check if the code is a UUID (typically from QR scan)
      const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(code.trim());
      
      if (isUUID) {
        vehicle = await api.getVehicleById(code.trim());
      } else {
        vehicle = await api.getVehicleByCode(code.trim());
      }

      if (!vehicle) {
        throw new Error('Mã không chính xác, vui lòng nhập lại.');
      }
      if (vehicle.status !== 'AVAILABLE') {
        throw new Error('Xe này hiện đang không sẵn sàng (hoặc đã được thuê).');
      }

      // Try to get station and pricing from the vehicle object directly
      const startStationId = vehicle.stationId || (vehicle as any).station?.id;
      const pricingId = (vehicle as any).pricingId || (vehicle as any).pricing_id || (vehicle as any).pricing?.id;

      if (!startStationId) {
        throw new Error('Dữ liệu xe thiếu thông tin trạm. Vui lòng liên hệ quản trị viên.');
      }
      if (!pricingId) {
        throw new Error('Dữ liệu xe thiếu thông tin bảng giá. Vui lòng liên hệ quản trị viên.');
      }

      // Delegate the transaction to backend
      await api.createTrip({
        userId,
        vehicleId: vehicle.id,
        startStationId,
        pricingId
      });
      
      onClose();
      window.dispatchEvent(new Event('trip-updated'));
      navigate('/my-bookings');
    } catch (err: any) {
      console.error('Rental error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi không xác định. Vui lòng thử lại.';
      
      if (err.response?.status === 403) {
        setError('Bạn không có quyền thực hiện hành động này (403). Vui lòng kiểm tra tài khoản.');
      } else if (err.response?.status === 400) {
        setError('Yêu cầu không hợp lệ (400). Có thể do dữ liệu xe hoặc tài khoản.');
      } else if (err.response?.status === 404 || err.response?.status === 500) {
        setError('Mã xe không đúng, vui lòng nhập lại.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div style={{ width: 24 }}></div> {/* Spacer */}
          <h2 className={styles.title}>{activeTab === 'scan' ? 'Quét mã' : 'Nhập mã'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'scan' ? (
            <div className={styles.scanArea}>
              <div className={styles.cameraFrame}>
                <Scanner
                  onScan={(result) => {
                    if (result && result.length > 0) {
                      const scannedValue = result[0].rawValue;
                      setCode(scannedValue);
                      setActiveTab('manual');
                      if (scannedValue.startsWith('http://') || scannedValue.startsWith('https://')) {
                        setError('Mã QR không hợp lệ (chứa đường link). Vui lòng quét mã QR dạng văn bản chứa mã xe (VD: RH-EBK-001).');
                      } else {
                        setError('');
                      }
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <div className={styles.manualArea}>
              <div className={styles.manualContent}>
                <p className={styles.instruction}>Tìm mã QR trên khoá xe</p>
                <input 
                  type="text" 
                  className={styles.codeInput} 
                  placeholder="Nhập mã số ở đây" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoFocus
                />
                {error && <p className={styles.errorText}>{error}</p>}
              </div>

              <div className={styles.actionArea}>
                <button 
                  className={styles.submitBtn} 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Thuê xe'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.tabs}>
            <div className={styles.tabItem} onClick={() => setActiveTab(activeTab === 'manual' ? 'scan' : 'manual')}>
              <button className={styles.iconBtn}>
                {activeTab === 'scan' ? <Keyboard size={24} /> : <Scan size={24} />}
              </button>
              <span>{activeTab === 'scan' ? 'Nhập mã' : 'Quét mã'}</span>
            </div>
            
            {activeTab === 'scan' && (
              <div className={styles.tabItem}>
                <button className={styles.iconBtn}>
                  <Flashlight size={24} />
                </button>
                <span>Đèn pin</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
