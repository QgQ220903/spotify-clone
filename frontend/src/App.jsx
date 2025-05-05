import { useContext, useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar'
import Sidebar from './components/sidebar'
import Player from './components/Player'
import Display from './components/Display'
import { PlayerContext } from './context/PlayerContextProvider'
import Displayvideo from './components/DisplayVideo'
import AIChatPage from './pages/AIChatPage'

function App() {
  const { audioRef, track } = useContext(PlayerContext)
  const [showVideo, setShowVideo] = useState(false);
  const toggleVideo = () => {
    setShowVideo(prev => {
      console.log("Trạng thái trước:", prev);
      return !prev;
    });
  };

  return (
    <>
      <div className='w-screen h-screen bg-black'>
        <div className='h-[9%] w-[100%]'>
          <Navbar />
        </div>
        <div className='h-[91%] flex items-center gap-2'>
          <Sidebar />
          <div className='h-[100%] w-[100%] flex items-center'>
            <Display />
            {showVideo && <Displayvideo toggleVideo={toggleVideo} />}
          </div>
        </div>
        <div className='mt-4'>
          <Player toggleVideo={toggleVideo} />
          <audio ref={audioRef} src={track?.file || ''} preload='auto'></audio>
        </div>
      </div>

      {/* Route riêng cho trang AI chat */}
      <Routes>
        <Route path="/ai-chat" element={<AIChatPage />} />
      </Routes>
    </>
  );
}

export default App
