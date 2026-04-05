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
      // Simulate verifying and renting
      const user = localStorage.getItem('user');
      const parsedUser = user ? JSON.parse(user) : null;
      const userId = (parsedUser && parsedUser.id) ? parsedUser.id : 'u1';
      

      // Wait, we need api.createTrip(code)
      await api.createTrip(code, userId);
      
      onClose();
      window.dispatchEvent(new Event('trip-updated'));
      navigate('/my-bookings');
    } catch (err: any) {
      setError(err.message || 'Mã xe không hợp lệ. Vui lòng thử lại.');
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
                        setError('Mã QR không hợp lệ (chứa đường link). Vui lòng quét mã QR dạng văn bản chứa mã xe (VD: TN-EBK-001).');
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
