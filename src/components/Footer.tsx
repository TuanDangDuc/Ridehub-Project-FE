import React from 'react';
import styles from './Footer.module.css';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.brandSection}>
          <h2 className={styles.logo}>Ride<span>hub</span></h2>
          <p className={styles.description}>Dịch vụ xe điện công cộng thông minh hàng đầu tại Việt Nam.</p>
        </div>
        <div className={styles.linkSection}>
          <h3>Thông tin chung</h3>
          <ul>
            <li><Link to="/about">Về chúng tôi</Link></li>
            <li><Link to="#">Quy chế hoạt động</Link></li>
            <li><Link to="#">Chính sách bảo mật</Link></li>
          </ul>
        </div>
        <div className={styles.contactSection}>
          <h3>Liên hệ</h3>
          <p>Hotline: 038 216 0052</p>
          <p>Email: tuongnguyenmanh2005@gmail.com</p>
        </div>
      </div>
      <div className={styles.bottomBar}>
        <p>&copy; {new Date().getFullYear()} Ridehub. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
