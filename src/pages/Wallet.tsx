import React, { useState, useEffect } from 'react';
import styles from './Wallet.module.css';

const Wallet: React.FC = () => {
  const getUserAndId = () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return user ? user.id || 'u1' : 'u1';
  };

  const [balance, setBalance] = useState<number>(() => {
    const userId = getUserAndId();
    const savedBalance = localStorage.getItem(`vngo_wallet_balance_${userId}`);
    return savedBalance ? parseInt(savedBalance, 10) : 0;
  });
  const [debt, setDebt] = useState<number>(() => {
    const userId = getUserAndId();
    const savedDebt = localStorage.getItem(`vngo_wallet_debt_${userId}`);
    return savedDebt ? parseInt(savedDebt, 10) : 0;
  });
  const [amountInput, setAmountInput] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  
  useEffect(() => {
    // Only required if depending on specific mounting behavior, 
    // but initialized correctly.
  }, []);

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
    setShowQR(true);
  };

  const handleConfirmPayment = () => {
    const amountNum = parseInt(amountInput, 10);
    let remainingAmount = amountNum;
    let currentDebt = debt;

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) return;

    const userId = user.id || 'u1';

    if (currentDebt > 0) {
      if (remainingAmount >= currentDebt) {
        remainingAmount -= currentDebt;
        currentDebt = 0;
      } else {
        currentDebt -= remainingAmount;
        remainingAmount = 0;
      }
      setDebt(currentDebt);
      localStorage.setItem(`vngo_wallet_debt_${userId}`, currentDebt.toString());
    }

    const newBalance = balance + remainingAmount;
    setBalance(newBalance);
    localStorage.setItem(`vngo_wallet_balance_${userId}`, newBalance.toString());
    setShowQR(false);
    setAmountInput('');
    window.dispatchEvent(new Event('wallet-updated'));
    alert("Nạp tiền thành công!");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
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
                  {new Intl.NumberFormat('vi-VN').format(amount)}
                </button>
              ))}
            </div>

            <div className={styles.warningText}>
              ⚠️ Số tiền nạp vào tối thiểu 10.000 đ. Tiền nạp điểm vào tài khoản VNGo sẽ không hoàn lại được.
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

      {/* QR Code Modal Overlay */}
      {showQR && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Quét mã QR để thanh toán</h3>
            <img 
              src={`https://img.vietqr.io/image/mb-0822262802222-print.png?amount=${amountInput}&accountName=NGUYEN%20MANH%20TUONG`} 
              alt="Mã QR thanh toán MB Bank" 
              className={styles.qrImage} 
            />
            <p style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              Vui lòng quét mã trên ứng dụng ngân hàng để nạp <strong>{formatCurrency(parseInt(amountInput, 10))}</strong> vào tài khoản VNGo của bạn.
            </p>
            <div className={styles.btnGroup}>
              <button className={styles.cancelBtn} onClick={() => setShowQR(false)}>Hủy</button>
              <button className={styles.confirmBtn} onClick={handleConfirmPayment}>Đã thanh toán</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
