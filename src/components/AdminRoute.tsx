import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute: React.FC = () => {
  const userStr = localStorage.getItem('user');

  if (!userStr) {
    // Không có user đăng nhập -> về trang login
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    const isAdmin = Array.isArray(user.role)
      ? user.role.some((r: any) => r.authority === 'ROLE_ADMIN')
      : user.role === 'ROLE_ADMIN' || user.role === 'ADMIN';
    if (isAdmin) {
      // Đúng role ADMIN thì cho phép render component con
      return <Outlet />;
    }
  } catch (e) {
    console.error("Lỗi parse cấu hình user:", e);
  }

  // Nếu không phải ADMIN -> chặn và đẩy về trang chủ Route "/"
  return <Navigate to="/" replace />;
};

export default AdminRoute;
