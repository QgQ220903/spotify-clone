import { useContext, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/navbar'
import Sidebar from './components/sidebar'
import Player from './components/Player'
import Display from './components/Display'
import { PlayerContext } from './context/PlayerContextProvider'
import Displayvideo from './components/DisplayVideo'

function MainLayout({ children }) {
  const { audioRef, track } = useContext(PlayerContext)
  const [showVideo, setShowVideo] = useState(false)
  
  const toggleVideo = () => {
    setShowVideo(prev => !prev)
  }

  return (
    <div className='w-screen h-screen bg-black'>
      <div className='h-[9%] w-[100%]'>
        <Navbar />
      </div>
      <div className='h-[91%] flex items-center gap-2'>
        <Sidebar />
        <div className='h-[100%] w-[100%] flex items-center'>
          {children}
          {showVideo && <Displayvideo toggleVideo={toggleVideo} />}
        </div>
      </div>
      {track && (
        <div 
          className='
            fixed left-0 bottom-0 
            h-[80px] w-full 
            bg-gray-900 border-t border-gray-700
            z-40'
        >
          <Player toggleVideo={toggleVideo} />
          <audio ref={audioRef} src={track?.file || ''} preload='auto' />
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <>
      <Routes>
        <Route 
          path="/" 
          element={
            <MainLayout>
              <Display />
            </MainLayout>
          } 
        />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </>
  )
}

export default App