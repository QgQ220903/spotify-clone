import React from "react";
import { assets } from "../assets/assets";

const sidebar = ()=>
{
    return(
    <div className='bg-[#121212] w-[30%] h-full p-2 flex-col gap-2 text-white hidden lg:flex rounded-lg'>
           <div className='h-[85%] rounded'>
                <div className='p-3 flex items-center justify-between'>
                  <div className="flex items-center gap-3">
                  <div className=" opacity-60 hover:opacity-100 cursor-pointer">
                           <p className='font-semibold text-white'>Your Library</p>
                           </div>
                  </div>
                  <div className="flex items-center gap-3">
                           <img className="w-4.5 h-4.5 opacity-60 hover:opacity-100" src={assets.plus} alt="" />
                           <div class="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-900 transition duration-200">
                           <img className="w-5 h-5 opacity-60 hover:opacity-100" src={assets.rightarrow} alt="" />
                           </div>
                           
                          
                  </div>
                </div>
                   <div className="p-4 bg-[#242424] m-2 rounded font-semibold flex-col items-start justify-start gap-1 pl-4">
                    <p className="cursor-default">Create your first playlist</p>
                     <p className="font-light text-[15px] cursor-default">It's easy,we'll help you</p>
                     <button className='w-fit px-3 py-1 bg-white text-[15px] text-black rounded-full mt-4 hover:scale-105'>Create Playlist</button>
                   </div>
                   <div className="p-4 bg-[#242424] m-2 rounded font-semibold  flex-col items-start justify-start gap-1 pl-4">
                    <p className="cursor-default">Let's find some podcasts to follow</p>
                     <p className="font-light text-[15px] cursor-default">We'll keep you updated on new episodes</p>
                     <button className='w-fit px-3 py-1 bg-white text-[15px] text-black rounded-full mt-4  hover:scale-105'>Browse podcasts</button>
                   </div>
                   <div className="px-4 container mx-auto flex flex-wrap justify-between mt-12">         
        </div>
           </div>
          </div>
    )
}
export default sidebar