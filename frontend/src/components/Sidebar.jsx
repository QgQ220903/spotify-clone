import React, { useEffect, useState, useRef } from "react";
import { assets } from "../assets/assets";
import { createPlaylistAPI, fetchAllPlaylist, updatePlaylistAPI, deletePlaylistAPI } from "../service/PlaylistService";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState([]);
  const [count, setCount] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [contextMenu, setContextMenu] = useState(null);
  const [isRenameFormOpen, setIsRenameFormOpen] = useState(false);
  const [renamePlaylistId, setRenamePlaylistId] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const contextMenuRef = useRef(null);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navigate = useNavigate();

  useEffect(() => {
    fetchAllPlaylist().then((res) => {
      if (res.status === 200 && res.data && res.data.results) {
        setPlaylists(res.data.results);
        setFilteredPlaylists(res.data.results);
        setCount(res.data.count);
      }
    });
  }, []);

  const fuse = new Fuse(playlists, {
    keys: ["name"],
    threshold: 0.3,
  });

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPlaylists(playlists);
    } else {
      const results = fuse.search(searchQuery).map((result) => result.item);
      setFilteredPlaylists(results);
    }
  }, [searchQuery, playlists]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getPlaylistThumbnail = (playlist) => {
    if (playlist.songs && playlist.songs.length > 0 && playlist.songs[0].thumbnail) {
      return playlist.songs[0].thumbnail;
    }
    return assets.music_icon;
  };

  const handleCreatePlaylist = () => {
    const tmp = {
      songs: [],
      name: playlistName || `Danh sách phát của tôi #${count + 1}`,
      is_public: true,
      user: localStorage.getItem("userId"),
    };

    createPlaylistAPI(tmp).then((res) => {
      if (res.status === 201 && res.data) {
        setPlaylists((prev) => [...prev, res.data]);
        setFilteredPlaylists((prev) => [...prev, res.data]);
        setCount(playlists.length + 1);
        setIsFormOpen(false);
        setPlaylistName("");
      }
    });
  };

  const handleRenamePlaylist = () => {
    if (!newPlaylistName.trim()) return;

    updatePlaylistAPI(renamePlaylistId, { name: newPlaylistName }).then((res) => {
      if (res.status === 200 && res.data) {
        setPlaylists((prev) =>
          prev.map((playlist) =>
            playlist.id === renamePlaylistId ? { ...playlist, name: newPlaylistName } : playlist
          )
        );
        setFilteredPlaylists((prev) =>
          prev.map((playlist) =>
            playlist.id === renamePlaylistId ? { ...playlist, name: newPlaylistName } : playlist
          )
        );
        setIsRenameFormOpen(false);
        setNewPlaylistName("");
        setRenamePlaylistId(null);
      }
    });
  };

  const handleDeletePlaylist = (playlistId) => {
    deletePlaylistAPI(playlistId).then((res) => {
      if (res.status === 204) {
        setPlaylists((prev) => prev.filter((playlist) => playlist.id !== playlistId));
        setFilteredPlaylists((prev) => prev.filter((playlist) => playlist.id !== playlistId));
        setCount((prev) => prev - 1);
        setContextMenu(null);
      }
    });
  };

  const openForm = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setPlaylistName("");
  };

  const openRenameForm = (playlistId, currentName) => {
    setRenamePlaylistId(playlistId);
    setNewPlaylistName(currentName);
    setIsRenameFormOpen(true);
    setContextMenu(null);
  };

  const closeRenameForm = () => {
    setIsRenameFormOpen(false);
    setNewPlaylistName("");
    setRenamePlaylistId(null);
  };

  const handleContextMenu = (event, playlist) => {
    event.preventDefault();
    setContextMenu({
      x: event.pageX,
      y: event.pageY,
      playlistId: playlist.id,
      playlistName: playlist.name,
    });
  };

  if (isCollapsed) {
    return (
      <div className="bg-[#121212] w-[80px] h-full flex-col text-white hidden lg:flex items-center pt-3 gap-4 border-r border-[#282828]">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-[#282828] rounded-full transition-transform hover:scale-105"
        >
          <img src={assets.rightarrow} className="w-5 h-5" alt="Expand" />
        </button>
        <button
          onClick={openForm}
          className="p-2 hover:bg-[#282828] rounded-full transition-transform hover:scale-105"
          title="Tạo playlist mới"
        >
          <img src={assets.plus} className="w-5 h-5" alt="Add" />
        </button>
        <div className="bg-gradient-to-br from-[#450af5] to-[#8e8ee5] p-3 rounded-md cursor-pointer hover:opacity-90 transition-all">
          <img src={assets.heart_icon} className="w-5 h-5" alt="Liked" />
        </div>
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="p-3 bg-[#282828] rounded-md hover:bg-[#383838] transition-colors"
          >
            <img src={assets.music_icon} className="w-5 h-5 opacity-70" alt="Playlist" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[#121212] w-[400px] h-full flex-col text-white hidden lg:flex rounded-lg border-r border-[#282828]">
      <div className="p-4 flex items-center justify-between sticky top-0 bg-[#121212] z-10 border-b border-[#282828]">
        <div className="flex items-center gap-4">
          <p className="font-bold text-xl text-white">Thư viện</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="p-1 rounded-full hover:bg-[#282828] transition-colors"
            onClick={openForm}
            title="Tạo playlist mới"
          >
            <img src={assets.plus} className="w-5 h-5 opacity-70 hover:opacity-100" alt="Add" />
          </button>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-[#282828] transition-colors"
            title="Thu gọn sidebar"
          >
            <img
              src={assets.rightarrow}
              className="w-5 h-5 opacity-70 hover:opacity-100 rotate-180"
              alt="Collapse"
            />
          </button>
        </div>
      </div>

      {(isFormOpen || isRenameFormOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#282828] p-6 rounded-xl w-[400px] shadow-2xl border border-[#383838]">
            <h2 className="text-xl font-bold mb-4 text-white">
              {isFormOpen ? "Tạo danh sách phát mới" : "Đổi tên danh sách phát"}
            </h2>
            <input
              type="text"
              value={isFormOpen ? playlistName : newPlaylistName}
              onChange={(e) => (isFormOpen ? setPlaylistName(e.target.value) : setNewPlaylistName(e.target.value))}
              placeholder={isFormOpen ? "Tên danh sách phát" : "Tên danh sách phát mới"}
              className="w-full p-3 mb-4 bg-[#3e3e3e] text-white rounded-lg outline-none placeholder-gray-400 focus:ring-2 focus:ring-[#1ed760] transition border border-[#4a4a4a]"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={isFormOpen ? closeForm : closeRenameForm}
                className="px-4 py-2 bg-[#4a4a4a] text-white rounded-lg hover:bg-[#5a5a5a] transition"
              >
                Hủy
              </button>
              <button
                onClick={isFormOpen ? handleCreatePlaylist : handleRenamePlaylist}
                className="px-4 py-2 bg-[#1ed760] text-black font-medium rounded-lg hover:bg-[#1db954] disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105 active:scale-95"
                disabled={isFormOpen ? !playlistName.trim() : !newPlaylistName.trim()}
              >
                {isFormOpen ? "Tạo" : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
        <button className="bg-[#2a2a2a] text-sm px-3 py-1 rounded-full whitespace-nowrap hover:bg-[#3a3a3a] transition-colors">
          Danh sách phát
        </button>
        <button className="text-sm px-3 py-1 rounded-full whitespace-nowrap hover:bg-[#2a2a2a] opacity-70 hover:opacity-100 transition-colors">
          Nghệ sĩ
        </button>
        <button className="text-sm px-3 py-1 rounded-full whitespace-nowrap hover:bg-[#2a2a2a] opacity-70 hover:opacity-100 transition-colors">
          Album
        </button>
      </div>

      <div className="px-4 py-2 flex items-center justify-between bg-[#242424] mx-3 my-2 rounded-lg border border-[#383838]">
        <div className="flex items-center gap-2 flex-1">
          <img src={assets.search} className="w-4 h-4 opacity-60" alt="Search" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm trong thư viện"
            className="bg-transparent text-sm text-white outline-none w-full placeholder-gray-400"
          />
        </div>
        <span className="text-xs opacity-60">Mới nhất</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 custom-scrollbar">
        <div
          className="bg-gradient-to-br from-[#450af5] to-[#8e8ee5] p-4 m-2 rounded-lg cursor-pointer hover:opacity-90 transition-all shadow-lg relative overflow-hidden group"
          onClick={() => navigate("/liked-songs")}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-0"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-black bg-opacity-20 w-12 h-12 rounded flex items-center justify-center shadow-md">
              <img src="https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84587ecba4a27774b2f6f07174" className="w-5 h-5" alt="Liked" />
            </div>
            <div>
              <p className="font-bold">Bài hát đã thích</p>
              <p className="text-xs opacity-90">Danh sách phát • 126 bài hát</p>
            </div>
          </div>
        </div>

        {filteredPlaylists &&
          filteredPlaylists.map((playlist, index) => (
            <div
              onClick={() => navigate("/playlists/" + playlist.id)}
              onContextMenu={(e) => handleContextMenu(e, playlist)}
              key={index}
              className="flex items-center gap-3 p-3 mx-2 rounded-lg hover:bg-[#2a2a2a] cursor-pointer transition-colors group"
            >
              <div className="relative w-12 h-12 rounded overflow-hidden shadow-md flex-shrink-0">
                <img
                  src={getPlaylistThumbnail(playlist)}
                  className={`w-full h-full ${playlist.songs?.length > 0 ? 'object-cover' : 'object-contain p-2'} group-hover:scale-105 transition-transform`}
                  alt="Playlist cover"
                  onError={(e) => {
                    e.target.src = assets.music_icon;
                    e.target.className = 'w-full h-full object-contain p-2';
                  }}
                />
                {playlist.songs?.length === 0 && (
                  <div className="absolute inset-0 bg-[#282828] flex items-center justify-center">
                    <img src={assets.music_icon} className="w-5 h-5 opacity-70" alt="Playlist" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{playlist.name}</p>
                <p className="text-xs text-gray-400">
                  Danh sách phát • {playlist.songs?.length || 0} bài hát
                </p>
              </div>
            </div>
          ))}
      </div>

      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="absolute bg-[#282828] rounded-md shadow-lg z-50 border border-[#383838] overflow-hidden min-w-[150px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div
            className="px-4 py-2 hover:bg-[#383838] cursor-pointer transition-colors"
            onClick={() => openRenameForm(contextMenu.playlistId, contextMenu.playlistName)}
          >
            Đổi tên
          </div>
          <div className="border-t border-[#383838]"></div>
          <div
            className="px-4 py-2 hover:bg-[#383838] cursor-pointer text-red-400 transition-colors"
            onClick={() => handleDeletePlaylist(contextMenu.playlistId)}
          >
            Xóa
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;