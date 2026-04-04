import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockUsers } from '../services/mockData';
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
    
    // Simulate login
    setTimeout(() => {
      const saved = localStorage.getItem('users');
      const usersList = saved ? JSON.parse(saved) : mockUsers;

      let matchedUser = usersList.find((u: any) => u.email === email);
      
      if (!matchedUser && email === 'admin@vngo.vn' && password === '123') {
         matchedUser = mockUsers.find((u: any) => u.role === 'ADMIN');
      }

      if (matchedUser) {
        if (password !== '123' && matchedUser.role === 'ADMIN') {
           setError('Email hoặc mật khẩu không chính xác');
        } else if (matchedUser.status === 'BANNED' || matchedUser.status === 'LOCKED') {
           setError('Tài khoản bị cấm!');
        } else {
           localStorage.setItem('user', JSON.stringify({ id: matchedUser.id, name: matchedUser.firstName + ' ' + matchedUser.lastName, role: matchedUser.role, email: matchedUser.email }));
           window.dispatchEvent(new Event('user-auth-change'));
           if (matchedUser.role === 'ADMIN') {
             navigate('/admin');
           } else {
             navigate('/');
           }
        }
      } else {
        // Mock simple login for testing if user doesn't exist but types email
        if (email && password) {
          const newUser = {
             id: 'u' + Date.now(),
             userName: email.split('@')[0],
             email: email,
             firstName: email.split('@')[0],
             lastName: '',
             avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
             role: 'USER',
             status: 'ACTIVE'
          };
          const newUsersList = [...usersList, newUser];
          localStorage.setItem('users', JSON.stringify(newUsersList));
          
          localStorage.setItem('user', JSON.stringify({ id: newUser.id, name: newUser.firstName, role: 'USER', email: email }));
          window.dispatchEvent(new Event('user-auth-change'));
          navigate('/');
        } else {
          setError('Email hoặc mật khẩu không chính xác');
        }
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.logo}>
          TN<span>GO</span>Clone
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
