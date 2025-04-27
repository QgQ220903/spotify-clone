import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { LoginContext } from "../context/Login"; 
const Navbar = () =>{
    const {checklogin} = useContext(LoginContext);
    return (
       <div className='w-[100%] h-full bg-black flex items-center justify-center'>
        <img src={assets.spotify} alt='' className='w-11 h-11'/>
        <div className='w-12 h-12 bg-neutral-800 p-3 ml-6 rounded-full flex items-center justify-center hover:opacity-100 opacity-60 hover:scale-105'>
       <img className='w-5 h-5' src={assets.home} alt=''/>
        </div>
        <div class="flex items-center bg-[#303030] text-white rounded-2xl p-2 w-110 hover:opacity-100 opacity-60 ml-4">
        <img className='cursor-pointer w-5 h-5' src={assets.search} alt="" />
  <input type="text" placeholder="What do you want to play?" className="bg-transparent outline-none text-white px-3 flex-1 placeholder-gray-400" />
</div>
        <div className='ml-120 w-50 flex items-center gap-6 '>
            {checklogin 
        ?<>
        <img className='w-5 h-5 opacity-60 hover:opacity-100  hover:scale-105 cursor-pointer' src={assets.bell} alt="" />
        <div className='bg-purple-500 text-black w-9 h-9 rounded-full flex items-center justify-center opacity-60 hover:opacity-100  hover:scale-105 cursor-pointer'>D</div>
        </>
        :<>
         <button class="bg-black text-white font-semibold opacity-60 hover:opacity-100  hover:scale-105 text-[15px]">Sign up</button>
         <button class="bg-white text-black font-semibold px-6 py-3 rounded-full shadow hover:opacity-100  hover:scale-105">Log in</button>
         </>
           
         
           }
         </div>
       </div>
       
    )
}
export default Navbar