import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axiosInstance'
import AIChat from './AIChat/AIChat' // Import component chat đã chỉnh sửa

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const firstChar = user?.username?.[0]?.toUpperCase() || 'U'
  const [showChat, setShowChat] = useState(false)

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

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

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
    <div className="w-full h-16 bg-[#0C0C0C] flex items-center justify-between px-4 md:px-6 lg:px-8 relative">
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
            {/* Chatbot Icon */}
            <div className="relative">
              <button
                onClick={() => setShowChat(!showChat)}
                className="p-2 rounded-full hover:bg-[#282828] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </button>
              
              {/* Chatbot Dropdown */}
              {showChat && (
                <div className="absolute right-0 top-12 w-80 h-[500px] bg-[#181818] rounded-lg shadow-xl z-50 flex flex-col border border-gray-700">
                  <div className="flex justify-between items-center p-3 border-b border-gray-700">
                    <h3 className="font-semibold text-white">Trợ lý AI</h3>
                    <button 
                      onClick={() => setShowChat(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3">
                    <AIChat compactMode={true} />
                  </div>
                </div>
              )}
            </div>

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