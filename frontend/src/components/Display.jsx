import React, { useEffect, useRef } from "react";
import { Routes, Route, useLocation, useParams } from 'react-router-dom';
import DisplayHome from "./DisplayHome";
import DisplayAlbum from "./DisplayAlbum";
import { albumsData } from "../assets/assets";

const Display = () => {
    const displayRef = useRef();
    const location = useLocation();
    const { id: albumId } = useParams(); // Lấy id từ URL

    const isAlbum = location.pathname.includes("album");
    const bgColor = isAlbum && albumsData[albumId]?.bgColor
        ? albumsData[albumId].bgColor
        : "#121212";

    useEffect(() => {
        if (displayRef.current) {
            displayRef.current.style.background = isAlbum
                ? `linear-gradient(${bgColor}, #121212)`
                : "#121212";
        }
    }, [isAlbum, bgColor]);

    return (
        <div
            ref={displayRef}
            className="min-w-[20%] w-[100%] h-full m-2 px-6 pt-4 rounded-lg bg-[#121212] text-white overflow-auto lg:ml-0"
        >
            <Routes>
                <Route path="/" element={<DisplayHome />} />
                <Route path="/album/:id" element={<DisplayAlbum />} />
            </Routes>
        </div>
    );
};

export default Display;
