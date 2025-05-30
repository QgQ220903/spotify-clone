import React from "react";
import { useNavigate } from "react-router-dom";

const AlbumItem = ({image,name,artist,id}) =>{

  const navigate =useNavigate()

    return (
        <div onClick={() =>navigate(`/album/${id}`)} className="w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]">
            <img className='w-40 h-40 rounded' src={image} alt="" />
            <p className="font-bold mt-2 mb-1 text-[15px]" >{name}</p>
            <p className="text-slate-200 text-[10px] font-normal">{artist}</p>
        </div>
    )
}
export default AlbumItem