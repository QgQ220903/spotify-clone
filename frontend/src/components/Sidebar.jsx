import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { createPlaylistAPI, fetchAllPlaylist } from "../service/PlaylistService";

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [playlists, setPlaylists] = useState([]);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    useEffect(() => {
        fetchAllPlaylist().then((res) => {
            if (res.status === 200 && res.data && res.data.results) {
                setPlaylists(res.data.results);
            }
        });
    }, []);

    const handleCreatePlaylist = () => {
        const newPlaylist = {
            songs: [],
            name: "a",
            is_public: true,
            user: localStorage.getItem("userId"),
        };

        createPlaylistAPI(newPlaylist).then((res) => {
            console.log("res playlist:", res);
        });
    };

    if (isCollapsed) {
        return (
            <div className="bg-[#121212] w-[80px] h-full flex-col text-white hidden lg:flex items-center pt-3 gap-4">
                <button onClick={toggleSidebar} className="p-2 hover:bg-[#282828] rounded-full">
                    <img src={assets.rightarrow} className="w-5 h-5" alt="Expand" />
                </button>
                <button className="p-2 hover:bg-[#282828] rounded-full">
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
            {/* Header */}
            <div className="p-4 flex items-center justify-between sticky top-0 bg-[#121212] z-10 border-b border-[#282828]">
                <p className="font-bold text-xl">Thư viện</p>
                <div className="flex items-center gap-3">
                    <button onClick={handleCreatePlaylist} className="p-1 rounded-full hover:bg-[#282828]">
                        <img src={assets.plus} className="w-5 h-5 opacity-70 hover:opacity-100" alt="Add" />
                    </button>
                    <button onClick={toggleSidebar} className="p-1 rounded-full hover:bg-[#282828]">
                        <img src={assets.rightarrow} className="w-5 h-5 opacity-70 hover:opacity-100 rotate-180" alt="Collapse" />
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
                <button className="bg-[#2a2a2a] text-sm px-3 py-1 rounded-full whitespace-nowrap hover:bg-[#3a3a3a]">
                    Playlists
                </button>
                <button className="text-sm px-3 py-1 rounded-full whitespace-nowrap hover:bg-[#2a2a2a] opacity-70 hover:opacity-100">
                    Artists
                </button>
                <button className="text-sm px-3 py-1 rounded-full whitespace-nowrap hover:bg-[#2a2a2a] opacity-70 hover:opacity-100">
                    Albums
                </button>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-2 flex items-center justify-between bg-[#242424] mx-3 my-2 rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                    <img src={assets.search} className="w-4 h-4 opacity-60" alt="Search" />
                    <span className="text-sm opacity-90"></span>
                </div>
                <span className="text-xs opacity-60">Recents</span>
            </div>

            {/* Playlist section */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
                {/* Liked Songs */}
                <div className="bg-black p-4 rounded-lg max-w-xs mb-2">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-[#450af5] to-[#8e8ee5] w-12 h-12 rounded flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <div className="text-white">
                            <p className="font-bold">Liked Songs</p>
                            <span className="text-xs opacity-90">Playlist • 10 songs</span>
                        </div>
                    </div>
                </div>

                {/* Static Playlists */}
                {[
                    { name: "Chill Vibes", songs: 5, from: "green-500", to: "emerald-400" },
                    { name: "Workout Mix", songs: 6, from: "pink-500", to: "purple-500" },
                    { name: "Focus Beats", songs: 7, from: "yellow-400", to: "orange-500" },
                ].map((pl, i) => (
                    <div key={i} className="bg-black p-4 rounded-lg max-w-xs mb-2">
                        <div className="flex items-center gap-4">
                            <div className={`bg-gradient-to-br from-${pl.from} to-${pl.to} w-12 h-12 rounded flex items-center justify-center`}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="white" className="w-6 h-6" viewBox="0 0 24 24">
                                    <path d="M9 3v12.26A4 4 0 1 0 11 19V8h6V3H9z" />
                                </svg>
                            </div>
                            <div className="text-white">
                                <p className="font-bold">{pl.name}</p>
                                <span className="text-xs opacity-90">Playlist • {pl.songs} songs</span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Dynamic playlists */}
                {playlists.map((playlist, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 mx-2 rounded-lg hover:bg-[#2a2a2a] cursor-pointer">
                        <div className="bg-[#282828] w-12 h-12 rounded flex items-center justify-center">
                            <img src={assets.music_icon} className="w-5 h-5 opacity-70" alt="Playlist" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{playlist.name}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;
