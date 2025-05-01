import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import PlayerContextProvider from './context/PlayerContextProvider.jsx'
import LoginProvider from './context/Login.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PlayerContextProvider>
        <LoginProvider>
          <App />
        </LoginProvider>
      </PlayerContextProvider>
    </BrowserRouter>
  </StrictMode>,
)
