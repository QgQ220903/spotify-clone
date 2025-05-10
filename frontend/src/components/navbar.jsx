import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axiosInstance'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const firstChar = user?.username?.[0]?.toUpperCase() || 'U'

  // Hàm tạo màu ngẫu nhiên cho avatar
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

  // Hàm chuyển đến trang quản trị
  const goToAdminPanel = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const ADMIN_FRONTEND_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174';

      // Kiểm tra token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Không tìm thấy token đăng nhập');
      }

      // Gọi API để lấy token quản trị
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
      console.error('Lỗi:', {
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
    <div className="w-full h-16 bg-[#0C0C0C] flex items-center justify-between px-4 md:px-6 lg:px-8 border-b border-gray-800">
      {/* Phần bên trái */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Logo Spotify */}
        <img
          src={assets.spotify}
          alt="Spotify"
          className="w-8 h-8 md:w-10 md:h-10 cursor-pointer hover:opacity-80 transition"
          onClick={() => navigate('/')}
        />

        {/* Nút Trang chủ */}
        <button
          className="w-10 h-10 bg-[#181818] p-2 rounded-full flex items-center justify-center hover:bg-[#282828] transition cursor-pointer"
          onClick={() => navigate('/')}
          title="Trang chủ"
        >
          <img className="w-5 h-5" src={assets.home} alt="Trang chủ" />
        </button>

        {/* Thanh tìm kiếm */}
        <div className="flex items-center bg-[#181818] text-gray-300 rounded-full p-1 w-60 md:w-80 hover:bg-[#282828] transition">
          <img className="w-4 h-4 ml-2" src={assets.search} alt="Tìm kiếm" />
          <input
            type="text"
            placeholder="Bạn muốn nghe gì?"
            className="bg-transparent outline-none text-white px-3 flex-1 placeholder-gray-500 text-sm"
          />
        </div>
      </div>

      {/* Phần bên phải */}
      <div className="flex items-center gap-2 md:gap-4">
        {user ? (
          <>
            {/* Nút quản trị (nếu là admin) */}
            {user?.isAdmin && (
              <button
                onClick={goToAdminPanel}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-3 py-1 rounded-full transition text-sm"
                title="Trang quản trị"
              >
                Quản trị
              </button>
            )}

            {/* Nút mạng xã hội */}
            <button
              onClick={() => navigate('/social')}
              className="bg-[#1DB954] hover:bg-[#1ED760] text-black px-3 py-1 rounded-full transition text-sm"
              title="Mạng xã hội"
            >
              MXH
            </button>

            {/* Thông báo */}
            <button
              className="w-9 h-9 rounded-full bg-[#181818] flex items-center justify-center hover:bg-[#282828] transition"
              title="Thông báo"
            >
              <img className="w-5 h-5" src={assets.bell} alt="Thông báo" />
            </button>

            {/* Avatar người dùng */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer hover:opacity-90 transition"
              style={{ backgroundColor: avatarColor, color: '#000' }}
              title={user.username}
              onClick={() => navigate('/profile')}
            >
              {firstChar}
            </div>

            {/* Nút đăng xuất */}
            <button
              onClick={logout}
              className="border border-gray-300 text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-300 hover:text-black transition"
              title="Đăng xuất"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            {/* Hiển thị khi chưa đăng nhập */}
            <button
              className="text-gray-300 hover:text-white text-sm font-medium"
              onClick={() => navigate('/register')}
            >
              Đăng ký
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-[#1DB954] hover:bg-[#1ED760] text-black px-4 py-2 rounded-full text-sm font-semibold transition"
            >
              Đăng nhập
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default Navbar