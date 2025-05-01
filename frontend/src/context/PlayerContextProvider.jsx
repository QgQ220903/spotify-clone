import React, { createContext, useRef, useState, useEffect } from "react";

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {
  const [volume, setVolume] = useState(50);
  const [track, setTrack] = useState(null);
  const [playStatus, setPlayStatus] = useState(false);
  const [time, setTime] = useState({
    currentTime: { minute: "00", second: "00" },
    totaltime: { minute: "00", second: "00" },
  });

  const audioRef = useRef();
  const videoRef = useRef();
  const volumeBg = useRef();
  const volumeBar = useRef();
  const seekBg = useRef();
  const seekBar = useRef();

  const playWithSong = (song) => {
    setTrack(song);
  };

  useEffect(() => {
    if (track && audioRef.current && videoRef.current) {
      audioRef.current.src = track.audio_file;
      videoRef.current.src = track.video_file;
      audioRef.current.load();
      videoRef.current.load();

      const playBoth = async () => {
        try {
          await audioRef.current.play();
          await videoRef.current.play();
          setPlayStatus(true);
        } catch (error) {
          console.error("Lỗi phát nhạc:", error);
        }
      };
      playBoth();
    }
  }, [track]);

  const pause = () => {
    audioRef.current?.pause();
    videoRef.current?.pause();
    setPlayStatus(false);
  };

  const play = () => {
    audioRef.current?.play();
    videoRef.current?.play();
    setPlayStatus(true);
  };

  const handleVolumeChange = (e) => {
    if (!volumeBg.current) return;
    const rect = volumeBg.current.getBoundingClientRect();
    let newVolume = ((e.clientX - rect.left) / rect.width) * 100;
    newVolume = Math.max(0, Math.min(100, newVolume));
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume / 100;
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.ontimeupdate = () => {
        if (!audioRef.current || !seekBar.current) return;
        seekBar.current.style.width =
          (Math.floor(audioRef.current.currentTime / audioRef.current.duration * 100)) + "%";
        setTime({
          currentTime: {
            second: Math.floor(audioRef.current.currentTime % 60),
            minute: Math.floor(audioRef.current.currentTime / 60)
          },
          totaltime: {
            second: Math.floor(audioRef.current.duration % 60),
            minute: Math.floor(audioRef.current.duration / 60)
          }
        });
      };
    }
  }, []);

  const contextValue = {
    playWithSong,
    track, setTrack,
    playStatus, setPlayStatus,
    audioRef, videoRef,
    time, setTime,
    play, pause,
    volume, setVolume,
    volumeBg, volumeBar,
    seekBg, seekBar,
    handleVolumeChange
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {props.children}
    </PlayerContext.Provider>
  );
};

export default PlayerContextProvider;
