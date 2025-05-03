// src/pages/AuthHandler.jsx
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';

const AuthHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      try {
        const decoded = jwtDecode(token);

        // Kiểm tra token hợp lệ trước khi login
        if (decoded.exp * 1000 < Date.now()) {
          throw new Error('Token expired');
        }

        login({
          username: decoded.username,
          isAdmin: decoded.is_admin,
          token: token
        });

        // Chuyển hướng sau khi xử lý xong
        setTimeout(() => navigate('/'), 100); // Thêm delay nhỏ
      } catch (error) {
        console.error('Token invalid', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, login]); // Đảm bảo dependencies đúng

  return <div>Đang xử lý đăng nhập...</div>;
};

export default AuthHandler;