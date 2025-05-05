import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchAllPlaylistById } from "../service/PlaylistService";

const DisplayPlaylist = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState();

  useEffect(() => {
    fetchAllPlaylistById(id).then((res) => {
      console.log("ducnc2", res);
      if (res.status === 200 && res.data) {
        setPlaylist(res.data);
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
          {Array.isArray(playlist.songs) && playlist.songs.length > 0 && (
            <div className="px-6 mt-10 space-y-4">
              {playlist.songs.map((song, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-[#1a1a1a] hover:bg-[#2a2a2a] p-4 rounded-lg transition"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={song.thumbnail || "https://via.placeholder.com/48"}
                      alt="thumbnail"
                      className="w-12 h-12 rounded"
                    />
                    <div>
                      <p className="text-white font-medium">{song.title}</p>
                      <p className="text-sm text-white/60">{song.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white/60 text-sm">
                      {song.duration || "3:45"}
                    </span>
                    <button className="text-white/60 hover:text-white text-xl">
                      ⋯
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DisplayPlaylist;
