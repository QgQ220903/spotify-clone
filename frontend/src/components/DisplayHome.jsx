import React, { useEffect, useState } from "react";
import { albumsData } from "../assets/assets";
import AlbumItem from "./AlbumItem";
import { songData } from "../assets/assets";
import SongItem from "./SongItem";
import { fetchAllSongs } from "../service/SongService";
import { fetchAllAlbums } from "../service/AlbumService";
import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContextProvider";

const DisplayHome = () => {
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const { playWithSong } = useContext(PlayerContext);

    useEffect(() => {
        const getSongs = async () => {
            const fetchedSongs = await fetchAllSongs();
            console.log("Fetched songs:", fetchedSongs);
            if (fetchedSongs && Array.isArray(fetchedSongs)) {
                fetchedSongs.map((item) => {
                    item.list_name = item.artists.join(",");
                    item.list_name = item.artists.map((item1) => item1.name).join(",");
                    return item;
                });
                setSongs(fetchedSongs);
            } else {
                console.log("Sử dụng dữ liệu tĩnh vì không thể lấy từ API");
                setSongs(songData);
            }
        };

        getSongs();
    }, []);

    useEffect(() => {
        const getAlbums = async () => {
            const fetchedAlbums = await fetchAllAlbums();
            console.log("Fetched albums:", fetchedAlbums);
            if (fetchedAlbums && Array.isArray(fetchedAlbums)) {
                setAlbums(fetchedAlbums);
            } else {
                console.log("Sử dụng dữ liệu tĩnh vì không thể lấy từ API");
                setAlbums(albumsData);
            }
        };

        getAlbums();
    }, []);

    return (
        <div className="px-4 md:px-6 lg:px-8 pb-20">
            {/* Filter Tabs */}
            <div className="flex items-center gap-3 mt-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                <button className="bg-white text-black px-5 py-2 rounded-full font-semibold cursor-pointer hover:bg-gray-100 transition whitespace-nowrap">
                    All
                </button>
                <button className="bg-[#2a2a2a] text-white px-5 py-2 rounded-full font-semibold cursor-pointer hover:bg-[#3a3a3a] transition whitespace-nowrap">
                    Music
                </button>
                <button className="bg-[#2a2a2a] text-white px-5 py-2 rounded-full font-semibold cursor-pointer hover:bg-[#3a3a3a] transition whitespace-nowrap">
                    Podcasts
                </button>
            </div>

            {/* Albums Section */}
            <div className="mb-8">
                <h1 className="font-bold text-2xl md:text-3xl mb-5 text-white">Popular Album For You</h1>
                <div className="relative">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                        {albums.map((item, index) => (
                            <div key={index} className="w-full">
                                <AlbumItem
                                    name={item.title}
                                    artist={item.artist?.name || "Unknown Artist"}
                                    id={item.id}
                                    image={item.cover_image}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Songs Section */}
            <div className="mb-8">
                <h1 className="font-bold text-2xl md:text-3xl mb-5 text-white">Today's Biggest Hits</h1>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {songs.map((item, index) => (
                        <div key={index} className="flex-shrink-0">
                            <SongItem
                                name={item.title}
                                artists={item.list_name}
                                id={item.id}
                                image={item.thumbnail}
                                onClick={() => playWithSong(item)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DisplayHome;