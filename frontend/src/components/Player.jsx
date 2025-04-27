import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { PlayerContext } from "../context/PlayerContext";

const Player =({ toggleVideo }) => {
       const {track,seekBar, seekBg, playStatus, play, pause, time, previous, next, seekSong, volumeBg, volumeBar, startVolumeDrag,volume, handleVolumeChange} = useContext(PlayerContext);
    return (
        <div className='h-10% bg-black flex justify-between items-center text-white px-4'>
            <div className="hidden lg:flex items-center gap-4">
                <img className='w-15 rounded-lg' src={track.image} alt=""/>
                <div>
                      <p className="text-white text-sm font-semibold">{track.name}</p>
                      <p className="text-gray-400 text-[13px] font-normal text-left">{track.desc}</p>
                </div>
                <div>
                    <img className="w-4 h-4 opacity-60 hover:opacity-100  hover:scale-105" src={assets.add} alt="" />
                </div>
            </div>
         <div className="flex flex-col items-center gap-1 mr-7">
            <div className="flex gap-5 items-center justify-center">
                <img className="w-5 h-5 cursor-pointer opacity-60 hover:opacity-100  hover:scale-105" src={assets.arrowsong} alt="" />
                <img onClick={previous} className="w-7 h-7 cursor-pointer opacity-60 hover:opacity-100 hover:scale-105" src={assets.prev} alt="" />
               {playStatus
                ?(<div onClick={pause} className="cursor-pointer w-8 h-8 bg-white flex items-center justify-center rounded-full hover:scale-105">
                 <img  className="w-3.5 h-3.5 " src={assets.pause} alt="" />
                 </div>)
                 :(<div onClick={play} className="cursor-pointer w-8 h-8 bg-white flex items-center justify-center rounded-full hover:scale-105">
                    <img className="w-3.5 h-3.5 " src={assets.play} alt="" />
                    </div>)
                } 
                    <img onClick={next} className="w-7 h-7 cursor-pointer opacity-60 hover:opacity-100 hover:scale-105" src={assets.next} alt="" />
                    <img className="w-6 h-6 cursor-pointer opacity-60 hover:opacity-100 hover:scale-105" src={assets.loop} alt="" />
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-[13px] mb-1">{time.currentTime.minute}:{time.currentTime.second}</p>
                    <div ref={seekBg} onClick={seekSong} className="w-[470px] bg-[#494a4a] rounded-full cursor-pointer">
                        <hr ref={seekBar} className="h-1 border-none w-0 bg-green-500 rounded-full"></hr>
                    </div>
                    <p className="text-[13px] mb-1">{time.totaltime.minute}:{time.totaltime.second}</p>
                </div>
            </div>
        <div className="hidden lg:flex items-center gap-2 opacity-75">
            <div onClick={toggleVideo} className="w-4.5 h-4.5 rounded border-2 border-gray-500 flex items-center justify-center cursor-pointer hover:opacity-100 opacity-60 hover:scale-105">
            <img onClick={toggleVideo} className="w-1.5 h-1.5" src={assets.plays} alt="" />
            </div>
            <img className='w-4.5 h-4.5 cursor-pointer hover:opacity-100 opacity-60 hover:scale-105' src={assets.mic} alt="" />
            <img className='w-6 h-6 cursor-pointer hover:opacity-100 opacity-60 hover:scale-105' src={assets.queue} alt="" />
            <img className='w-5 h-5 cursor-pointer hover:opacity-100 opacity-60 hover:scale-105' src={assets.connect} alt="" />
            <img className='w-5 h-5 cursor-pointer hover:opacity-100 opacity-60 hover:scale-105' src={assets.volume} alt="" />
            <div ref={volumeBg} onMouseDown={startVolumeDrag} onClick={handleVolumeChange} className="w-[100px] bg-[#494a4a] rounded-full cursor-pointer">
            <hr ref={volumeBar} className="h-1 border-none w-0 bg-green-500 rounded-full" style={{ width: `${volume}%` }}></hr>
            </div>
            <img className='w-5 h-5 cursor-pointer hover:opacity-100 opacity-60 hover:scale-105' src={assets.miniplayer} alt="" />
            <img className='w-4.5 h-4.5 cursor-pointer hover:opacity-100 opacity-60 hover:scale-105' src={assets.zoom} alt="" />

        </div>
         </div>
    )
}

export default Player