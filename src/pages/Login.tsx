import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  const saved = localStorage.getItem('users');
  const usersList = saved ? JSON.parse(saved) : [];

  const foundUser = usersList.find((u: any) => u.email === email);

  if (!foundUser) {
    setError('Không tồn tại tài khoản');
    return;
  }

  if (password !== '1234') {
    setError('Sai mật khẩu');
    return;
  }

  const fakeToken = btoa(
  JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + 60 * 60, 
    user: foundUser,
  })
);

  localStorage.setItem('token', fakeToken);
  localStorage.setItem('user', JSON.stringify(foundUser));

  window.dispatchEvent(new Event('user-auth-change'));
  
  navigate('/admin');
};

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2>Đăng nhập</h2>

        <input
          type="email"
          placeholder="Nhập email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Nhập mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Đăng nhập</button>
        <p style={{ marginTop: '12px', fontSize: '14px' }}>
  Chưa có tài khoản?{' '}
  <span
    style={{ color: '#2f80ed', cursor: 'pointer', fontWeight: 500 }}
    onClick={() => navigate('/register')}
  >
    Đăng ký
  </span>
</p>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default Login;