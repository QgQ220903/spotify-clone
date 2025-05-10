import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PlayerContextProvider from './context/PlayerContextProvider.jsx'
import LoginProvider from './context/Login.jsx'
import { AuthProvider } from './context/AuthContext.jsx' // 👈 import

import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import Chat from './pages/Chat.jsx'
import Friends from './pages/Friends.jsx'
import Social from './pages/Social.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PlayerContextProvider>
        <LoginProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/*" element={<App />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/social" element={<Social />} />
            </Routes>
          </AuthProvider>
        </LoginProvider>
      </PlayerContextProvider>
    </BrowserRouter>
  </StrictMode>
)
