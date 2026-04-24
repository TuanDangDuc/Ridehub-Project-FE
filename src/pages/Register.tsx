import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    const saved = localStorage.getItem('users');
const usersList = saved ? JSON.parse(saved) : [];

if (usersList.some((u: any) => u.email === email)) {
  setError('Email đã tồn tại');
  return;
}

const newUser = {
  id: 'u' + Date.now(),
  email,
  firstName,
  lastName,
  phone,
  role: 'USER',
  avatarUrl: `https://i.pravatar.cc/150?u=${email}`
};

localStorage.setItem('users', JSON.stringify([...usersList, newUser]));

navigate('/login');
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleRegister}>
        <h2>Đăng ký</h2>

        <input
          placeholder="Họ"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          placeholder="Tên"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Nhập lại mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit">Đăng ký</button>

        {error && <p className="error">{error}</p>}

        <p style={{ marginTop: '12px', fontSize: '14px', textAlign: 'center' }}>
          Đã có tài khoản?{' '}
          <span
            style={{
              color: '#2f80ed',
              cursor: 'pointer',
              fontWeight: 600
            }}
            onClick={() => navigate('/login')}
          >
            Đăng nhập
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;