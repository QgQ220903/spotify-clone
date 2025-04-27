import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { albumsData, assets, songData } from "../assets/assets";
import { PlayerContext } from "../context/PlayerContext";

const DisplayAlbum=() =>{
    const {id} =useParams();
    const albumData = albumsData[id];
    const {playWithId} =useContext(PlayerContext)
    return(
        <>
        <div className="mt-3 flex gap-8 flex-col md:flex-row md:items-end">
            <img className="rounded-lg w-48" src={albumData.image} alt="" />
            <div className="flex flex-col">
                <p>Playlist</p>
                <h2 className="text-5xl font-bold mb-4 md:text-7xl">{albumData.name}</h2>
                <h4>{albumData.desc}</h4>
                <p className="mt-1">
                    <img className="inline-block w-6 h-6" src={assets.spotify_logo} alt="" />
                    <b className="ml-1">Spotify</b>
                    <b className="font-semibold text-[14px] text-gray-300"> • 50 songs, about 3 hour</b>
                </p>
            </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 mt-10 mb-4 pl-2 text-[#a7a7a7]">
          <p className="font-semibold"><b className="mr-4 font-normal">#</b>Title</p>
          <p className="font-semibold">Album</p>
          <p className="hidden sm:block ml-5 font-semibold">Date Added</p>
          <img className="m-auto w-4" src={assets.clock} alt="" />
        </div>
        <hr />
        {
            songData.map((item,index)=>
                <div onClick={()=>playWithId(item.id)} key={index} className="grid grid-cols-3 sm:grid-cols-4 gap-5 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer">
            <div className="flex items-center col-span-1">
              <b className="mr-4 text-[#a7a7a7]">{index + 1}</b>
              <img className="w-10 mr-5" src={item.image} alt="" />
              <div>
              <span className="block text-white text-[15px] hover:underline font-semibold">{item.name}</span>
              <span className="block text-white text-[14px] font-semibold hover:opacity-100 opacity-60 hover:underline">{item.desc}</span>
              </div>

            </div>
            <div className="col-span-1">
              <p className="text-[15px] font-semibold">{albumData.name}</p>
            </div>
            <div className="col-span-1 hidden sm:block ml-5">
              <p className="text-[15px] font-semibold">5 days ago</p>
            </div>
            <div className="col-span-1">
              <p className="text-[15px] text-center font-semibold">{item.duration}</p>
            </div>
          </div>
          
            )
        }
        </>
        
    )
}
export default DisplayAlbum