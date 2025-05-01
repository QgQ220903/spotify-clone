import React, { useContext } from "react";

const SongItem = ({ name, image, artists, id, onClick }) => {
    return (
        <div onClick={onClick} className="w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]">
            <img className='w-40 h-40 rounded' src={image} alt="" />
            <p className="font-bold mt-2 mb-1 text-[15px]">{name}</p>
            <p className="text-[13px] font-semibold text-gray-400">{artists}</p>
        </div>
    );
};


export default SongItem;
