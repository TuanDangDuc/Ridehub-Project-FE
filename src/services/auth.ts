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
}

export const authService = {
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
        
        userData = {
          id: data.id,
          username: data.username,
          email: data.email,
          fullName: `${data.firstname || ''} ${data.lastname || ''}`.trim(),
          phone: data.phoneNumber,
          avatar: data.avatarUrl,
          role: decoded.role || "USER"
        };

        // Lưu thông tin user vào localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        window.dispatchEvent(new Event("user-auth-change"));
        return userData;
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
        const fallbackUser = {
          username: decoded.sub,
          role: roleStr,
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
};
