import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axiosInstance'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('auth/token/', {
        username,
        password,
      })

      localStorage.setItem('accessToken', res.data.access)
      localStorage.setItem('refreshToken', res.data.refresh)

      toast.success('🎉 Đăng nhập thành công!', {
        position: 'top-right',
        autoClose: 3000,
      })

      setTimeout(() => navigate('/'), 3000)
    } catch (err) {
      toast.error('❌ Sai thông tin đăng nhập.', {
        position: 'top-right',
        autoClose: 4000,
      })
    }
  }

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center text-white font-sans">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md px-8 py-10 bg-[#121212] rounded-2xl shadow-xl"
      >
        <div className="flex justify-center mb-8">
          <img
            src="https://appfairness.org/wp-content/uploads/2020/09/logo-spotify.png"
            alt="Spotify Logo"
            className="w-32"
          />
        </div>

        <label className="block text-sm font-bold mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Email or username"
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
          Continue
        </button>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <a href="/register" className="text-white underline hover:text-green-400">
            Sign up for Spotify
          </a>
        </p>
      </form>
      <ToastContainer />
    </div>
  )
}

export default Login
