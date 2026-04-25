import React, { useState } from 'react';
import { authService } from '../services/auth';

import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import styles from './Auth.module.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const fullName = [lastName, firstName].filter(Boolean).join(' ').trim();
      const usernameToSave = fullName || email.split('@')[0];

      await authService.register({
        username: usernameToSave,
        email,
        password,
        firstName,
        lastName,
        phone,
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
          VN<span>GO</span>
        </div>
        <h2>Đăng ký tài khoản</h2>
        <p className={styles.subtitle}>Mở khóa hành trình của bạn</p>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleRegister} className={styles.form}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Họ" placeholder="VD: Nguyễn" value={lastName} onChange={e => setLastName(e.target.value)} fullWidth required />
            <Input label="Tên" placeholder="VD: Văn A" value={firstName} onChange={e => setFirstName(e.target.value)} fullWidth required />
          </div>
          <Input label="Email" type="email" placeholder="example@gmail.com" value={email} onChange={e => setEmail(e.target.value)} fullWidth required />
          <Input label="Số điện thoại" type="tel" placeholder="090 123 4567" value={phone} onChange={e => setPhone(e.target.value)} fullWidth required />
          <Input label="Mật khẩu" type="password" placeholder="Tạo mật khẩu" value={password} onChange={e => setPassword(e.target.value)} fullWidth required />
          
          <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="mt-4">
            Đăng ký
          </Button>
        </form>

        <p className={`${styles.switchAuth} mt-4`}>
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
