import { createContext,useEffect,useRef, useState } from "react";
import { songData } from "../assets/assets";


export const PlayerContext = createContext();



const PlayerContextProvider = (props) =>{
    const [volume, setVolume] = useState(50);
    const volumeBg = useRef();
    const volumeBar = useRef();
     const audioRef =useRef();
     const videoRef = useRef();
     const seekBg = useRef();
     const seekBar = useRef();
     const [track, setTrack] = useState(songData[1]);
     const [playStatus,setPlayStatus] =useState(false);
     const [time,setTime] = useState({
        currentTime:{
            second:0,
            minute:0
        },
        totaltime:{
            second:0,
            minute:0
        }
     })
     const showVideo = () => {
        if (videoRef.current && audioRef.current) {
            videoRef.current.currentTime = audioRef.current.currentTime; // Đồng bộ thời gian
            videoRef.current.play(); // Phát video
        }
    };
     const play = () => {
        if (audioRef.current) {
            audioRef.current.play();
        }
        if (videoRef.current && !videoRef.current.paused) {  
            videoRef.current.play();
        }
        setPlayStatus(true);
    };
    
    const pause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        if (videoRef.current) {
            videoRef.current.pause();
        }
        setPlayStatus(false);
    };
    const playWithId = async (id) =>{
        await setTrack(songData[id]);
        await audioRef.current.play();
        await videoRef.current.play();
        setPlayStatus(true);
    }

    const previous = async () =>{
        if(track.id>0){
            await setTrack(songData[track.id-1]);
            await audioRef.current.play();
            await videoRef.current.play();
            setPlayStatus(true);
        }
    }
    const next = async ()=>{
        if (track.id < songData.length-1){
                await setTrack(songData[track.id+1]);
                await audioRef.current.play();
                await videoRef.current.play();
                setPlayStatus(true);
     
        }
    }
    const seekSong = async(e) =>{
        audioRef.current.currentTime = ((e.nativeEvent.offsetX / seekBg.current.offsetWidth)*audioRef.current.duration)
        videoRef.current.currentTime = ((e.nativeEvent.offsetX / seekBg.current.offsetWidth)*audioRef.current.duration) 
    }
     useEffect (()=>{
        setTimeout(() =>{
         audioRef.current.ontimeupdate = () =>{
            seekBar.current.style.width = (Math.floor(audioRef.current.currentTime/audioRef.current.duration*100))+ "%";
            setTime({
                currentTime:{
                    second: Math.floor(audioRef.current.currentTime % 60),
                    minute:Math.floor(audioRef.current.currentTime / 60)
                },
                totaltime:{
                    second: Math.floor(audioRef.current.duration % 60),
                    minute:Math.floor(audioRef.current.duration / 60)
                }
             })
         }

        }, 1000)
     })
     useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.load();
        }
    }, [track]);
    useEffect(() => {
        if (videoRef.current && playStatus) {
            videoRef.current.currentTime = audioRef.current.currentTime;
            videoRef.current.play();
        }
    }, [playStatus]);
    const handleSeek = (newTime) => {
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
    
            if (videoRef.current) {
                videoRef.current.currentTime = newTime;
            }
        }
    };
    const handleVideoOpen = () => {
        if (videoRef.current && audioRef.current) {
            videoRef.current.currentTime = audioRef.current.currentTime;
        }
    };
    useEffect(() => {
        const syncVideoWithAudio = () => {
            if (audioRef.current && videoRef.current) {
                videoRef.current.currentTime = audioRef.current.currentTime;
            }
        };
        audioRef.current?.addEventListener("timeupdate", syncVideoWithAudio);
        return () => {
            audioRef.current?.removeEventListener("timeupdate", syncVideoWithAudio);
        };
    }, []);
    useEffect(() => {
        if (!playStatus && videoRef.current) {
            videoRef.current.currentTime = audioRef.current.currentTime;
        }
    }, [playStatus]);
    useEffect(() => {
        const syncOnPause = () => {
            if (videoRef.current) {
                videoRef.current.currentTime = audioRef.current.currentTime;
            }
        };
    
        audioRef.current?.addEventListener("pause", syncOnPause);
        return () => {
            audioRef.current?.removeEventListener("pause", syncOnPause);
        };
    }, []);
    useEffect(() => {
        const video = document.getElementById("videoPlayer");
        if (!video) return;
    
        const handleLoad = () => {
            console.log("Video đã load xong, sẵn sàng để phát!");
        };
    
        video.addEventListener("canplaythrough", handleLoad);
        return () => {
            video.removeEventListener("canplaythrough", handleLoad);
        };
    }, []);
    useEffect(() => {
        if (track) {
            audioRef.current.play();
            videoRef.current?.play();
            setPlayStatus(true);
        }
    }, [track]);
    const handleVolumeChange = (e) => {
        if (!volumeBg.current) return;
        const rect = volumeBg.current.getBoundingClientRect();
        let newVolume = ((e.clientX - rect.left) / rect.width) * 100;
        newVolume = Math.max(0, Math.min(100, newVolume));
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume / 100;
        }
    };
    
    const startVolumeDrag = () => {
        window.addEventListener("mousemove", handleVolumeChange);
        window.addEventListener("mouseup", stopVolumeDrag);
    };
    
    const stopVolumeDrag = () => {
        window.removeEventListener("mousemove", handleVolumeChange);
        window.removeEventListener("mouseup", stopVolumeDrag);
    };
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.addEventListener("loadedmetadata", () => {
                setTime({
                    currentTime: { second: 0, minute: 0 },
                    totaltime: {
                        second: Math.floor(audioRef.current.duration % 60),
                        minute: Math.floor(audioRef.current.duration / 60),
                    },
                });
            });
        }
    }, []);
    useEffect(() => {
        if (audioRef.current) {
            setPlayStatus(!audioRef.current.paused);
        }
    }, [track]);
    const contextValue ={
        handleVolumeChange,
        startVolumeDrag,
        volume, setVolume,
        volumeBar,
        volumeBg,
        handleVideoOpen,
        handleSeek,
        showVideo,
          videoRef,
          audioRef,
          seekBg,
          seekBar,
          track, setTrack,
          playStatus, setPlayStatus,
          time, setTime,
          play, pause,
          playWithId,
          previous,next,
          seekSong
    }

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
       </PlayerContext.Provider>
    )
}
export default PlayerContextProvider;