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
  const [contextMenu, setContextMenu] = useState(null); // Trạng thái cho menu ngữ cảnh
  const [isRenameFormOpen, setIsRenameFormOpen] = useState(false); // Trạng thái cho form đổi tên
  const [renamePlaylistId, setRenamePlaylistId] = useState(null); // ID của playlist đang đổi tên
  const [newPlaylistName, setNewPlaylistName] = useState(""); // Tên mới của playlist
  const contextMenuRef = useRef(null); // Ref để xử lý click ngoài menu ngữ cảnh

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navigate = useNavigate();

  // Lấy danh sách playlist
  useEffect(() => {
    fetchAllPlaylist().then((res) => {
      if (res.status === 200 && res.data && res.data.results) {
        setPlaylists(res.data.results);
        setFilteredPlaylists(res.data.results);
        setCount(res.data.count);
      }
    });
  }, []);

  // Cấu hình Fuse.js
  const fuse = new Fuse(playlists, {
    keys: ["name"],
    threshold: 0.3,
  });

  // Xử lý tìm kiếm
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPlaylists(playlists);
    } else {
      const results = fuse.search(searchQuery).map((result) => result.item);
      setFilteredPlaylists(results);
    }
  }, [searchQuery, playlists]);

  // Xử lý click ngoài để đóng menu ngữ cảnh
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
      <div className="bg-[#121212] w-[80px] h-full flex-col text-white hidden lg:flex items-center pt-3 gap-4">
        <button onClick={toggleSidebar} className="p-2 hover:bg-[#282828] rounded-full">
          <img src={assets.rightarrow} className="w-5 h-5" alt="Expand" />
        </button>
        <button onClick={openForm} className="p-2 hover:bg-[#282828] rounded-full">
          <img src={assets.plus} className="w-5 h-5" alt="Add" />
        </button>
        <div className="bg-gradient-to-br from-[#450af5] to-[#8e8ee5] p-3 rounded-md cursor-pointer">
          <img src={assets.heart_icon} className="w-5 h-5" alt="Liked" />
        </div>
        {[1, 2, 3].map((item) => (
          <div key={item} className="p-3 bg-[#282828] rounded-md">
            <img src={assets.music_icon} className="w-5 h-5 opacity-70" alt="Playlist" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[#121212] w-[400px] h-full flex-col text-white hidden lg:flex rounded-lg">
      <div className="p-4 flex items-center justify-between sticky top-0 bg-[#121212] z-10 border-b border-[#282828]">
        <div className="flex items-center gap-4">
          <p className="font-bold text-xl">Thư viện</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-1 rounded-full hover:bg-[#282828]" onClick={openForm}>
            <img src={assets.plus} className="w-5 h-5 opacity-70 hover:opacity-100" alt="Add" />
          </button>
          <button onClick={toggleSidebar} className="p-1 rounded-full hover:bg-[#282828]">
            <img
              src={assets.rightarrow}
              className="w-5 h-5 opacity-70 hover:opacity-100 rotate-180"
              alt="Collapse"
            />
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#282828] p-6 rounded-lg w-[300px]">
            <h2 className="text-lg font-bold mb-4">Tạo danh sách phát mới</h2>
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Tên danh sách phát"
              className="w-full p-2 mb-4 bg-[#3a3a3a] text-white rounded-md outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={closeForm}
                className="px-4 py-2 bg-[#2a2a2a] rounded-md hover:bg-[#3a3a3a]"
              >
                Hủy
              </button>
              <button
                onClick={handleCreatePlaylist}
                className="px-4 py-2 bg-[#1db954] text-black rounded-md hover:bg-[#1ed760]"
                disabled={!playlistName.trim()}
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}

      {isRenameFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#282828] p-6 rounded-lg w-[300px]">
            <h2 className="text-lg font-bold mb-4">Đổi tên danh sách phát</h2>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Tên danh sách phát mới"
              className="w-full p-2 mb-4 bg-[#3a3a3a] text-white rounded-md outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={closeRenameForm}
                className="px-4 py-2 bg-[#2a2a2a] rounded-md hover:bg-[#3a3a3a]"
              >
                Hủy
              </button>
              <button
                onClick={handleRenamePlaylist}
                className="px-4 py-2 bg-[#1db954] text-black rounded-md hover:bg-[#1ed760]"
                disabled={!newPlaylistName.trim()}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
        <button className="bg-[#2a2a2a] text-sm px-3 py-1 rounded-full whitespace-nowrap hover:bg-[#3a3a3a]">
          Danh sách phát
        </button>
        <button className="text-sm px-3 py-1 rounded-full whitespace-nowrap hover:bg-[#2a2a2a] opacity-70 hover:opacity-100">
          Nghệ sĩ
        </button>
        <button className="text-sm px-3 py-1 rounded-full whitespace-nowrap hover:bg-[#2a2a2a] opacity-70 hover:opacity-100">
          Album
        </button>
      </div>

      <div className="px-4 py-2 flex items-center justify-between bg-[#242424] mx-3 my-2 rounded-lg">
        <div className="flex items-center gap-2 flex-1">
          <img src={assets.search} className="w-4 h-4 opacity-60" alt="Search" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm trong thư viện"
            className="bg-transparent text-sm text-white outline-none w-full"
          />
        </div>
        <span className="text-xs opacity-60">Mới nhất</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="bg-gradient-to-br from-[#450af5] to-[#8e8ee5] p-4 m-2 rounded-lg cursor-pointer hover:opacity-90 transition">
          <div className="flex items-center gap-4">
            <div className="bg-black bg-opacity-20 w-12 h-12 rounded flex items-center justify-center">
              <img src={assets.heart_icon} className="w-5 h-5" alt="Liked" />
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
              className="flex items-center gap-3 p-3 mx-2 rounded-lg hover:bg-[#2a2a2a] cursor-pointer"
            >
              <div className="bg-[#282828] w-12 h-12 rounded flex items-center justify-center">
                <img src={assets.music_icon} className="w-5 h-5 opacity-70" alt="Playlist" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{playlist.name}</p>
              </div>
            </div>
          ))}
      </div>

      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="absolute bg-[#282828] rounded-md shadow-lg z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div
            className="px-4 py-2 hover:bg-[#3a3a3a] cursor-pointer"
            onClick={() => openRenameForm(contextMenu.playlistId, contextMenu.playlistName)}
          >
            Đổi tên
          </div>
          <div
            className="px-4 py-2 hover:bg-[#3a3a3a] cursor-pointer text-red-400"
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