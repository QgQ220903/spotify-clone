import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axiosInstance'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function Register() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      await axios.post('auth/register/', {
        email,
        username,
        password,
      })

      toast.success('🎉 Đăng ký thành công! Mời bạn đăng nhập.', {
        position: 'top-right',
        autoClose: 3000,
      })

      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      toast.error('❌ Lỗi đăng ký: ' + (err.response?.data?.detail || 'Đã xảy ra lỗi.'), {
        position: 'top-right',
        autoClose: 4000,
      })
    }
  }

  return (
    <>
      <div className="h-screen w-screen bg-black flex items-center justify-center text-white font-sans">
        <form
          onSubmit={handleRegister}
          className="w-full max-w-md px-8 py-10 bg-[#121212] rounded-2xl shadow-xl"
        >
          {/* Logo Spotify */}
          <div className="flex justify-center mb-8">
            <img
              src="https://appfairness.org/wp-content/uploads/2020/09/logo-spotify.png"
              alt="Spotify Logo"
              className="w-32"
            />
          </div>

          <label className="block text-sm font-bold mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full mb-4 p-3 rounded border border-gray-700 bg-black text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <label className="block text-sm font-bold mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full mb-4 p-3 rounded border border-gray-700 bg-black text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />


          <label className="block text-sm font-bold mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full mb-6 p-3 rounded border border-gray-700 bg-black text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <button
            type="submit"
            className="w-full py-3 bg-[#1ed760] hover:bg-[#1fdf64] text-black font-bold rounded-full transition duration-200"
          >
            Sign Up
          </button>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <a href="/login" className="text-white underline hover:text-green-400">
              Log in here
            </a>
          </p>
        </form>
      </div>
      <ToastContainer />
    </>
  )
}

export default Register
