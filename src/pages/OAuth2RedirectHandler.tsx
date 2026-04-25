import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import type { DecodedToken } from '../services/auth';
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
                        localStorage.setItem('user', JSON.stringify(userData));
                        window.dispatchEvent(new Event('user-auth-change'));
                        
                        // Chuyển hướng theo role
                        if (userData.role === 'ADMIN') {
                            navigate('/admin');
                        } else {
                            navigate('/');
                        }
                    } catch (apiError) {
                        console.error("Không lấy được thông tin user:", apiError);
                        // Fallback
                        const fallbackData = {
                            id: decoded.sub,
                            email: decoded.sub,
                            name: decoded.name || decoded.sub,
                            role: decoded.role || 'USER'
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
