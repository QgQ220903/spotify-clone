import React, { use, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import {  createPlaylistAPI, fetchAllPlaylist } from "../service/PlaylistService";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [count, setCount] = useState(0);
    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const navigate = useNavigate();
    useEffect(()=>{
        fetchAllPlaylist().then((res)=>{
            if(res.status == 200 && res.data && res.data.results) 
            {
              setPlaylists(res.data.results);
              setCount(res.data.count)
            }
    })
    },[])





   
    if (isCollapsed) {
        return (
            <div className='bg-[#121212] w-[80px] h-full flex-col text-white hidden lg:flex items-center pt-3 gap-4'>
                {/* Collapse button */}
                <button 
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-[#282828] rounded-full"
                >
                    <img src={assets.rightarrow} className="w-5 h-5" alt="Expand" />
                </button>
                
                {/* Add button */}
                <button className="p-2 hover:bg-[#282828] rounded-full">
                    <img src={assets.plus} className="w-5 h-5" alt="Add" />
                </button>
                
                {/* Liked songs */}
                <div className="bg-gradient-to-br from-[#450af5] to-[#8e8ee5] p-3 rounded-md cursor-pointer">
                    <img src={assets.heart_icon} className="w-5 h-5" alt="Liked" />
                </div>
                
                {/* Sample playlists (3 items) */}
                {[1, 2, 3].map((item) => (
                    <div key={item} className="p-3 bg-[#282828] rounded-md">
                        <img src={assets.music_icon} className="w-5 h-5 opacity-70" alt="Playlist" />
                    </div>
                ))}
            </div>
        );
    }

    const handleCreatePlaylist = ()=>{
        var tmp = {
            songs:[],
            name:'Danh sách phát của tôi #'+count,
            is_public:true,
            user: localStorage.getItem('userId')

        }

        createPlaylistAPI(tmp).then((res)=>{
            console.log('res playlist:',res);
            if(res.status == 201 && res.data)
            {
                setPlaylists(prev => [...prev,res.data])
                setCount(playlists.length+1)

            }
            
        })
    }
    return (
        <div className='bg-[#121212] w-[400px] h-full flex-col text-white hidden lg:flex rounded-lg'>
            {/* Header */}
            <div className='p-4 flex items-center justify-between sticky top-0 bg-[#121212] z-10 border-b border-[#282828]'>
                <div className="flex items-center gap-4">
                    <p className='font-bold text-xl'>Thư viện</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-1 rounded-full hover:bg-[#282828]" onClick={()=>handleCreatePlaylist()}>
                        <img src={assets.plus} className="w-5 h-5 opacity-70 hover:opacity-100" alt="Add" />
                    </button>
                    <button 
                        onClick={toggleSidebar}
                        className="p-1 rounded-full hover:bg-[#282828]"
                    >
                        <img src={assets.rightarrow} className="w-5 h-5 opacity-70 hover:opacity-100 rotate-180" alt="Collapse" />
                    </button>
                </div>
            </div>

            {/* Filter tabs */}
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

            {/* Search bar */}
            <div className="px-4 py-2 flex items-center justify-between bg-[#242424] mx-3 my-2 rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                    <img src={assets.search} className="w-4 h-4 opacity-60" alt="Search" />
                    <span className="text-sm opacity-90">Tìm kiếm trong thư viện</span>
                </div>
                <span className="text-xs opacity-60">Mới nhất</span>
            </div>

            {/* Playlists */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
                {/* Liked songs */}
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

                {/* Other playlists */}
                {playlists && playlists.map((playlist, index) => (
                    <div onClick={()=>{navigate('/playlists/' + playlist.id)}} key={index} className="flex items-center gap-3 p-3 mx-2 rounded-lg hover:bg-[#2a2a2a] cursor-pointer">
                        
                        <div className="bg-[#282828] w-12 h-12 rounded flex items-center justify-center">
                            <img src={assets.music_icon} className="w-5 h-5 opacity-70" alt="Playlist" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{playlist.name}</p>
                            {/* <p className="text-xs opacity-70 truncate">{playlist.desc}</p> */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;