import React, { useEffect, useState } from "react";
import { albumsData } from "../assets/assets";
import AlbumItem from './AlbumItem'
import { songData } from "../assets/assets";
import SongItem from "./SongItem";
import { fetchAllSongs } from "../service/SongService"
import { fetchAllAlbums } from "../service/AlbumService";

const DisplayHome=() =>{
    
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);

    useEffect(() => {
    const getSongs = async () => {
        const fetchedSongs = await fetchAllSongs();
        console.log('Fetched songs:', fetchedSongs);
        if (fetchedSongs && Array.isArray(fetchedSongs)) {
            fetchedSongs.map((item)=>
            {
                item.list_name =  item.artists.join(',');
                item.list_name =  item.artists.map(item1 => item1.name).join(',');
                return item;

            })
        setSongs(fetchedSongs);
        } else {
        console.log("Sử dụng dữ liệu tĩnh vì không thể lấy từ API");
        setSongs(songData);
        }
    };

    getSongs();
    }, []);

    // Lấy danh sách album
    useEffect(() => {
        const getAlbums = async () => {
            const fetchedAlbums = await fetchAllAlbums();
            console.log('Fetched albums:', fetchedAlbums);
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
    <div>
         <div className="flex items-center gap-2 mt-1">
            <p className="bg-white text-black px-4 py-1 rounded-2xl font-semibold cursor-pointer">All</p>
            <p className="bg-black text-white px-4 py-1 rounded-2xl font-semibold cursor-pointer">Music</p>
            <p className="bg-black text-white px-4 py-1 rounded-2xl font-semibold cursor-pointer">Podcasts</p>
        </div>
        <div className="mb-4">
            <h1 className="font-bold my-3 text-[26px]">Featured Charts</h1>
         <div className="flex overflow-auto">
         {albums && albums.map((item,index)=>(<AlbumItem key={index} name={item.title} artist={item.artist?.name || 'Unknown Artist'} id={item.id} image={item.cover_image} />))}
         </div>
        </div>
        <div className="mb-4">
            <h1 className="font-bold my-3 text-[26px]">Today's biggest hits</h1>
         <div className="flex overflow-auto">
         {songs && songs.map((item,index)=>(<SongItem key={index} name={item.title} artists={item.list_name} id={item.id} image={item.thumbnail} />))}
         </div>
        </div>
    </div>
)
}
export default DisplayHome