import React from "react";
import { useNavigate } from "react-router-dom";

const AlbumItem = ({ image, name, artist, id }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/album/${id}`)}
            className="group cursor-pointer transition-transform hover:scale-105"
        >
            <div className="relative overflow-hidden rounded-lg aspect-square mb-3">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover transition-transform group-hover:brightness-90"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            </div>
            <h3 className="font-semibold text-white truncate">{name}</h3>
            <p className="text-sm text-gray-400 truncate">{artist}</p>
        </div>
    );
};

export default AlbumItem;