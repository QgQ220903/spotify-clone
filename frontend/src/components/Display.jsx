import React, { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import DisplayHome from "./DisplayHome";
import DisplayAlbum from "./DisplayAlbum";
import { albumsData } from "../assets/assets";

const Display =() => {
    const displayRef = useRef();
    const location = useLocation();
    const isAlbum = location.pathname.includes("album");
    const albumId = isAlbum ? location.pathname.slice(-1) :"";
    const bgColor = albumsData[Number(albumId)].bgColor;

    useEffect(() => {
        if (displayRef.current) { 
            if (isAlbum) {
                displayRef.current.style.background = `linear-gradient(${bgColor}, #121212)`;
            } else {
                displayRef.current.style.background = `#121212`;
            }
        }
    }, [isAlbum, bgColor]); 
 return(
    <div ref={displayRef} className=" min-w-[20%] w-[100%]  h-full m-2 px-6 pt-4 rounded-lg bg-[#121212] text-white overflow-auto lg:ml-0">
        <div>
            <Routes>
                <Route path="/" element={< DisplayHome/>}/>
                <Route path="/album/:id" element={< DisplayAlbum/>}/>
            </Routes>
        </div>
    </div>
 )
}
export default Display