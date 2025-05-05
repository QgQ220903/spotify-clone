import React, { createContext, useRef, useState, useEffect } from "react";
import { fetchAllSongs } from "../service/AlbumService";

export const PlayerContext = createContext();

const PlayerContextProvider = ({ children }) => {
    // States
    const [volume, setVolume] = useState(50);
    const [track, setTrack] = useState(null);
    const [playStatus, setPlayStatus] = useState(false);
    const [time, setTime] = useState({
        currentTime: { minute: "00", second: "00" },
        totaltime: { minute: "00", second: "00" },
    });
    const [shuffleMode, setShuffleMode] = useState(false);
    const [repeatMode, setRepeatMode] = useState(0);
    const [videoVisible, setVideoVisible] = useState(false);
    // Add a queue state to trigger DisplayQueue updates
    const [queueUpdated, setQueueUpdated] = useState(0);

    // Refs
    const audioRef = useRef(null);
    const videoRef = useRef(null);
    const volumeBg = useRef(null);
    const volumeBar = useRef(null);
    const seekBg = useRef(null);
    const seekBar = useRef(null);
    const trackList = useRef([]);
    const trackIndex = useRef(0);
    const originalTrackList = useRef([]);
    const [isDraggingSeek, setIsDraggingSeek] = useState(false);
    const [isSeeking, setIsSeeking] = useState(false);

    // Format time function
    const formatTime = (t) => ({
        minute: String(Math.floor(t / 60)).padStart(2, "0"),
        second: String(Math.floor(t % 60)).padStart(2, "0"),
    });

    const fetchSongsFromAlbum = async (albumId) => {
        try {
            const allSongs = await fetchAllSongs();
            return allSongs.filter(song => song.album && song.album.id === albumId);
        } catch (error) {
            console.error("Error fetching songs from album:", error);
            return [];
        }
    };

    // Updated playWithSong function with better queue management
    const playWithSong = async (song, list = null) => {
        if (!song) {
            console.error("No song provided to playWithSong");
            return;
        }

        console.log("Playing song:", song);
        setTrack(song);

        let updatedTrackList = [];
        let newIndex = 0;

        if (list && Array.isArray(list) && list.length > 0) {
            // If a list is provided, use it
            originalTrackList.current = [...list];
            
            if (shuffleMode) {
                updatedTrackList = shufflePlaylist([...list], song);
            } else {
                updatedTrackList = [...list];
            }
            
            // Find the index of the song in the new list
            newIndex = updatedTrackList.findIndex(s => s.id === song.id);
            if (newIndex === -1) newIndex = 0;
            
        } else if (song?.album?.id) {
            // If no list provided but song has album, fetch album songs
            try {
                const albumSongs = await fetchSongsFromAlbum(song.album.id);
                originalTrackList.current = [...albumSongs];
                
                if (shuffleMode) {
                    updatedTrackList = shufflePlaylist([...albumSongs], song);
                } else {
                    updatedTrackList = [...albumSongs];
                }
                
                newIndex = updatedTrackList.findIndex(s => s.id === song.id);
                if (newIndex === -1) newIndex = 0;
                
            } catch (error) {
                console.error("Error loading album songs:", error);
                updatedTrackList = [song];
                newIndex = 0;
            }
        } else {
            // Fallback to just the single song
            updatedTrackList = [song];
            newIndex = 0;
        }

        // Update our refs
        trackList.current = updatedTrackList;
        trackIndex.current = newIndex;
        
        // Trigger a queue update
        setQueueUpdated(prev => prev + 1);

        // Setup audio playback
        if (audioRef.current) {
            audioRef.current.src = song.audio_file || '';
            audioRef.current.volume = volume / 100;
            audioRef.current.load();

            audioRef.current.onloadeddata = () => {
                play();
                const total = audioRef.current.duration || 0;
                setTime(prev => ({
                    ...prev,
                    totaltime: formatTime(total)
                }));
            };
        }

        // Setup video if available
        if (videoRef.current && song.video_file) {
            videoRef.current.src = song.video_file;
            videoRef.current.load();

            videoRef.current.onloadeddata = () => {
                // Ensure video is synced when loaded
                if (audioRef.current) {
                    videoRef.current.currentTime = audioRef.current.currentTime;
                }

                if (playStatus && videoVisible) {
                    videoRef.current.play().catch(e => console.error("Video play error:", e));
                }
            };
        }
        
        console.log("Queue updated:", {
            trackList: trackList.current,
            trackIndex: trackIndex.current,
            currentTrack: trackList.current[trackIndex.current]
        });
    };

    // Synchronize media
    useEffect(() => {
        const audio = audioRef.current;
        const video = videoRef.current;
        let syncInterval;

        const syncMedia = () => {
            if (!audio || !video || !videoVisible) return;
            if (Math.abs(video.currentTime - audio.currentTime) > 0.05) {
                video.currentTime = audio.currentTime;
            }
        };

        const handlePlay = () => {
            if (!video || !videoVisible) return;
            video.currentTime = audio.currentTime;
            video.play().catch(e => console.log("Video play prevented:", e));
            syncInterval = setInterval(syncMedia, 30);
        };

        const handlePause = () => {
            if (video && videoVisible) video.pause();
            clearInterval(syncInterval);
        };

        const handleSeeking = () => {
            if (!video || !videoVisible) return;
            setIsSeeking(true);
            video.currentTime = audio.currentTime;
            clearInterval(syncInterval);
        };

        const handleSeeked = () => {
            if (!video || !videoVisible) return;
            setIsSeeking(false);
            video.currentTime = audio.currentTime;
            if (playStatus) {
                video.play().catch(e => console.log("Video play prevented after seek:", e));
                syncInterval = setInterval(syncMedia, 30);
            }
        };

        const frequentSync = setInterval(() => {
            if (video && audio && videoVisible && (isDraggingSeek || isSeeking)) {
                video.currentTime = audio.currentTime;
            }
        }, 30);

        audio?.addEventListener('timeupdate', syncMedia);
        audio?.addEventListener('play', handlePlay);
        audio?.addEventListener('pause', handlePause);
        audio?.addEventListener('seeking', handleSeeking);
        audio?.addEventListener('seeked', handleSeeked);

        return () => {
            clearInterval(frequentSync);
            clearInterval(syncInterval);
            audio?.removeEventListener('timeupdate', syncMedia);
            audio?.removeEventListener('play', handlePlay);
            audio?.removeEventListener('pause', handlePause);
            audio?.removeEventListener('seeking', handleSeeking);
            audio?.removeEventListener('seeked', handleSeeked);
        };
    }, [playStatus, videoVisible, isDraggingSeek, isSeeking]);

    // Handle video end
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleVideoEnd = () => {
            handleTrackEnded();
        };

        video.addEventListener('ended', handleVideoEnd);
        return () => video.removeEventListener('ended', handleVideoEnd);
    }, []);

    // Sync video when visibility changes
    useEffect(() => {
        const video = videoRef.current;
        const audio = audioRef.current;

        if (video && audio && videoVisible) {
            video.currentTime = audio.currentTime;

            if (playStatus) {
                video.play().catch(e => console.log("Video play prevented when made visible:", e));
            }
        }
    }, [videoVisible, playStatus]);

    const handleTrackEnded = () => {
        if (trackList.current.length === 0) return;

        if (repeatMode === 2) {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(e => console.error("Playback error:", e));
            }
        } else {
            next();

            if (repeatMode === 1 && trackIndex.current === 0) {
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(e => console.error("Playback error:", e));
                }
            }
        }
    };

    const play = () => {
        if (!audioRef.current) return;

        audioRef.current.play()
            .then(() => {
                setPlayStatus(true);
                if (videoRef.current && track?.video_file && videoVisible) {
                    videoRef.current.currentTime = audioRef.current.currentTime;
                    videoRef.current.play().catch(e => console.error("Video play error:", e));
                }
            })
            .catch(error => {
                console.error("Play error:", error);
            });
    };

    const pause = () => {
        if (!audioRef.current) return;

        audioRef.current.pause();
        setPlayStatus(false);
        if (videoRef.current) videoRef.current.pause();
    };

    const next = () => {
        if (trackList.current.length === 0) return;

        trackIndex.current = (trackIndex.current + 1) % trackList.current.length;
        const nextSong = trackList.current[trackIndex.current];
        
        // Update track state to trigger UI updates
        setTrack(nextSong);
        // Trigger queue update
        setQueueUpdated(prev => prev + 1);

        if (audioRef.current) {
            audioRef.current.src = nextSong.audio_file || '';
            audioRef.current.load();

            audioRef.current.onloadeddata = () => {
                if (playStatus) {
                    audioRef.current.play().catch(e => console.error("Play error:", e));
                }
            };
        }
        if (videoRef.current && videoVisible) {
            videoRef.current.currentTime = 0;
        }
    };

    const previous = () => {
        if (trackList.current.length === 0) return;

        if (audioRef.current?.currentTime > 3) {
            audioRef.current.currentTime = 0;
            return;
        }

        trackIndex.current = (trackIndex.current - 1 + trackList.current.length) % trackList.current.length;
        const prevSong = trackList.current[trackIndex.current];
        
        // Update track state to trigger UI updates
        setTrack(prevSong);
        // Trigger queue update
        setQueueUpdated(prev => prev + 1);

        if (audioRef.current) {
            audioRef.current.src = prevSong.audio_file || '';
            audioRef.current.load();

            audioRef.current.onloadeddata = () => {
                if (playStatus) {
                    audioRef.current.play().catch(e => console.error("Play error:", e));
                }
            };
        }
        if (videoRef.current && videoVisible) {
            videoRef.current.currentTime = 0;
        }
    };

    const shufflePlaylist = (list, currentSong) => {
        const filteredList = list.filter(song => song.id !== currentSong.id);

        for (let i = filteredList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filteredList[i], filteredList[j]] = [filteredList[j], filteredList[i]];
        }

        return [currentSong, ...filteredList];
    };

    const toggleShuffle = () => {
        const newShuffleMode = !shuffleMode;
        setShuffleMode(newShuffleMode);

        if (trackList.current.length <= 1) return;

        const currentSong = trackList.current[trackIndex.current];

        if (newShuffleMode) {
            trackList.current = shufflePlaylist([...originalTrackList.current], currentSong);
        } else {
            trackList.current = [...originalTrackList.current];
        }

        trackIndex.current = trackList.current.findIndex(song => song.id === currentSong.id);
        // Trigger queue update
        setQueueUpdated(prev => prev + 1);
    };

    const toggleRepeat = () => {
        setRepeatMode((prevMode) => (prevMode + 1) % 3);
    };

    const toggleVideo = () => {
        setVideoVisible(prev => {
            const newState = !prev;

            if (newState && videoRef.current && audioRef.current) {
                videoRef.current.currentTime = audioRef.current.currentTime;

                if (playStatus) {
                    videoRef.current.play().catch(e => console.error("Video play error when toggling:", e));
                }
            }

            return newState;
        });
    };

    const handleVolumeChange = (e) => {
        if (!volumeBg.current) return;

        const rect = volumeBg.current.getBoundingClientRect();
        let newVolume = ((e.clientX - rect.left) / rect.width) * 100;
        newVolume = Math.max(0, Math.min(100, newVolume));

        setVolume(newVolume);

        if (volumeBar.current) {
            volumeBar.current.style.width = `${newVolume}%`;
        }

        if (audioRef.current) {
            audioRef.current.volume = newVolume / 100;
        }
    };

    useEffect(() => {
        const updateProgress = () => {
            if (!audioRef.current) return;

            const current = audioRef.current.currentTime;
            const total = audioRef.current.duration || 0;

            if (seekBar.current && total > 0) {
                const progressPercent = (current / total) * 100;
                seekBar.current.style.width = `${progressPercent}%`;
            }

            setTime({
                currentTime: formatTime(current),
                totaltime: formatTime(total),
            });
        };

        const audio = audioRef.current;
        if (audio) {
            audio.addEventListener("timeupdate", updateProgress);
            audio.addEventListener("loadedmetadata", updateProgress);
            audio.addEventListener("durationchange", updateProgress);
            audio.volume = volume / 100;
        }

        return () => {
            if (audio) {
                audio.removeEventListener("timeupdate", updateProgress);
                audio.removeEventListener("loadedmetadata", updateProgress);
                audio.removeEventListener("durationchange", updateProgress);
            }
        };
    }, [track, volume]);

    const seekSong = (e) => {
        if (!seekBg.current || !audioRef.current || !audioRef.current.duration) {
            return;
        }
    
        const rect = seekBg.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percent = clickX / width;
        const newTime = audioRef.current.duration * percent;
    
        setIsSeeking(true);
        
        if (videoRef.current && videoVisible) {
            videoRef.current.currentTime = newTime;
        }
    
        audioRef.current.currentTime = newTime;
    
        if (seekBar.current) {
            seekBar.current.style.width = `${percent * 100}%`;
        }
    
        setTime(prev => ({
            ...prev,
            currentTime: formatTime(newTime)
        }));
        
        setIsDraggingSeek(true);
        
        setTimeout(() => {
            setIsSeeking(false);
        }, 200);
    };

    const setDraggingSeek = (isDragging) => {
        setIsDraggingSeek(isDragging);
    };

    const handleSeekMouseUp = () => {
        setIsDraggingSeek(false);
    };

    // Function to get current queue - useful for DisplayQueue component
    const getCurrentQueue = () => {
        if (!trackList.current || !trackList.current.length) {
            return { current: null, upcoming: [] };
        }
        
        const currentTrack = trackList.current[trackIndex.current];
        const upcomingTracks = trackList.current.slice(trackIndex.current + 1);
        
        return {
            current: currentTrack,
            upcoming: upcomingTracks
        };
    };

    const contextValue = {
        track,
        setTrack,
        playWithSong,
        playStatus,
        setPlayStatus,
        play,
        pause,
        audioRef,
        videoRef,
        time,
        seekBar,
        seekBg,
        seekSong,
        next,
        previous,
        volume,
        setVolume,
        volumeBg,
        volumeBar,
        handleVolumeChange,
        shuffleMode,
        setShuffleMode,
        toggleShuffle,
        repeatMode,
        setRepeatMode,
        toggleRepeat,
        videoVisible,
        setVideoVisible,
        toggleVideo,
        isDraggingSeek,
        setDraggingSeek,
        handleSeekMouseUp,
        isSeeking,
        setIsSeeking,
        trackList,
        trackIndex,
        queueUpdated,  
        getCurrentQueue
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {children}
        </PlayerContext.Provider>
    );
};

export default PlayerContextProvider;