import axios from 'axios';

const baseURL = "http://localhost:8080/api";

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const publicApiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm Interceptor để tự động gắn token nếu có cho các request cần xác thực
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    if (username) {
      config.headers.set('username', username);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    // If the backend returns HTML (e.g. login redirect) instead of JSON, reject it
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      return Promise.reject(new Error("Received HTML instead of JSON"));
    }
    return response;
  },
  (error) => {
    // Xử lý lỗi chung tại đây (ví dụ: logout nếu 401)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // window.location.href = '/auth'; // có thể uncomment nếu muốn tự động redirect
    }
    return Promise.reject(error);
  }
);
