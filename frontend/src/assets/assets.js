import duong_domic from './artist/Duong domic.jpg'
import edsheeran from './artist/EdSheeran.jpg'
import hieuthuhai from './artist/Hieuthuhai.jpg'
import top50VN from './artist/top50VN.jpg'
import top50Global from './artist/top50Global.jpg'
import home from './icon/home.png'
import spotify from './icon/spotify.png'
import plus from './icon/plus.png'
import add from './icon/add.png'
import rightarrow from './icon/right-arrow.png'
import prev from './icon/prev.png'
import arrowsong from './icon/arrow.png' 
import play from './icon/play-button-arrowhead.png'
import next from './icon/next.png'
import loop from './icon/loop.png'
import plays from './icon/plays.png'
import mic from './icon/karaoke.png'
import queue from './icon/queue.png'
import connect from './icon/chromecast.png'
import volume from './icon/volume.png'
import miniplayer from './icon/fullscreen.png'
import zoom from './icon/zoom-out.png'
import search from './icon/search.png'
import bell from './icon/bell.png'
import spotify_logo from './icon/spotify-logo.png'
import clock from './icon/clock.png'
import pause from './icon/pause.png'
import Phaos from './song/Phaos.mp3'
import Phao_img from './artist/Phao.jpg'
import Matketnoi from './song/DuongDomic.mp3'
import Matketnoivideo from './video/DuongDomicVideo.mp4'
import sunghiepchuong from './video/Sunghiepchuong.mp4'
export const assets = {
    sunghiepchuong,
    Matketnoivideo,
    Matketnoi,
    Phao_img,
    Phaos,
    pause,
    clock,
    spotify_logo,
    bell,
    search,
    zoom,
    miniplayer,
    volume,
    connect,
    duong_domic,
    edsheeran,
    hieuthuhai,
    top50Global,
    top50VN,
    home,
    spotify,
    plus,
    add,
    rightarrow,
    prev,
    arrowsong,
    play,
    next,
    loop,
    plays,
    mic,
    queue
}

export const albumsData =[
    {
        id:0,
        name:"Top 50 Global",
        image: top50Global,
        desc:"Your weekly update of the most played tracks right now - Global.",
        bgColor:"#248e91"

    },
   { id:1,
    name:"Top 50 VietNam",
    image:top50VN,
    desc:"Your daily update of the most played tracks right now - Vietnam",
    bgColor:"#a61f1f"
   }
   
]
export const songData=[
    {
        id:0,
        name:"Dữ Liệu Quý",
        file:Matketnoi,
        image:duong_domic,
        video:Matketnoivideo,
        desc:"Dương Domic",
        bgColor:"#0863bf",
        duration:"3:28"
       },
    {
        id:1,
        name:"Sự Nghiệp Chướng",
        file:Phaos,
        video:sunghiepchuong,
        image:Phao_img,
        desc:"Pháo",
        bgColor:"#0863bf",
        duration:"3:20"
    }   
]