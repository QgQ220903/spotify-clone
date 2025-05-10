import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axiosInstance'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function Register() {
  // State quản lý thông tin đăng ký
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false) // Thêm state loading
  const navigate = useNavigate()

  // Hàm xử lý đăng ký (giữ nguyên logic)
  const handleRegister = async (e) => {
    e.preventDefault()
    setIsLoading(true) // Bật trạng thái loading

    try {
      await axios.post('auth/register/', {
        email,
        username,
        password,
      })

      // Hiển thị thông báo thành công
      toast.success('🎉 Đăng ký thành công! Mời bạn đăng nhập.', {
        position: 'top-right',
        autoClose: 3000,
      })

      // Chuyển hướng sau 3 giây
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      toast.error('❌ Lỗi đăng ký: ' + (err.response?.data?.detail || 'Đã xảy ra lỗi.'), {
        position: 'top-right',
        autoClose: 4000,
      })
    } finally {
      setIsLoading(false) // Tắt trạng thái loading
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black to-[#121212] flex items-center justify-center p-4">
      {/* Form đăng ký */}
      <div className="w-full max-w-md">
        {/* Card form */}
        <div className="bg-[#181818] rounded-xl shadow-2xl overflow-hidden">
          {/* Header với hình ảnh */}
          <div className="bg-gradient-to-r from-[#1DB954] to-[#1ed760] p-6 flex justify-center">
            <img
              src="https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_White.png"
              alt="Spotify Logo"
              className="h-16 w-16 object-contain"
            />
          </div>

          {/* Nội dung form */}
          <form onSubmit={handleRegister} className="p-8">
            <h1 className="text-2xl font-bold text-white mb-8 text-center">
              Đăng ký tài khoản Spotify
            </h1>

            {/* Nhập email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Địa chỉ email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email"
                className="w-full px-4 py-3 rounded bg-[#282828] text-white placeholder-gray-400 
                          focus:outline-none focus:ring-2 focus:ring-[#1DB954] focus:bg-[#333] transition"
                required
              />
            </div>

            {/* Nhập username */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                className="w-full px-4 py-3 rounded bg-[#282828] text-white placeholder-gray-400 
                          focus:outline-none focus:ring-2 focus:ring-[#1DB954] focus:bg-[#333] transition"
                required
              />
            </div>

            {/* Nhập mật khẩu */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full px-4 py-3 rounded bg-[#282828] text-white placeholder-gray-400 
                          focus:outline-none focus:ring-2 focus:ring-[#1DB954] focus:bg-[#333] transition"
                required
              />
            </div>

            {/* Nút đăng ký */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-full font-bold text-black transition mb-4
                        ${isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#1ed760] hover:bg-[#1fdf64] hover:scale-[1.02]'}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                'Đăng ký'
              )}
            </button>

            {/* Link đăng nhập */}
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Đã có tài khoản?{' '}
                <a
                  href="/login"
                  className="text-[#1ed760] hover:underline font-medium"
                >
                  Đăng nhập tại đây
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Bằng việc đăng ký, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của Spotify.</p>
        </div>
      </div>

      {/* Toast thông báo */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  )
}

export default Register