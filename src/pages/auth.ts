import { apiClient } from './apiClient';
import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  sub: string; // username
  id?: string;
  role?: string;
  name?: string;
  exp: number;
}

export const authService = {
  login: async (identifier: string, password: string) => {
    const { data } = await apiClient.post<any>('/user/login', { identifier, password });

    if (!data) {
      throw new Error('Đăng nhập thất bại');
    }

    if (typeof data === 'string') {
      // Nếu backend trả về JWT string
      localStorage.setItem('token', data);
      try {
        const decoded = jwtDecode<DecodedToken>(data);
        const userData = {
          id: decoded.sub,
          email: decoded.sub,
          name: decoded.name || decoded.sub,
          role: decoded.role || 'USER'
        };
        localStorage.setItem('user', JSON.stringify(userData));
        window.dispatchEvent(new Event('user-auth-change'));
        return userData;
      } catch (e) {
        console.error('Invalid token format', e);
        throw new Error('Lỗi định dạng xác thực');
      }
    }

    const user = data as any;
    const userData = {
      id: user.id ?? user.username,
      userName: user.userName || user.username || '',
      email: user.email ?? identifier,
      firstName: user.firstName || user.firstname || '',
      lastName: user.lastName || user.lastname || '',
      name: user.name || `${user.firstName || user.firstname || ''} ${user.lastName || user.lastname || ''}`.trim() || user.username || user.email || identifier,
      avatarUrl: user.avatarUrl || user.avatar_url || '',
      phone: user.phone || user.phone_number || '',
      identityNumber: user.identityNumber || user.identity_number || '',
      dateOfBirth: user.dateOfBirth || user.date_of_birth || '',
      sex: user.sex || '',
      role: user.role || 'USER',
      status: user.status || 'ACTIVE',
      balance: user.balance != null ? Number(user.balance) : 0
    };

    if (user.token) {
      localStorage.setItem('token', user.token);
    }
    localStorage.setItem('user', JSON.stringify(userData));
    window.dispatchEvent(new Event('user-auth-change'));
    return userData;
  },

  register: async (registerData: any) => {
    const { data } = await apiClient.post('/user/register', registerData);
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('user-auth-change'));
  }
};
