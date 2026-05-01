import React, { useEffect, useState } from 'react';
import styles from './Header.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { User, Scan } from 'lucide-react';
import { ScannerModal } from './ScannerModal';
import { authService } from '../services/auth';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string, role: string, avatarUrl?: string } | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('user');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    const checkBalance = () => {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (!user) {
        setBalance(0);
        return;
      }
      const userId = user.id || 'u1';

      // Auto-migrate if they have legacy balance stuck in 'vngo' keys
      const legacyBalance = localStorage.getItem(`vngo_wallet_balance_${userId}`) || localStorage.getItem('vngo_wallet_balance_undefined');
      if (legacyBalance) {
        localStorage.setItem(`ridehub_wallet_balance_${userId}`, legacyBalance);
        localStorage.removeItem(`vngo_wallet_balance_${userId}`);
        localStorage.removeItem('vngo_wallet_balance_undefined');
      }

      const storedBalance = localStorage.getItem(`ridehub_wallet_balance_${userId}`);
      setBalance(storedBalance ? parseInt(storedBalance, 10) : 0);
    };

    checkUser();
    checkBalance();

    // Listen for storage events (e.g. from other tabs or Wallet page)
    const handleStorageChange = () => {
      checkUser();
      checkBalance();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('user-auth-change', checkUser);
    window.addEventListener('wallet-updated', checkBalance);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-auth-change', checkUser);
      window.removeEventListener('wallet-updated', checkBalance);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 5 }).format(amount) + 'đ';
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContainer}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginRight: 'auto' }}>
          <Link to="/" className={styles.logo} style={{ marginRight: 0 }}>
            Ride<span>hub</span>
          </Link>
          <button
            onClick={() => setIsScannerOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              padding: '0.4rem 0.75rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
            title="Quét mã thuê xe"
          >
            <Scan size={16} />
            Quét để thuê xe
          </button>
        </div>

        <nav className={styles.nav}>
          <Link to="/how-to-use" className={styles.navLink}>Hướng dẫn sử dụng</Link>
          <Link to="/vehicles" className={styles.navLink}>Danh sách xe</Link>
          <Link to="/stations" className={styles.navLink}>Danh sách trạm</Link>
          <Link to="/my-bookings" className={styles.navLink}>Xe đã thuê</Link>
          <Link to="/about" className={styles.navLink}>Về chúng tôi</Link>
        </nav>

        <div className={styles.actions}>
          {user ? (
            <div className={styles.userMenu}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{formatCurrency(balance)}</span>
              </div>
              <Link to="/profile" className={styles.avatarLink} title="Tài khoản của tôi">
                <div className={styles.avatarCircle} style={{ overflow: 'hidden' }}>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={20} color="white" strokeWidth={2.5} />
                  )}
                </div>
              </Link>

              <div className={styles.dropdown}>
                <Link to="/profile" className={styles.dropdownItem}>Hồ sơ của tôi</Link>
                <Link to="/wallet" className={styles.dropdownItem}>Nạp tiền</Link>
                {(Array.isArray(user.role) ? user.role.some((r: any) => r.authority === 'ROLE_ADMIN') : (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN')) && (
                  <>
                    <div className={styles.dropdownDivider}></div>
                    <Link to="/admin" className={styles.dropdownItem}>Dashboard</Link>
                  </>
                )}
                <div className={styles.dropdownDivider}></div>
                <button onClick={handleLogout} className={styles.dropdownItem} style={{ color: 'var(--color-error)' }}>
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className={`btn ${styles.loginBtn}`}>Đăng nhập</Link>
          )}
        </div>
      </div>

      <ScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </header>
  );
};

export default Header;
