import { apiClient, publicApiClient } from "./apiClient";
import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  sub: string; // username
  id?: string;
  role?: Array<{ authority: string }> | string;
  name?: string;
  exp: number;
}

export interface UserInfo {
  id?: string | number;
  username: string;
  email?: string;
  fullName?: string;
  phone?: string;
  role?: string;
  avatar?: string;
  balance?: number;
}

export const authService = {
  GOOGLE_AUTH_URL: "https://api.anhchuno.id.vn/api/oauth2/login/google",
  GITHUB_AUTH_URL: "https://api.anhchuno.id.vn/api/oauth2/login/github",

  login: async (username: string, password: string) => {
    // API trả về chuỗi Token (String)
    const { data } = await publicApiClient.post<string>("/user/login", {
      username,
      password,
    });

    if (data && !data.includes("failed")) {
      localStorage.setItem("token", data);
      localStorage.setItem("username", username);

      // Decode token để kiểm tra phiên
      let decoded: DecodedToken;
      try {
        decoded = jwtDecode<DecodedToken>(data);

        // Kiểm tra token hết hạn chưa
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          localStorage.removeItem("token");
          throw new Error("Phiên đăng nhập đã hết hạn");
        }
      } catch (e) {
        console.error("Invalid token format", e);
        throw new Error("Lỗi định dạng xác thực");
      }

      // Gọi API lấy thông tin user
      let userData: UserInfo;
      try {
        const userResponse = await apiClient.get<UserInfo>(`/user/info/${username}`);
        userData = userResponse.data;
        // Extract role string from either API response or JWT
        let finalRole = 'ROLE_USER';
        
        // Check userData.role from API
        if (Array.isArray(userData.role)) {
          const apiRole = userData.role.some((r: any) => r.authority === 'ROLE_ADMIN');
          if (apiRole) finalRole = 'ROLE_ADMIN';
        } else if (userData.role === 'ROLE_ADMIN' || userData.role === 'ADMIN') {
          finalRole = 'ROLE_ADMIN';
        }
        
        // Check decoded.role from JWT
        if (finalRole !== 'ROLE_ADMIN') {
          if (Array.isArray(decoded.role)) {
            const tokenRole = decoded.role.some((r: any) => r.authority === 'ROLE_ADMIN');
            if (tokenRole) finalRole = 'ROLE_ADMIN';
          } else if (decoded.role === 'ROLE_ADMIN' || decoded.role === 'ADMIN') {
            finalRole = 'ROLE_ADMIN';
          }
        }
        
        userData.role = finalRole;
        
        const mappedData: UserInfo = {
          id: (userData as any).id,
          username: (userData as any).username,
          email: (userData as any).email,
          fullName: (userData as any).fullName || `${(userData as any).firstname || ''} ${(userData as any).lastname || ''}`.trim(),
          phone: (userData as any).phoneNumber || (userData as any).phone,
          avatar: (userData as any).avatarUrl || (userData as any).avatar,
          balance: (userData as any).balance || 0,
          role: finalRole
        };

        // Lưu thông tin user vào localStorage
        localStorage.setItem("user", JSON.stringify(mappedData));
        window.dispatchEvent(new Event("user-auth-change"));
        return mappedData;
      } catch (e) {
        // Nếu không lấy được user info, vẫn đăng nhập thành công
        console.error("Không lấy được thông tin user", e);
        let roleStr = 'ROLE_USER';
        if (Array.isArray(decoded.role)) {
          const tokenRole = decoded.role.some((r: any) => r.authority === 'ROLE_ADMIN');
          if (tokenRole) roleStr = 'ROLE_ADMIN';
        } else if (decoded.role === 'ROLE_ADMIN' || decoded.role === 'ADMIN') {
          roleStr = 'ROLE_ADMIN';
        }
        const fallbackUser: UserInfo = {
          username: decoded.sub,
          role: roleStr,
          balance: 0
        };
        localStorage.setItem("user", JSON.stringify(fallbackUser));
        window.dispatchEvent(new Event("user-auth-change"));
        return fallbackUser;
      }
    } else {
      throw new Error(data || "Đăng nhập thất bại");
    }
  },

  register: async (registerData: Record<string, unknown>) => {
    const { data } = await publicApiClient.post("/user/register", registerData);
    console.log("Register response:", data);
    return data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("user-auth-change"));
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (e) {
      return true;
    }
  },

  checkSession: () => {
    const token = localStorage.getItem("token");
    if (token && authService.isTokenExpired(token)) {
      authService.logout();
      return false;
    }
    return !!token;
  },
};
