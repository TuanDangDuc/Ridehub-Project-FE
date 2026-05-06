import React, { useState, useEffect } from 'react';
import styles from './Wallet.module.css';
import { api } from '../services/api';

const Wallet: React.FC = () => {
  const getUserAndId = () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return user ? user.id || 'u1' : 'u1';
  };

  const [balance, setBalance] = useState<number>(0);
  const [debt] = useState<number>(() => {
    const userId = getUserAndId();
    const savedDebt = localStorage.getItem(`ridehub_wallet_debt_${userId}`);
    return savedDebt ? parseInt(savedDebt, 10) : 0;
  });
  const [amountInput, setAmountInput] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [initialBalance, setInitialBalance] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchBalance = async () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        try {
          const apiBalance = await api.getUserBalance(user.id);
          setBalance(apiBalance);
        } catch (e) {}
      }
    };
    fetchBalance();

    const intervalId = setInterval(() => {
      fetchBalance();
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (showQR && initialBalance !== null && balance > initialBalance) {
      alert("Nạp tiền thành công! Đã cập nhật số dư mới.");
      setShowQR(false);
      setAmountInput('');
      window.dispatchEvent(new Event('wallet-updated'));
      window.dispatchEvent(new Event('user-auth-change'));
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        userObj.balance = balance;
        localStorage.setItem('user', JSON.stringify(userObj));
      }
    }
  }, [balance, showQR, initialBalance]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const val = e.target.value.replace(/\D/g, '');
    setAmountInput(val);
  };

  const handlePresetClick = (amount: number) => {
    setAmountInput(amount.toString());
  };

  const handlePaymentClick = () => {
    const amountNum = parseInt(amountInput, 10);
    if (!amountNum || amountNum < 10000) {
      alert("Số tiền nạp tối thiểu là 10.000 đ");
      return;
    }
    
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id || '';
    if (!userId) {
      alert("Vui lòng đăng nhập lại!");
      return;
    }

    setInitialBalance(balance); // Lưu số dư hiện tại
    const redirectUrl = `https://api.anhchuno.id.vn/api/payment/checkout-redirect?amount=${amountNum}&userId=${userId}`;
    window.open(redirectUrl, '_blank');
    
    setShowQR(true); // Tận dụng state này để hiển thị "Đang chờ thanh toán" thay vì QR
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(amount) + 'đ';
  };

  return (
    <div className="container" style={{ minHeight: 'calc(100vh - var(--header-height) - 300px)' }}>
      <div className={styles.walletContainer}>
        {/* Left Column: Wallet Info */}
        <div className={styles.leftCol}>
          <div>
            <h2 className={styles.sectionTitle}>Ví của tôi</h2>
            <div className={styles.card}>
              <div className={styles.cardCol}>
                <div className={styles.cardItem}>
                  <div className={styles.cardLabel}>Tài khoản chính</div>
                  <div className={styles.cardValue}>{formatCurrency(balance)}</div>
                </div>
                <div className={styles.cardItem}>
                  <div className={styles.cardLabel}>Nợ cước</div>
                  <div className={styles.cardValue} style={{ color: debt > 0 ? 'var(--color-error)' : 'inherit' }}>
                    {formatCurrency(debt)}
                  </div>
                </div>
              </div>
              
              <div className={styles.cardDivider}></div>
              
              <div className={styles.cardCol}>
                <div className={styles.cardItem}>
                  <div className={styles.cardLabel}>Khuyến mại</div>
                  <div className={styles.cardValue}>0đ</div>
                </div>
                <div className={styles.cardItem}>
                  <div className={styles.cardLabel}>Hạn sử dụng</div>
                  <div className={styles.cardValue}>30/05/2026</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.historySection}>
            <h2 className={styles.sectionTitle}>Lịch sử giao dịch</h2>
            <p className={styles.emptyHistory}>Hiện chưa có giao dịch nào được thực hiện !</p>
          </div>
        </div>

        {/* Right Column: Top-up Form */}
        <div className={styles.rightCol}>
          <div className={styles.topupForm}>
            <h2 className={styles.sectionTitle}>Chọn số tiền bạn muốn nạp (VNĐ)</h2>
            
            <input 
              type="text" 
              placeholder="Nhập số tiền" 
              value={amountInput}
              onChange={handleAmountChange}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            
            <div className={styles.presetGrid}>
              {[50000, 100000, 200000].map(amount => (
                <button
                  key={amount}
                  className={`${styles.presetBtn} ${amountInput === amount.toString() ? styles.active : ''}`}
                  onClick={() => handlePresetClick(amount)}
                >
                  {new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 5 }).format(amount)}
                </button>
              ))}
            </div>

            <div className={styles.warningText}>
              ⚠️ Số tiền nạp vào tối thiểu 10.000 đ. Tiền nạp điểm vào tài khoản Ridehub sẽ không hoàn lại được.
            </div>

            <button 
              className={styles.payBtn} 
              onClick={handlePaymentClick}
              disabled={!amountInput || parseInt(amountInput, 10) < 10000}
            >
              Thanh toán
            </button>
          </div>
        </div>
      </div>

      {/* Polling Modal Overlay */}
      {showQR && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ textAlign: 'center', padding: '30px' }}>
            <h3 className={styles.modalTitle}>Đang chờ thanh toán</h3>
            <div style={{ margin: '20px 0' }}>
              <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
              Vui lòng hoàn tất thanh toán trên cửa sổ SePay vừa mở. Hệ thống đang liên tục kiểm tra trạng thái giao dịch...
            </p>
            <div className={styles.btnGroup} style={{ justifyContent: 'center' }}>
              <button className={styles.cancelBtn} onClick={() => setShowQR(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
