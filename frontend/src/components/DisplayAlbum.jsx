import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { albumsData, assets, songData } from "../assets/assets";
import { PlayerContext } from "../context/PlayerContextProvider";
import { fetchAllAlbums } from "../service/AlbumService";
import { fetchAllSongs } from "../service/SongService";

const DisplayAlbum = () => {
  const { id } = useParams();
  const { playWithSong } = useContext(PlayerContext);
  const scrollContainerRef = useRef(null);
  const headerRef = useRef(null);

  const [songs, setSongs] = useState([]);
  const [albumData, setAlbumData] = useState(null);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);

  // Lấy danh sách bài hát của album
  useEffect(() => {
    const getSongs = async () => {
      const fetchedSongs = await fetchAllSongs();
      if (fetchedSongs && Array.isArray(fetchedSongs)) {
        const filteredSongs = fetchedSongs
          .filter((song) => song.album?.id.toString() === id)
          .map((item) => {
            item.list_name = item.artists.map((a) => a.name).join(", ");
            return item;
          });
        setSongs(filteredSongs);
      } else {
        console.log("Sử dụng dữ liệu tĩnh vì không thể lấy từ API");
        const filteredSongs = songData
          .filter((song) => song.album?.id.toString() === id)
          .map((item) => {
            item.list_name = item.artists.map((a) => a.name).join(", ");
            return item;
          });
        setSongs(filteredSongs);
      }
    };

    getSongs();
  }, [id]);

  // Lấy thông tin album theo id
  useEffect(() => {
    const getAlbums = async () => {
      const fetchedAlbums = await fetchAllAlbums();
      if (fetchedAlbums && Array.isArray(fetchedAlbums)) {
        const album = fetchedAlbums.find((item) => item.id.toString() === id);
        setAlbumData(album);
      } else {
        console.log("Sử dụng dữ liệu tĩnh vì không thể lấy từ API");
        const album = albumsData.find((item) => item.id.toString() === id);
        setAlbumData(album);
      }
    };

    getAlbums();
  }, [id]);
  
  // Handle scroll functionality
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current && headerRef.current) {
        const scrollPosition = scrollContainerRef.current.scrollTop;
        const headerOffset = 150; // Adjust this value based on when you want the header to become sticky
        
        if (scrollPosition > headerOffset) {
          setIsHeaderSticky(true);
        } else {
          setIsHeaderSticky(false);
        }
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);
  
  // Tính tổng thời lượng
  const calculateTotalDuration = () => {
    let totalSeconds = 0;
  
    songs.forEach(song => {
      if (song.duration && song.duration.includes(':')) {
        const parts = song.duration.split(':');
        if (parts.length === 3) { // Đảm bảo có 3 phần: giờ, phút, giây
          const hours = parseInt(parts[0]) || 0; // Giờ
          const minutes = parseInt(parts[1]) || 0; // Phút
          const seconds = parseInt(parts[2]) || 0; // Giây
          totalSeconds += (hours * 3600) + (minutes * 60) + seconds; // Tính tổng giây
        }
      }
    });
  
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
  
    if (hours > 0) {
      return `${hours} hours ${minutes} minutes`;
    } else {
      return `${minutes} minutes`;
    }
  };

  // Phát tất cả các bài hát trong album
  const playAllSongs = () => {
    if (songs && songs.length > 0) {
      // Phát bài đầu tiên và thiết lập toàn bộ danh sách phát
      playWithSong(songs[0], songs);
      console.log("Playing all songs in album:", albumData?.title);
    }
  };

  // Thêm album vào thư viện
  const addToLibrary = () => {
    console.log("Added album to library:", albumData?.title);
    // Thêm logic lưu album vào thư viện người dùng
  };

  // Tải xuống album
  const downloadAlbum = () => {
    console.log("Downloading album:", albumData?.title);
    // Thêm logic tải xuống album
  };

  const totalDuration = calculateTotalDuration();

  if (!albumData) {
    return <p className="text-white mt-10">Loading album...</p>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Album Info - Fixed at the top */}
      <div className="flex-none bg-gradient-to-b from-[#121212] to-[#181818] pb-4">
        <div className="mt-3 flex gap-8 flex-col md:flex-row md:items-end">
          <img className="rounded-lg w-48" src={albumData.cover_image} alt="" />
          <div className="flex flex-col">
            <p className="text-sm">Album</p>
            <h2 className="text-5xl font-bold mb-4 md:text-6xl">
              {albumData.title}
            </h2>
            <div className="flex items-center mt-2">
              {/* Artist avatar */}
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                <img 
                  className="w-full h-full object-cover" 
                  src={albumData.artist.image} 
                  alt={albumData.artist.image} 
                />
              </div>
              <h4 className="font-semibold">{albumData.artist.name}</h4>
              <span className="mx-1">•</span>
              <span>{new Date(albumData.release_date).getFullYear()}</span>
              <span className="mx-1">•</span>
              <span>{songs.length} songs, {totalDuration}</span>
            </div>
          </div>
        </div>

        {/* Album Control Buttons */}
        <div className="flex items-center mt-8 gap-4">
          {/* Play button */}
          <button 
            onClick={playAllSongs}
            className="bg-green-500 hover:bg-green-400 rounded-full w-14 h-14 flex items-center justify-center transition-all"
            aria-label="Play all songs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" className="w-7 h-7">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Add to library button */}
          <button 
            onClick={addToLibrary}
            className="border-3 border-gray-400 text-gray-400 rounded-full w-8 h-8 flex items-center justify-center hover:border-white hover:text-white transition-all"
            aria-label="Add to library"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 5c.55 0 1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1z"/>
            </svg>
          </button>

          {/* Download button */}
          <button 
            onClick={downloadAlbum}
            className="border-3 border-gray-400 text-gray-400 rounded-full w-8 h-8 flex items-center justify-center hover:border-white hover:text-white transition-all"
            aria-label="Download album"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 6.05a1 1 0 0 1 1 1v7.486l1.793-1.793a1 1 0 1 1 1.414 1.414L12 18.364l-4.207-4.207a1 1 0 1 1 1.414-1.414L11 14.536V7.05a1 1 0 0 1 1-1z"></path>
            </svg>
          </button>

          {/* More options button */}
          <button 
            className="text-gray-400 hover:text-white transition-all w-8 h-8 flex items-center justify-center"
            aria-label="More options"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
              <path fillRule="evenodd" d="M4.5 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div 
        ref={scrollContainerRef} 
        className="flex-grow overflow-y-auto bg-[#121212] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
      >
        {/* Sticky Header */}
        <div 
          ref={headerRef}
          className={`sticky top-0 z-10 bg-[#121212] ${isHeaderSticky ? 'shadow-md' : ''}`}
        >
          {/* Header */}
          <div className="grid grid-cols-[1fr_2fr_1fr_30px] py-4 pl-2 text-[#a7a7a7] bg-[#121212]">
            <p className="font-semibold">
              <b className="mr-8 font-normal">#</b>
              <b className="mr-4 font-normal">Title</b>
            </p>
            <p className="flex font-semibold items-center justify-center">Album</p>
            <div className="flex items-center justify-center">
              <img className="w-4" src={assets.clock} alt="" />
            </div>
            <div className="flex items-center justify-center"></div>
          </div>
          <hr className="border-t border-[#282828]" />
        </div>

        {/* Songs List */}
        <div className="pb-24"> {/* Add padding at the bottom for better UX */}
          {songs.map((item, index) => (
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
                <p className="text-[15px] font-semibold">{albumData.title}</p>
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
    </div>
  );
};

export default DisplayAlbum;