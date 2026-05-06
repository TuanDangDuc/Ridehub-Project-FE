import React, { useState } from 'react';
import { authService } from '../services/auth';

import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import styles from './Auth.module.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authService.register({
        username,
        password,
        email,
      });

      // Redirect sau 1 giây báo thành công
      setTimeout(() => {
        setIsLoading(false);
        navigate('/login');
      }, 1000);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Đăng ký thất bại, email có thể đã được sử dụng!');
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.logo} style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          Ride<span>hub</span>
        </div>
        <h2>Đăng ký tài khoản</h2>
        <p className={styles.subtitle}>Mở khóa hành trình của bạn</p>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleRegister} className={styles.form}>
          <Input label="Tên đăng nhập (Username)" placeholder="VD: minhanh123" value={username} onChange={e => setUsername(e.target.value)} fullWidth required />
          <Input label="Email" type="email" placeholder="example@gmail.com" value={email} onChange={e => setEmail(e.target.value)} fullWidth required />
          <Input label="Mật khẩu" type="password" placeholder="Tạo mật khẩu" value={password} onChange={e => setPassword(e.target.value)} fullWidth required />
          
          <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="mt-4">
            Đăng ký
          </Button>
        </form>

        <div className={styles.divider}>
          <span>Hoặc đăng ký với</span>
        </div>

        <div className={styles.socialAuth}>
          <button type="button" className={styles.socialBtn} onClick={() => window.location.href = authService.GOOGLE_AUTH_URL}>
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" width="20" />
            Google
          </button>
        </div>

        <p className={`${styles.switchAuth} mt-4`}>
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
