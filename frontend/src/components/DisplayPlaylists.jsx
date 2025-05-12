import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchAllPlaylistById, getAllSongs, putPlaylistAPI } from "../service/PlaylistService";
import { PlayerContext } from "../context/PlayerContextProvider";
import Fuse from "fuse.js";

const DisplayPlaylist = () => {
  const { playWithSong } = useContext(PlayerContext);
  const { id } = useParams();
  const [playlist, setPlaylist] = useState();
  const [songs, setSongs] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSongs, setFilteredSongs] = useState([]);

  useEffect(() => {
    fetchAllPlaylistById(id).then((res) => {
      if (res.status === 200 && res.data) {
        setPlaylist(res.data);
        const filteredSongs = res.data.songs.map((item) => {
          item.list_name = item.artists.map((a) => a.name).join(", ");
          return item;
        });
        setSongs(filteredSongs || []);
      }
    });

    getAllSongs().then((res) => {
      const filteredSongs = res.data.results.map((item) => {
        item.list_name = item.artists.map((a) => a.name).join(", ");
        return item;
      });
      setAllSongs(filteredSongs);
      setFilteredSongs(filteredSongs);
    });
  }, [id]);

  useEffect(() => {
    if (!allSongs || allSongs.length === 0) return;

    if (searchQuery.trim() === "") {
      setFilteredSongs(allSongs);
      return;
    }

    const fuse = new Fuse(allSongs, {
      keys: ["title", "list_name"],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });

    const result = fuse.search(searchQuery).map(({ item }) => item);
    setFilteredSongs(result);
  }, [searchQuery, allSongs]);

  const songsID = songs ? songs.map((item) => item.id) : [];

  const handleDelete = (item) => {
    if (!songsID.includes(item.id)) {
      alert("Không tồn tại");
      return;
    }

    const updatedSongsID = songsID.filter((x) => x !== item.id);
    const obj = {
      song_ids: updatedSongsID,
      name: playlist.name,
    };
    putPlaylistAPI(id, obj).then((res) => {
      if (res.status === 200 && res.data) {
        setPlaylist(res.data);
        const filteredSongs = res.data.songs.map((item) => {
          item.list_name = item.artists.map((a) => a.name).join(", ");
          return item;
        });
        setSongs(filteredSongs || []);
      }
    });
  };

  const handleAddSongToPlayList = (item) => {
    if (songsID.includes(item.id)) {
      alert("đã có trong danh sách");
      return;
    }

    const updatedSongsID = [...songsID, item.id];
    const obj = {
      song_ids: updatedSongsID,
      name: playlist.name,
    };
    putPlaylistAPI(id, obj).then((res) => {
      if (res.status === 200 && res.data) {
        setPlaylist(res.data);
        const filteredSongs = res.data.songs.map((item) => {
          item.list_name = item.artists.map((a) => a.name).join(", ");
          return item;
        });
        setSongs(filteredSongs || []);
      }
    });
  };

  return (
    <>
      {playlist && (
        <div className="min-h-screen w-full bg-gradient-to-b from-[#121212] to-black text-white pb-32">
          {/* Playlist Header */}
          <div className="flex items-end gap-6 p-6 pt-16 bg-gradient-to-b from-[#2e2e2e] to-[#121212]">
            <div className="w-52 h-52 bg-neutral-800 flex items-center justify-center rounded-lg shadow-xl">
              {songs.length > 0 && songs[0]?.thumbnail ? (
                <img
                  src={songs[0].thumbnail}
                  className="w-full h-full object-cover rounded-lg"
                  alt="Playlist cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-white"
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
              )}
            </div>
            <div className="flex flex-col justify-end">
              <p className="text-xs font-semibold text-white/60">PLAYLIST</p>
              <h1 className="text-5xl font-bold mt-2 mb-4">{playlist.name}</h1>
              <p className="text-white/70 text-sm">{songs.length} bài hát</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="px-6 py-4 sticky top-0 bg-[#121212]/90 backdrop-blur-sm z-10">
            <div className="flex items-center gap-5">
              <button
                className="w-12 h-12 bg-green-500 rounded-full hover:scale-105 transition-all text-black flex items-center justify-center shadow-lg hover:bg-green-400"
                onClick={() => songs.length > 0 && playWithSong(songs[0])}
              >
                <svg className="w-6 h-6 ml-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Danh sách bài hát */}
          <div className="px-6 py-6">
            <h2 className="text-xl font-bold mb-4">Bài hát trong playlist</h2>

            {songs && songs.length > 0 ? (
              <div className="rounded-lg overflow-hidden">
                {songs.map((item, index) => (
                  <div
                    key={index}
                    className="group grid grid-cols-12 items-center p-3 hover:bg-white/10 transition-colors rounded cursor-pointer"
                  >
                    <div className="col-span-1 flex items-center justify-center text-white/50 group-hover:text-white">
                      <span className="group-hover:hidden">{index + 1}</span>
                      <button
                        onClick={() => playWithSong(item)}
                        className="hidden group-hover:block w-8 h-8 flex items-center justify-center"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>

                    <div className="col-span-5 flex items-center gap-3">
                      <img
                        src={item.thumbnail}
                        className="w-10 h-10 rounded object-cover"
                        alt={item.title}
                      />
                      <div>
                        <p className="font-medium text-white line-clamp-1">{item.title}</p>
                        <p className="text-sm text-white/70 line-clamp-1">{item.list_name || "Unknown Artist"}</p>
                      </div>
                    </div>

                    <div className="col-span-5"></div>

                    <div className="col-span-1 flex items-center justify-end gap-2">
                      <p className="text-sm text-white/50">{item.duration || "3:45"}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item);
                        }}
                        className="hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10"
                        title="Remove from playlist"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-white/70 hover:text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M6 12c0-.55.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1H7c-.55 0-1-.45-1-1z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-white/70">Không có bài hát nào trong playlist</p>
              </div>
            )}

            {/* Search Section */}
            <div className="mt-10 mb-6">
              <h2 className="text-xl font-bold mb-4">Thêm bài hát vào playlist</h2>
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Tìm bài hát..."
                  className="w-full p-3 pl-10 bg-neutral-800 rounded-lg placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg
                  className="w-5 h-5 text-white/50 absolute left-3 top-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filtered Songs Results */}
              {filteredSongs && filteredSongs.length > 0 ? (
                <div className="rounded-lg overflow-hidden">
                  {filteredSongs.map((item, index) => (
                    <div
                      key={index}
                      className="group grid grid-cols-12 items-center p-3 hover:bg-white/10 transition-colors rounded cursor-pointer"
                    >
                      <div className="col-span-1 flex items-center justify-center text-white/50 group-hover:text-white">
                        <span className="group-hover:hidden">{index + 1}</span>
                        <button
                          onClick={() => playWithSong(item)}
                          className="hidden group-hover:block w-8 h-8 flex items-center justify-center"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </button>
                      </div>

                      <div className="col-span-5 flex items-center gap-3">
                        <img
                          src={item.thumbnail}
                          className="w-10 h-10 rounded object-cover"
                          alt={item.title}
                        />
                        <div>
                          <p className="font-medium text-white line-clamp-1">{item.title}</p>
                          <p className="text-sm text-white/70 line-clamp-1">{item.list_name || "Unknown Artist"}</p>
                        </div>
                      </div>

                      <div className="col-span-5"></div>

                      <div className="col-span-1 flex items-center justify-end gap-2">
                        <p className="text-sm text-white/50">{item.duration || "3:45"}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddSongToPlayList(item);
                          }}
                          className="hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10"
                          title="Add to playlist"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 text-white/70 hover:text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 5c.55 0 1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="py-10 text-center">
                  <p className="text-white/70">Không tìm thấy bài hát phù hợp</p>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-white/70">Tìm kiếm bài hát để thêm vào playlist</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DisplayPlaylist;