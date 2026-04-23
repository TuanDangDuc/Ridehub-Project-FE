import { apiClient } from './apiClient';
//import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  sub: string; // username
  id?: string;
  role?: string;
  name?: string;
  exp: number;
}

export const authService = {
  login: async (username: string, password: string) => {
    // API trả về chuỗi Token (String)
    const { data } = await apiClient.post<string>('/user/login', { username, password });

    if (data && !data.includes('failed')) {
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
        console.error("Invalid token format", e);
        throw new Error("Lỗi định dạng xác thực");
      }
    } else {
      throw new Error(data || "Đăng nhập thất bại");
    }
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
