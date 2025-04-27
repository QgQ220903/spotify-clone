import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { PlayerContext } from "../context/PlayerContext";

const DisplayVideo = ({toggleVideo}) =>{
    const {track,videoRef} = useContext(PlayerContext);
    return(
        <div className="bg-[#121212] w-[80%] h-full relative">
          <div class="absolute flex items-center justify-between w-full text-white p-3 rounded-lg z-50 ">
        <div class="font-bold hover:underline font-semibold cursor-pointer uppercase w-[30px]">{track.desc}</div>
        <div class="flex gap-4">
             <div class="cursor-pointer relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-400 transition duration-200">
             <button class="text-lg text-[20px] cursor-pointer ">...</button>
             </div>
             <div class="cursor-pointer relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-400 transition duration-200">
             <button onClick={()=>toggleVideo()} class="text-lg cursor-pointer" >✕</button>
             </div>     
        </div>
        </div>
        <div className="w-full h-full flex items-start z-20">
        <video ref={videoRef} className="w-full h-auto" preload="metadata" muted playsInline>
          <source  src={track.video} type="video/mp4" />
          Trình duyệt không hỗ trợ video.
        </video>
      </div>
    </div>
    )
}
export default DisplayVideo