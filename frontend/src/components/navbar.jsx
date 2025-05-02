import React from 'react'
import { assets } from '../assets/assets'
import { useAuth } from '../context/AuthContext' // 👈 import AuthContext
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const firstChar = user?.username?.[0]?.toUpperCase() || 'U'

  // Hàm tạo màu ngẫu nhiên
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Tạo một state để lưu màu ngẫu nhiên
  const [avatarColor, setAvatarColor] = React.useState(getRandomColor());

  // Cập nhật màu ngẫu nhiên mỗi khi component mount (hoặc khi user thay đổi nếu cần)
  React.useEffect(() => {
    setAvatarColor(getRandomColor());
  }, [user]); // Thêm [user] vào dependency array nếu bạn muốn màu thay đổi khi user thay đổi

  return (
    <div className="w-full h-16 bg-[#0C0C0C] flex items-center justify-between px-4 md:px-6 lg:px-8">
      {/* Phần bên trái */}
      <div className="flex items-center gap-2 md:gap-4">
        <img src={assets.spotify} alt="Spotify" className="w-8 h-8 md:w-11 md:h-11" />
        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#181818] p-2 rounded-full flex items-center justify-center hover:opacity-80 cursor-pointer transition duration-200">
          <img className="w-4 h-4 md:w-5 md:h-5" src={assets.home} alt="Home" />
        </div>
        <div className="flex items-center bg-[#181818] text-gray-300 rounded-md md:rounded-2xl p-1 md:p-2 w-60 md:w-110 hover:opacity-80 transition duration-200">
          <img className="cursor-pointer w-4 h-4 md:w-5 md:h-5" src={assets.search} alt="Search" />
          <input
            type="text"
            placeholder="What do you want to play?"
            className="bg-transparent outline-none text-white px-2 md:px-3 flex-1 placeholder-gray-500 text-xs md:text-sm"
          />
        </div>
      </div>

      {/* Phần bên phải */}
      <div className="flex items-center gap-2 md:gap-4">
        {user ? (
          <div className="flex items-center gap-2 md:gap-4">
            <img
              className="w-4 h-4 md:w-5 md:h-5 opacity-70 hover:opacity-90 hover:scale-105 cursor-pointer transition duration-200"
              src={assets.bell}
              alt="Notifications"
            />
            <div
              className={`w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center opacity-70 hover:opacity-90 hover:scale-105 cursor-pointer font-bold text-xs md:text-sm`}
              style={{ backgroundColor: avatarColor, color: '#000' }} // Đặt màu nền ngẫu nhiên và chữ đen
              title={user.username}
            >
              {firstChar}
            </div>
            <button
              onClick={logout}
              className="bg-transparent border border-gray-300 text-gray-300 px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold hover:bg-gray-300 hover:text-black transition duration-200"
            >
              Đăng Xuất
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 md:gap-4">
            <button
              className="text-gray-300 opacity-70 hover:opacity-90 hover:scale-105 text-sm md:text-[15px] transition duration-200"
              onClick={() => navigate('/register')}
            >
              Sign up
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-[#1DB954] text-black font-semibold px-4 py-2 rounded-full shadow hover:bg-[#1ED760] hover:scale-105 transition duration-200 text-sm md:text-base"
            >
              Log in
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar