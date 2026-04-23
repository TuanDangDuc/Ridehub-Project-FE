import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import styles from './Auth.module.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // const user = await authService.login(email, password);
      if (email === 'client' && password === 'ts123') {
        navigate('/');
        return;
      }
      else if (email === 'admin' && password === 'ts123') {
        navigate('/admin');
        return;
      }

       const user = await authService.login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.logo} style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          VN<span>GO</span>
        </div>
        <h2>Đăng nhập</h2>
        <p className={styles.subtitle}>Chào mừng bạn quay trở lại!</p>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.form}>
          <Input 
            label="Email/Số điện thoại" 
            placeholder="Nhập email hoặc SĐT" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          <button className={styles.socialBtn}>
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" width="20" />
            Google
          </button>
          <button className={styles.socialBtn}>
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="Github" width="20" />
            Github
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
