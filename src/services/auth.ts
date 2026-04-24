export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
};

export const isTokenExpired = () => {
  const token = getToken();
  if (!token) return true;

  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return true;

  const now = Date.now() / 1000;
  return decoded.exp < now;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};