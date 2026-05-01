import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import type { DecodedToken, UserInfo } from '../services/auth';
import { apiClient } from '../services/apiClient';

const OAuth2RedirectHandler: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleOAuth2Callback = async () => {
            const queryParams = new URLSearchParams(location.search);
            const token = queryParams.get('token');

            if (token) {
                localStorage.setItem('token', token);
                try {
                    const decoded = jwtDecode<DecodedToken>(token);
                    
                    // Lấy thông tin user bằng email (oauth2 username = email, theo yêu cầu)
                    const usernameOrEmail = decoded.sub;
                    try {
                        const userResponse = await apiClient.get(`/user/info/${usernameOrEmail}`);
                        const userData = userResponse.data;
                        
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
                            id: userData.id || decoded.sub,
                            username: userData.username || decoded.sub,
                            email: userData.email || decoded.sub,
                            fullName: userData.fullName || (userData as any).firstname ? `${(userData as any).firstname || ''} ${(userData as any).lastname || ''}`.trim() : (decoded.name || decoded.sub),
                            phone: userData.phone || (userData as any).phoneNumber,
                            avatar: userData.avatar || (userData as any).avatarUrl,
                            balance: userData.balance || 0,
                            role: finalRole
                        };

                        localStorage.setItem('user', JSON.stringify(mappedData));
                        window.dispatchEvent(new Event('user-auth-change'));
                        
                        // Chuyển hướng theo role
                        if (mappedData.role === 'ROLE_ADMIN') {
                            navigate('/admin');
                        } else {
                            navigate('/');
                        }
                    } catch (apiError) {
                        console.error("Không lấy được thông tin user:", apiError);
                        // Fallback
                        let roleStr = 'ROLE_USER';
                        if (Array.isArray(decoded.role)) {
                            const tokenRole = decoded.role.some((r: any) => r.authority === 'ROLE_ADMIN');
                            if (tokenRole) roleStr = 'ROLE_ADMIN';
                        } else if (decoded.role === 'ROLE_ADMIN' || decoded.role === 'ADMIN') {
                            roleStr = 'ROLE_ADMIN';
                        }
                        
                        const fallbackData: UserInfo = {
                            id: decoded.sub,
                            username: decoded.sub,
                            email: decoded.sub,
                            fullName: decoded.name || decoded.sub,
                            role: roleStr,
                            balance: 0
                        };
                        localStorage.setItem('user', JSON.stringify(fallbackData));
                        window.dispatchEvent(new Event('user-auth-change'));
                        navigate('/');
                    }
                } catch (e) {
                    console.error("Invalid token format", e);
                    navigate('/login?error=InvalidToken');
                }
            } else {
                navigate('/login?error=NoToken');
            }
        };

        handleOAuth2Callback();
    }, [location, navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
            <p>Đang xử lý đăng nhập...</p>
        </div>
    );
};

export default OAuth2RedirectHandler;
