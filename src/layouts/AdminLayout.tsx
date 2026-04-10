import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import styles from './AdminLayout.module.css';
import { LayoutDashboard, Users, Bike, MapPin, LogOut } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        navigate('/login', { replace: true });
        return;
      }
      try {
        const user = JSON.parse(userStr);
        if (user.role !== 'ADMIN') {
          navigate('/', { replace: true }); // Chuyển hướng người dùng thường về trang chủ
        }
      } catch {
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('user-auth-change'));
    navigate('/login');
  };

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Admin<span>Panel</span></h2>
        </div>
        <nav className={styles.sidebarNav}>
          <Link to="/admin"><LayoutDashboard size={20} /> Tổng quan</Link>
          <Link to="/admin/users"><Users size={20} /> Người dùng</Link>
          <Link to="/admin/vehicles"><Bike size={20} /> Phương tiện</Link>
          <Link to="/admin/stations"><MapPin size={20} /> Trạm xe</Link>
        </nav>
      </aside>
      <main className={styles.mainContent}>
        <header className={styles.adminHeader}>
          <div className={styles.userInfo} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span>Admin, Welcome!</span>
            <button className={styles.logoutBtn} style={{ width: 'auto', padding: '0.4rem 1rem' }} onClick={handleLogout}>
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        </header>
        <div className={styles.contentArea}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
