import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { PlayerContext } from "../context/PlayerContextProvider";
import DisplayQueue from "./DisplayQueue";

const Player = ({ toggleVideo }) => {
    const {
        track,
        playStatus,
        play,
        pause,
        next,
        previous,
        seekSong,
        seekBar,
        seekBg,
        time,
        volume,
        setVolume,
        handleVolumeChange,
        volumeBg,
        volumeBar,
        audioRef,
        shuffleMode,
        toggleShuffle,
        repeatMode,
        toggleRepeat,
        videoRef
    } = useContext(PlayerContext);

    const [isVideoVisible, setIsVideoVisible] = useState(false);
    const [isDraggingSeek, setIsDraggingSeek] = useState(false);
    const [isDraggingVolume, setIsDraggingVolume] = useState(false);
    const [previewTime, setPreviewTime] = useState(null);
    const [lastVolumeBeforeMute, setLastVolumeBeforeMute] = useState(50);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isQueueOpen, setIsQueueOpen] = useState(false);

    // Xử lý tự động chuyển bài khi nhạc kết thúc
    useEffect(() => {
        const audioElement = audioRef.current;
        if (!audioElement) return;

        const handleEnded = () => {
            if (repeatMode === 2) {
                // Chế độ repeat one - phát lại bài hiện tại
                audioElement.currentTime = 0;
                audioElement.play();
            } else {
                // Chuyển bài tiếp theo
                next();
            }
        };

        audioElement.addEventListener('ended', handleEnded);

        return () => {
            audioElement.removeEventListener('ended', handleEnded);
        };
    }, [audioRef, repeatMode, next]);

    // Xử lý tua nhạc với hiển thị preview
    const handleSeekMouseDown = (e) => {
        setIsDraggingSeek(true);
        calculatePreviewTime(e);
        
        if (seekBg.current && seekBar.current) {
            const rect = seekBg.current.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            seekBar.current.style.width = `${percent * 100}%`;
        }
        
        seekSong(e);
    };

    const handleSeekMouseMove = (e) => {
        if (isDraggingSeek) {
            calculatePreviewTime(e);
            
            if (seekBg.current && audioRef.current && audioRef.current.duration) {
                const rect = seekBg.current.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                
                if (seekBar.current) {
                    seekBar.current.style.width = `${percent * 100}%`;
                }
                
                const newTime = audioRef.current.duration * percent;
                if (videoRef && videoRef.current) {
                    videoRef.current.currentTime = newTime;
                }
                audioRef.current.currentTime = newTime;
            }
        }
    };

    const handleSeekMouseUp = (e) => {
        if (isDraggingSeek) {
            seekSong(e);
            setIsDraggingSeek(false);
            setPreviewTime(null);
        }
    };

    // Tính toán thời gian preview khi tua
    const calculatePreviewTime = (e) => {
        if (!seekBg.current || !audioRef.current || !audioRef.current.duration) return;

        const rect = seekBg.current.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const previewTimeValue = audioRef.current.duration * percent;

        setPreviewTime({
            minute: String(Math.floor(previewTimeValue / 60)).padStart(2, "0"),
            second: String(Math.floor(previewTimeValue % 60)).padStart(2, "0")
        });
    };

    // Xử lý điều chỉnh âm lượng với kéo
    const handleVolumeMouseDown = (e) => {
        setIsDraggingVolume(true);
        handleVolumeChange(e);
    };

    const handleVolumeMouseMove = (e) => {
        if (isDraggingVolume) {
            handleVolumeChange(e);
        }
    };

    const handleVolumeMouseUp = () => {
        setIsDraggingVolume(false);
    };

    // Toggle mute/unmute
    const toggleMute = () => {
        if (!audioRef.current) return;

        if (volume > 0) {
            setLastVolumeBeforeMute(volume);
            setVolume(0);
        } else {
            const restoredVolume = lastVolumeBeforeMute || 50;
            setVolume(restoredVolume);
        }
    };

    // Toggle video visibility
    const handleToggleVideo = () => {
        setIsVideoVisible(prev => !prev);
        if (typeof toggleVideo === 'function') {
            toggleVideo();
        }
    };

    // Toggle queue visibility
    const toggleQueue = () => {
        setIsQueueOpen(prev => !prev);
    };

    const toggleFullscreen = () => {
        const elem = document.documentElement;
        if (!document.fullscreenElement) {
            elem.requestFullscreen().then(() => setIsFullscreen(true));
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    };
    
    // Handle document-wide mouse events
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDraggingSeek) {
                handleSeekMouseMove(e);
                if (videoRef && videoRef.current && audioRef && audioRef.current) {
                    videoRef.current.currentTime = audioRef.current.currentTime;
                }
            }
            if (isDraggingVolume) {
                handleVolumeMouseMove(e);
            }
        };

        const handleMouseUp = (e) => {
            if (isDraggingSeek) {
                handleSeekMouseUp(e);
            }
            if (isDraggingVolume) {
                handleVolumeMouseUp();
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingSeek, isDraggingVolume]);

    // Helper function để lấy tên nghệ sĩ
    const getArtistNames = () => {
        if (!track || !track.artists || track.artists.length === 0) return "Unknown Artist";
        return track.artists.map(artist => artist.name).join(", ");
    };

    if (!track) {
        return <div className="text-white px-4 py-2"></div>;
    }

    return (
        <>
            <div className="h-full bg-black flex justify-between items-center text-white px-4">
                {/* Track info - Left side */}
                <div className="hidden lg:flex items-center gap-4">
                    <img className="w-16 h-16 rounded-lg"
                        src={track.thumbnail || 'path_to_default_image.jpg'}
                        alt="Track cover" />
                    <div>
                        <p className="text-white text-sm font-semibold">{track.title || 'Unknown'}</p>
                        <p className="text-gray-400 text-xs font-normal text-left">
                            {getArtistNames()}
                            {track.album && ` · ${track.album.title}`}
                        </p>
                    </div>
                    <div>
                        <img className="w-4 h-4 opacity-60 hover:opacity-100 hover:scale-105 cursor-pointer"
                            src={assets.add} alt="Add" />
                    </div>
                </div>

                {/* Player controls - Center */}
                <div className="flex flex-col items-center gap-1 mx-auto">
                    <div className="flex gap-5 items-center justify-center">
                        {/* Nút Shuffle */}
                        <div className="relative group">
                            <button
                                onClick={toggleShuffle}
                                className={`p-2 rounded-full ${shuffleMode ? 'text-green-500 hover:text-green-400' : 'text-gray-400 hover:text-white'} transition-colors`}
                                aria-label={shuffleMode ? "Shuffle on" : "Shuffle off"}
                            >
                                <svg 
                                    data-encore-id="icon" 
                                    role="img" 
                                    aria-hidden="true" 
                                    viewBox="0 0 16 16" 
                                    className="w-4 h-4"
                                    fill="currentColor"
                                >
                                    <path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"></path>
                                    <path d="m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z"></path>
                                </svg>
                            </button>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                {shuffleMode ? "Shuffle on" : "Shuffle off"}
                            </span>
                        </div>

                        <img
                            onClick={previous}
                            className="w-7 h-7 cursor-pointer opacity-60 hover:opacity-100 hover:scale-105"
                            src={assets.prev}
                            alt="Previous"
                        />
                        
                        {playStatus ? (
                            <div onClick={pause} className="cursor-pointer w-8 h-8 bg-white flex items-center justify-center rounded-full hover:scale-105">
                                <img className="w-3.5 h-3.5" src={assets.pause} alt="Pause" />
                            </div>
                        ) : (
                            <div onClick={play} className="cursor-pointer w-8 h-8 bg-white flex items-center justify-center rounded-full hover:scale-105">
                                <img className="w-3.5 h-3.5" src={assets.play} alt="Play" />
                            </div>
                        )}
                        
                        <img
                            onClick={next}
                            className="w-7 h-7 cursor-pointer opacity-60 hover:opacity-100 hover:scale-105"
                            src={assets.next}
                            alt="Next"
                        />

                        {/* Nút Repeat */}
                        <div className="relative group">
                            <button
                                onClick={toggleRepeat}
                                className={`p-2 ${repeatMode > 0 ? 'text-green-500 hover:text-green-400' : 'text-gray-400 hover:text-white'} transition-colors`}
                                aria-label={repeatMode === 0 ? "Repeat off" : repeatMode === 1 ? "Repeat all" : "Repeat one"}
                            >
                                <svg 
                                    data-encore-id="icon" 
                                    role="img" 
                                    aria-hidden="true" 
                                    viewBox="0 0 16 16" 
                                    className="w-5 h-5"
                                    fill="currentColor"
                                >
                                    {repeatMode === 0 && (
                                        <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"></path>
                                    )}
                                    {repeatMode === 1 && (
                                        <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"></path>
                                    )}
                                    {repeatMode === 2 && (
                                        <>
                                            <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h.75v1.5h-.75A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5ZM12.25 2.5a2.25 2.25 0 0 1 2.25 2.25v5A2.25 2.25 0 0 1 12.25 12H9.81l1.018-1.018a.75.75 0 0 0-1.06-1.06L6.939 12.75l2.829 2.828a.75.75 0 1 0 1.06-1.06L9.811 13.5h2.439A3.75 3.75 0 0 0 16 9.75v-5A3.75 3.75 0 0 0 12.25 1h-.75v1.5h.75Z"></path>
                                            <path d="m8 1.85.77.694H6.095V1.488c.697-.051 1.2-.18 1.507-.385.316-.205.51-.51.583-.913h1.32V8H8V1.85Z"></path>
                                            <path d="M8.77 2.544 8 1.85v.693h.77Z"></path>
                                        </>
                                    )}
                                </svg>
                            </button>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                {repeatMode === 0 ? "Repeat off" : repeatMode === 1 ? "Repeat all" : "Repeat one"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <p className="text-xs text-white">
                            {isDraggingSeek && previewTime
                                ? `${previewTime.minute}:${previewTime.second}`
                                : `${time?.currentTime?.minute || "00"}:${time?.currentTime?.second || "00"}`}
                        </p>
                        <div
                            ref={seekBg}
                            className="w-96 bg-gray-700 h-1 rounded-full cursor-pointer relative"
                            onMouseDown={handleSeekMouseDown}
                        >
                            <div
                                ref={seekBar}
                                className="h-1 border-none w-0 bg-green-500 rounded-full absolute top-0 left-0"
                            />
                            {isDraggingSeek && (
                                <div
                                    className="w-3 h-3 bg-white rounded-full absolute top-1/2 transform -translate-y-1/2"
                                    style={{ left: `calc(${seekBar.current?.style.width || '0'} - 6px)` }}
                                />
                            )}
                        </div>
                        <p className="text-xs text-white">
                            {time?.totaltime?.minute || "00"}:{time?.totaltime?.second || "00"}
                        </p>
                    </div>
                </div>

                {/* Volume and extra controls - Right side */}
                <div className="hidden lg:flex items-center gap-2 opacity-75">
                    <div 
                        onClick={handleToggleVideo}
                        className={`w-5 h-5 rounded border-2 ${isVideoVisible ? 'border-green-500' : 'border-gray-500'} flex items-center justify-center cursor-pointer hover:opacity-100 opacity-60 hover:scale-105`}
                    >
                    <img className="w-2 h-2" src={assets.plays} alt="Toggle video" />
                    </div>
                    <div 
                        className={`w-6 h-6 cursor-pointer hover:opacity-100 opacity-60 hover:scale-105 ${isQueueOpen ? 'text-green-500' : ''}`}
                        onClick={toggleQueue}
                    >
                        <img src={assets.queue} alt="Queue" className="w-6 h-6" />
                    </div>
                    <div
                        className="w-5 h-5 cursor-pointer hover:opacity-100 opacity-60 hover:scale-105"
                        onClick={toggleMute}
                    >
                        {volume > 0 ? (
                            <img src={assets.volume} alt="Volume" className="w-5 h-5" />
                        ) : (
                            <svg
                                viewBox="0 0 16 16"
                                aria-label="Đang tắt tiếng"
                                className="w-5 h-5 fill-current text-white"
                            >
                                <path d="M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06z"></path>
                                <path d="M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649v-1.906a4.73 4.73 0 0 1-1.5-.694v1.3L2.817 9.852a2.141 2.141 0 0 1-.781-2.92c.187-.324.456-.594.78-.782l5.8-3.35v1.3c.45-.313.956-.55 1.5-.694V1.5z"></path>
                            </svg>
                        )}
                    </div>
                    <div
                        ref={volumeBg}
                        className="w-24 bg-gray-700 h-1 rounded-full cursor-pointer relative"
                        onMouseDown={handleVolumeMouseDown}
                    >
                        <div
                            ref={volumeBar}
                            className="h-1 border-none bg-green-500 rounded-full absolute top-0 left-0"
                            style={{ width: `${volume}%` }}
                        />
                        {isDraggingVolume && (
                            <div
                                className="w-3 h-3 bg-white rounded-full absolute top-1/2 transform -translate-y-1/2"
                                style={{ left: `calc(${volume}% - 6px)` }}
                            />
                        )}
                    </div>
                    <div onClick={toggleFullscreen} className="cursor-pointer hover:opacity-100 opacity-60 hover:scale-105 flex items-center space-x-2">
                        {isFullscreen ? (
                            <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.12 1.25V3.67857C12.12 3.81664 12.2319 3.92857 12.37 3.92857H15.75V5.42857H12.37C11.4035 5.42857 10.62 4.64507 10.62 3.67857V1.25H12.12ZM3.87998 3.67895V1.279H5.37998V3.67895C5.37998 4.64545 4.59648 5.42895 3.62998 5.42895H0.26998V3.92895H3.62998C3.76805 3.92895 3.87998 3.81702 3.87998 3.67895ZM10.62 12.2785C10.62 11.3116 11.4039 10.529 12.37 10.529H15.75V12.029H12.37C12.2315 12.029 12.12 12.1409 12.12 12.2785V14.739H10.62V12.2785ZM3.63091 12.0603H0.25V10.5603H3.63091C4.5983 10.5603 5.38 11.3447 5.38 12.3103V14.7389H3.88V12.3103C3.88 12.1714 3.76809 12.0603 3.63091 12.0603Z" fill="currentColor"></path>
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M2 2H8V4H4V8H2V2ZM22 2V8H20V4H16V2H22ZM2 22V16H4V20H8V22H2ZM22 22H16V20H20V16H22V22Z" fill="white"/>
                            </svg>
                        )}
                    </div>
                </div>
            </div>
            <DisplayQueue 
                isOpen={isQueueOpen} 
                onClose={() => setIsQueueOpen(false)} 
            />
        </>
    );
};

export default Player;