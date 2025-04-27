import React from "react";
import { albumsData } from "../assets/assets";
import AlbumItem from './AlbumItem'
import { songData } from "../assets/assets";
import SongItem from "./SongItem";

const DisplayHome=() =>{
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
         {albumsData.map((item,index)=>(<AlbumItem key={index} name={item.name} desc={item.desc} id={item.id} image={item.image} />))}
         </div>
        </div>
        <div className="mb-4">
            <h1 className="font-bold my-3 text-[26px]">Today's biggest hits</h1>
         <div className="flex overflow-auto">
         {songData.map((item,index)=>(<SongItem key={index} name={item.name} desc={item.desc} id={item.id} image={item.image} />))}
         </div>
        </div>
    </div>
)
}
export default DisplayHome