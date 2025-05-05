import React, { useContext, useRef, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { PlayerContext } from "../context/PlayerContextProvider";

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
        handleVolumeChange,
        volumeBg,
        volumeBar,
        audioRef
    } = useContext(PlayerContext);

    const [isVideoVisible, setIsVideoVisible] = useState(false);
    const [isDraggingSeek, setIsDraggingSeek] = useState(false);
    const [isDraggingVolume, setIsDraggingVolume] = useState(false);
    const [previewTime, setPreviewTime] = useState(null);
    const [isShuffleActive, setIsShuffleActive] = useState(false);
    const [isLoopActive, setIsLoopActive] = useState(false);
    const [lastVolumeBeforeMute, setLastVolumeBeforeMute] = useState(50);

    // Xử lý tua nhạc với hiển thị preview
    const handleSeekMouseDown = (e) => {
        setIsDraggingSeek(true);
        calculatePreviewTime(e);
        seekSong(e); // Tua ngay khi bắt đầu kéo
    };

    const handleSeekMouseMove = (e) => {
        if (isDraggingSeek) {
            calculatePreviewTime(e);
            if (seekBar.current) {
                const rect = seekBg.current.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                seekBar.current.style.width = `${percent * 100}%`;
            }
        }
    };

    const handleSeekMouseUp = (e) => {
        if (isDraggingSeek) {
            seekSong(e); // Apply the seek
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

        if (audioRef.current.volume > 0) {
            // Store current volume before muting
            setLastVolumeBeforeMute(volume);
            // Set volume to 0
            if (volumeBar.current) volumeBar.current.style.width = "0%";
            audioRef.current.volume = 0;
        } else {
            // Restore previous volume
            const restoredVolume = lastVolumeBeforeMute || 50;
            if (volumeBar.current) volumeBar.current.style.width = `${restoredVolume}%`;
            audioRef.current.volume = restoredVolume / 100;
        }
    };

    // Toggle shuffle
    const toggleShuffle = () => {
        setIsShuffleActive(prev => !prev);
        // Implement shuffle logic in PlayerContextProvider
    };

    // Toggle loop
    const toggleLoop = () => {
        setIsLoopActive(prev => !prev);
        if (audioRef.current) {
            audioRef.current.loop = !isLoopActive;
        }
    };

    // Toggle video visibility
    const handleToggleVideo = () => {
        setIsVideoVisible(prev => !prev);
        if (typeof toggleVideo === 'function') {
            toggleVideo();
        }
    };

    // Handle document-wide mouse events for continuous dragging
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDraggingSeek) {
                handleSeekMouseMove(e);
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
        return <div className="text-white px-4 py-2">Loading player...</div>;
    }

    return (
        <div className="h-20 bg-black flex justify-between items-center text-white px-4">
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
                    <img
                        className={`w-5 h-5 cursor-pointer ${isShuffleActive ? 'opacity-100' : 'opacity-60'} hover:opacity-100 hover:scale-105`}
                        src={assets.arrowsong}
                        alt="Shuffle"
                        onClick={toggleShuffle}
                    />
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
                    <img
                        className={`w-6 h-6 cursor-pointer ${isLoopActive ? 'opacity-100' : 'opacity-60'} hover:opacity-100 hover:scale-105`}
                        src={assets.loop}
                        alt="Loop"
                        onClick={toggleLoop}
                    />
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
                <img className="w-5 h-5 cursor-pointer hover:opacity-100 opacity-60 hover:scale-105"
                    src={assets.mic} alt="Mic" />
                <img className="w-6 h-6 cursor-pointer hover:opacity-100 opacity-60 hover:scale-105"
                    src={assets.queue} alt="Queue" />
                <img className="w-5 h-5 cursor-pointer hover:opacity-100 opacity-60 hover:scale-105"
                    src={assets.connect} alt="Connect" />
                <img
                    className="w-5 h-5 cursor-pointer hover:opacity-100 opacity-60 hover:scale-105"
                    src={assets.volume}
                    alt="Volume"
                    onClick={toggleMute}
                />
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
                <img className="w-5 h-5 cursor-pointer hover:opacity-100 opacity-60 hover:scale-105"
                    src={assets.miniplayer} alt="Mini player" />
                <img className="w-5 h-5 cursor-pointer hover:opacity-100 opacity-60 hover:scale-105"
                    src={assets.zoom} alt="Zoom" />
            </div>
        </div>
    );
};

export default Player;