// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Sử dụng useCallback để tránh tạo hàm mới mỗi lần render
  const login = useCallback((userData) => {
    localStorage.setItem('adminToken', userData.token);
    setUser({
      username: userData.username,
      isAdmin: userData.isAdmin
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          username: decoded.username,
          isAdmin: decoded.is_admin
        });
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  }, [logout]); // Thêm logout vào dependencies

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}