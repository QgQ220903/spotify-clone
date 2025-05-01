import React, { useContext, useRef, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { PlayerContext } from "../context/PlayerContextProvider";

const Player = ({ toggleVideo }) => {
    const {
        track,
        seekBar,
        seekBg,
        playStatus,
        play,
        pause,
        time,
        previous,
        next,
        seekSong,
        volumeBg,
        volumeBar,
        startVolumeDrag,
        volume,
        handleVolumeChange
    } = useContext(PlayerContext);

    const audioRef = useRef(null);
    const videoRef = useRef(null);
    const [isVideoVisible, setIsVideoVisible] = useState(false);

    useEffect(() => {
        if (!track) return;

        if (audioRef.current) {
            audioRef.current.src = track.audio_file || '';
            audioRef.current.load();
        }

        if (videoRef.current && track.video_file) {
            videoRef.current.src = track.video_file || '';
            videoRef.current.load();
        }

        // Sync playback status
        const handlePlayback = async () => {
            try {
                if (playStatus) {
                    if (audioRef.current) await audioRef.current.play();
                    if (isVideoVisible && videoRef.current && track.video_file) await videoRef.current.play();
                } else {
                    if (audioRef.current) audioRef.current.pause();
                    if (videoRef.current) videoRef.current.pause();
                }
            } catch (error) {
                console.error("Playback error:", error);
            }
        };

        handlePlayback();
    }, [track, playStatus, isVideoVisible]);

    // Sync audio and video playback
    useEffect(() => {
        const handleAudioTimeUpdate = () => {
            if (videoRef.current && audioRef.current && isVideoVisible) {
                videoRef.current.currentTime = audioRef.current.currentTime;
            }
        };

        if (audioRef.current) {
            audioRef.current.addEventListener('timeupdate', handleAudioTimeUpdate);
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('timeupdate', handleAudioTimeUpdate);
            }
        };
    }, [isVideoVisible]);

    // Toggle video visibility
    const handleToggleVideo = () => {
        setIsVideoVisible(prev => !prev);
        if (typeof toggleVideo === 'function') {
            toggleVideo();
        }
    };

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
                    <img className="w-4 h-4 opacity-60 hover:opacity-100 hover:scale-105"
                        src={assets.add} alt="Add" />
                </div>
            </div>

            {/* Player controls - Center */}
            <div className="flex flex-col items-center gap-1 mx-auto">
                <div className="flex gap-5 items-center justify-center">
                    <img className="w-5 h-5 cursor-pointer opacity-60 hover:opacity-100 hover:scale-105"
                        src={assets.arrowsong} alt="Shuffle" />
                    <img onClick={previous} className="w-7 h-7 cursor-pointer opacity-60 hover:opacity-100 hover:scale-105"
                        src={assets.prev} alt="Previous" />
                    {playStatus ? (
                        <div onClick={pause} className="cursor-pointer w-8 h-8 bg-white flex items-center justify-center rounded-full hover:scale-105">
                            <img className="w-3.5 h-3.5" src={assets.pause} alt="Pause" />
                        </div>
                    ) : (
                        <div onClick={play} className="cursor-pointer w-8 h-8 bg-white flex items-center justify-center rounded-full hover:scale-105">
                            <img className="w-3.5 h-3.5" src={assets.play} alt="Play" />
                        </div>
                    )}
                    <img onClick={next} className="w-7 h-7 cursor-pointer opacity-60 hover:opacity-100 hover:scale-105"
                        src={assets.next} alt="Next" />
                    <img className="w-6 h-6 cursor-pointer opacity-60 hover:opacity-100 hover:scale-105"
                        src={assets.loop} alt="Loop" />
                </div>

                <div className="flex items-center gap-3">
                    <p className="text-xs mb-1">
                        {time?.currentTime?.minute}:{time?.currentTime?.second}
                    </p>
                    <div ref={seekBg} onClick={seekSong} className="w-96 bg-gray-700 rounded-full cursor-pointer">
                        <hr ref={seekBar} className="h-1 border-none w-0 bg-green-500 rounded-full" />
                    </div>
                    <p className="text-xs mb-1">
                        {time?.totaltime?.minute}:{time?.totaltime?.second}
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
                <img className="w-5 h-5 cursor-pointer hover:opacity-100 opacity-60 hover:scale-105"
                    src={assets.volume} alt="Volume" />
                <div ref={volumeBg} onMouseDown={startVolumeDrag} onClick={handleVolumeChange}
                    className="w-24 bg-gray-700 rounded-full cursor-pointer">
                    <hr
                        ref={volumeBar}
                        className="h-1 border-none bg-green-500 rounded-full"
                        style={{ width: `${volume}%` }}
                    />
                </div>
                <img className="w-5 h-5 cursor-pointer hover:opacity-100 opacity-60 hover:scale-105"
                    src={assets.miniplayer} alt="Mini player" />
                <img className="w-5 h-5 cursor-pointer hover:opacity-100 opacity-60 hover:scale-105"
                    src={assets.zoom} alt="Zoom" />
            </div>

            {/* Hidden media elements */}
            <audio
                ref={audioRef}
                className="hidden"
                onPlay={() => !playStatus && play()}
                onPause={() => playStatus && pause()}
            />

            {/* Conditionally render video container based on isVideoVisible */}
            {isVideoVisible && track.video_file && (
                <div className="hidden">
                    <video
                        ref={videoRef}
                        onPlay={() => !playStatus && play()}
                        onPause={() => playStatus && pause()}
                    />
                </div>
            )}
        </div>
    );
};

export default Player;