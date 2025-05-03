import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axiosInstance'


const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const firstChar = user?.username?.[0]?.toUpperCase() || 'U'

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }

  const [avatarColor, setAvatarColor] = useState(getRandomColor())

  useEffect(() => {
    if (user) setAvatarColor(getRandomColor())
  }, [user])

  const goToAdminPanel = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const ADMIN_FRONTEND_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174';

      // 1. Kiểm tra token có tồn tại không
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      console.log('Sending token:', token); // Debug log

      // 2. Gọi API với headers đúng chuẩn
      const response = await axios.get(
        `${API_BASE_URL}/api/auth/admin/generate-token/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );

      window.location.href = `${ADMIN_FRONTEND_URL}/auth?token=${response.data.token}`;
    } catch (error) {
      console.error('Full error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response?.status === 401) {
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        logout();
        navigate('/login');
      } else {
        alert(error.response?.data?.detail || 'Lỗi khi truy cập trang quản trị');
      }
    }
  };
  return (
    <div className="w-full h-16 bg-[#0C0C0C] flex items-center justify-between px-4 md:px-6 lg:px-8">
      {/* Left */}
      <div className="flex items-center gap-2 md:gap-4">
        <img src={assets.spotify} alt="Spotify" className="w-8 h-8 md:w-11 md:h-11" />
        <div className="w-10 h-10 bg-[#181818] p-2 rounded-full flex items-center justify-center hover:opacity-80 cursor-pointer">
          <img className="w-5 h-5" src={assets.home} alt="Home" />
        </div>
        <div className="flex items-center bg-[#181818] text-gray-300 rounded-md p-1 w-60 md:w-110">
          <img className="w-4 h-4 cursor-pointer" src={assets.search} alt="Search" />
          <input
            type="text"
            placeholder="What do you want to play?"
            className="bg-transparent outline-none text-white px-2 flex-1 placeholder-gray-500 text-sm"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-4">
        {user ? (
          <>
            {/* Admin Button - Only show if user is admin */}
            {user?.isAdmin && (
              <button
                onClick={goToAdminPanel}
                className="bg-yellow-500 text-black font-bold px-3 py-1 rounded-full hover:bg-yellow-400 transition duration-200 text-sm"
              >
                Quản trị
              </button>
            )}

            <img
              className="w-5 h-5 opacity-70 hover:opacity-90 cursor-pointer"
              src={assets.bell}
              alt="Notifications"
            />
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer"
              style={{ backgroundColor: avatarColor, color: '#000' }}
              title={user.username}
            >
              {firstChar}
            </div>
            <button
              onClick={logout}
              className="border border-gray-300 text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-300 hover:text-black"
            >
              Đăng Xuất
            </button>
          </>
        ) : (
          <>
            <button
              className="text-gray-300 opacity-70 hover:opacity-100 text-sm"
              onClick={() => navigate('/register')}
            >
              Sign up
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-[#1DB954] text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#1ED760]"
            >
              Log in
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default Navbar