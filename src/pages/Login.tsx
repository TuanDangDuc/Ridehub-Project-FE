import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import styles from './Auth.module.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(new URLSearchParams(location.search).get('expired') === 'true' ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' : '');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const user = await authService.login(username, password);
      const isAdmin = Array.isArray(user.role)
        ? user.role.some((r: any) => r.authority === 'ROLE_ADMIN')
        : user.role === 'ROLE_ADMIN' || user.role === 'ADMIN';
      if (isAdmin) {
        navigate('/admin');
        
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Tên đăng nhập hoặc mật khẩu không chính xác');
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không chính xác');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.logo} style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          Ride<span>hub</span>
        </div>
        <h2>Đăng nhập</h2>
        <p className={styles.subtitle}>Chào mừng bạn quay trở lại!</p>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.form}>
          <Input 
            label="Tên đăng nhập" 
            placeholder="Nhập tên đăng nhập" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            required
          />
          <Input 
            label="Mật khẩu" 
            type="password" 
            placeholder="Nhập mật khẩu" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />
          
          <div className={styles.formActions}>
            <label className={styles.remember}>
              <input type="checkbox" /> Ghi nhớ đăng nhập
            </label>
            <Link to="/forgot-password" className={styles.forgotLink}>Quên mật khẩu?</Link>
          </div>

          <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
            Đăng nhập
          </Button>
        </form>

        <div className={styles.divider}>
          <span>Hoặc đăng nhập với</span>
        </div>

        <div className={styles.socialAuth}>
          <button type="button" className={styles.socialBtn} onClick={() => window.location.href = authService.GOOGLE_AUTH_URL}>
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" width="20" />
            Google
          </button>
        </div>

        <p className={styles.switchAuth}>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
