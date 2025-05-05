import React, { useContext,useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchAllPlaylistById } from "../service/PlaylistService";
import { PlayerContext } from "../context/PlayerContextProvider";

const DisplayPlaylist = () => {
  const { playWithSong } = useContext(PlayerContext);
  const { id } = useParams();
  const [playlist, setPlaylist] = useState();
  const [songs, setSongs] = useState();

  useEffect(() => {
    fetchAllPlaylistById(id).then((res) => {
      console.log("ducnc2", res);
      if (res.status === 200 && res.data) {
        setPlaylist(res.data);
        setSongs(res.data.songs);
      }
    });
  }, [id]);

  return (
    <>
      {playlist && (
        <div className="min-h-screen w-full bg-gradient-to-b from-[#333] via-[#111] to-black text-white">
          {/* Playlist Header */}
          <h1>{id}</h1>
          <div className="flex items-end gap-6 p-6">
            {/* Playlist Cover */}
            <div className="w-52 h-52 bg-neutral-700 flex items-center justify-center rounded shadow-lg">
              <svg
                className="w-16 h-16 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19V6l12-2v13M9 19l12-2"
                />
              </svg>
            </div>

            {/* Playlist Info */}
            <div className="flex flex-col justify-end">
              <p className="uppercase text-xs font-semibold text-white/60">
                {playlist.name}
              </p>
              <h1 className="text-6xl font-bold mt-2">{playlist.name}</h1>
              <p className="text-white/70 mt-4 text-sm">
                {playlist.songs.length + " bài hát"}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between px-6 border-t border-white/10 pt-6">
            <div className="flex items-center gap-5">
              <button className="w-14 h-14 bg-green-500 rounded-full hover:scale-105 transition transform text-black text-3xl flex items-center justify-center shadow-lg">
                ▶
              </button>
              <button className="text-white/80 text-xl hover:text-white">👤</button>
              <button className="text-white/80 text-xl hover:text-white">⋯</button>
            </div>
            {/* <button className="text-white/60 hover:text-white">Rút gọn</button> */}
          </div>

          {/* Search Input */}
          <div className="px-6 mt-10">
            <h2 className="text-lg font-semibold mb-4">
              Hãy cùng tìm nội dung cho danh sách phát của bạn
            </h2>
            <input
              type="text"
              placeholder="Tìm bài hát và tập podcast"
              className="w-full p-4 bg-neutral-800 rounded-md placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Danh sách bài hát */}
          <div className="pb-24"> {/* Add padding at the bottom for better UX */}
          {songs && songs.length > 0 && songs.map((item, index) => (
            <div
              key={index}
              className="group grid grid-cols-[1fr_2fr_1fr_30px] p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer"
            >
              <div className="flex items-center col-span-1 relative">
                {/* Play icon on hover, number when not hovering */}
                <div 
                  onClick={() => playWithSong(item)}
                  className="mr-4 w-5 h-5 flex items-center justify-center text-[#a7a7a7]"
                >
                  <span className="group-hover:hidden">{index + 1}</span>
                  <svg 
                    className="hidden group-hover:block w-5 h-5" 
                    viewBox="0 0 24 24" 
                    fill="white"
                  >
                    <path d="M8 5.14v14l11-7-11-7z" />
                  </svg>
                </div>
                
                <img className="w-10 mr-5" src={item.thumbnail} alt="" />
                
                <div className="flex-grow">
                  <span 
                    onClick={() => playWithSong(item)}
                    className="block text-white text-[15px] hover:underline font-semibold"
                  >
                    {item.title}
                  </span>
                  <span 
                    onClick={() => playWithSong(item)}
                    className="block text-white text-[14px] font-semibold hover:opacity-100 opacity-60 hover:underline"
                  >
                    {item.list_name || "Unknown Artist"}
                  </span>
                </div>
              </div>
              
              <div className="col-span-1 flex items-center justify-center" onClick={() => playWithSong(item)}>
                {/* <p className="text-[15px] font-semibold">{albumData.title}</p> */}
              </div>
              <div className="col-span-1 flex items-center justify-center" onClick={() => playWithSong(item)}>
                <p className="text-[15px] font-semibold">
                  {item.duration || "3:45"}
                </p>
              </div>
              {/* Add to playlist button column */}
              <div className="col-span-1 flex items-center justify-center">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(`Add "${item.title}" to playlist`);
                  }}
                  className="hidden group-hover:block text-white opacity-70 hover:opacity-100"
                  title="Add to playlist"
                >
                <div className="w-6 h-6 flex items-center justify-center border-2 border-gray-400 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 5c.55 0 1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1z"/>
                  </svg>
                </div>
                </button>
              </div>
            </div>
          ))}
        </div>
        </div>
      )}
    </>
  );
};

export default DisplayPlaylist;
