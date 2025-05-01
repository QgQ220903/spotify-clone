import React, { createContext, useRef, useState, useEffect } from "react";

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

  // Refs
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const volumeBg = useRef(null);
  const volumeBar = useRef(null);
  const seekBg = useRef(null);
  const seekBar = useRef(null);
  const trackList = useRef([]);
  const trackIndex = useRef(0);

  // Phải đảm bảo rằng audio element đã được khởi tạo trước khi sử dụng
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  // Format time function - đảm bảo luôn trả về chuỗi có 2 ký tự
  const formatTime = (t) => ({
    minute: String(Math.floor(t / 60)).padStart(2, "0"),
    second: String(Math.floor(t % 60)).padStart(2, "0"),
  });

  // Load và phát bài hát
  const playWithSong = (song, list = []) => {
    console.log("Phát bài hát:", song);
    setTrack(song);

    if (list.length > 0) {
      trackList.current = list;
      trackIndex.current = list.findIndex((s) => s.id === song.id);
    }

    // Đảm bảo audioRef được thiết lập đúng
    if (audioRef.current) {
      // Thiết lập src trước
      audioRef.current.src = song.audio_file || '';

      // Đặt volume trước khi phát
      audioRef.current.volume = volume / 100;

      // Load audio
      audioRef.current.load();

      // Sau khi load, phát nhạc
      audioRef.current.onloadeddata = () => {
        play();

        // Cập nhật tổng thời gian ngay khi có dữ liệu
        const total = audioRef.current.duration || 0;
        setTime(prev => ({
          ...prev,
          totaltime: formatTime(total)
        }));
      };
    }

    // Thiết lập video nếu có
    if (videoRef.current && song.video_file) {
      videoRef.current.src = song.video_file;
      videoRef.current.load();
    }
  };

  // Phát nhạc
  const play = () => {
    console.log("Phát nhạc");
    if (!audioRef.current) return;

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setPlayStatus(true);
          if (videoRef.current) videoRef.current.play();
        })
        .catch(error => {
          console.error("Lỗi khi phát nhạc:", error);
        });
    }
  };

  // Tạm dừng
  const pause = () => {
    console.log("Tạm dừng");
    if (!audioRef.current) return;

    audioRef.current.pause();
    setPlayStatus(false);
    if (videoRef.current) videoRef.current.pause();
  };

  // Xử lý thay đổi âm lượng
  const handleVolumeChange = (e) => {
    if (!volumeBg.current) return;

    const rect = volumeBg.current.getBoundingClientRect();
    let newVolume = ((e.clientX - rect.left) / rect.width) * 100;

    // Đảm bảo giá trị trong khoảng 0-100
    newVolume = Math.max(0, Math.min(100, newVolume));

    console.log("Thay đổi âm lượng:", newVolume);
    setVolume(newVolume);

    // Cập nhật thanh âm lượng visual
    if (volumeBar.current) {
      volumeBar.current.style.width = `${newVolume}%`;
    }

    // Thay đổi âm lượng thực tế của audio element
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  // Cập nhật thời gian và thanh tiến trình
  useEffect(() => {
    const updateProgress = () => {
      if (!audioRef.current) return;

      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration || 0;

      // Cập nhật thanh tiến trình
      if (seekBar.current && total > 0) {
        const progressPercent = (current / total) * 100;
        seekBar.current.style.width = `${progressPercent}%`;
      }

      // Cập nhật hiển thị thời gian
      setTime({
        currentTime: formatTime(current),
        totaltime: formatTime(total),
      });
    };

    // Lắng nghe sự kiện timeupdate để cập nhật tiến trình
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener("timeupdate", updateProgress);
      audio.addEventListener("loadedmetadata", updateProgress);
      audio.addEventListener("durationchange", updateProgress);

      // Đảm bảo âm lượng được cập nhật khi component mount
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

  // Đảm bảo âm lượng được cập nhật khi thay đổi trực tiếp
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Tua nhạc
  const seekSong = (e) => {
    if (!seekBg.current || !audioRef.current || !audioRef.current.duration) {
      return;
    }

    const rect = seekBg.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    // Tính toán vị trí mới (phần trăm)
    const percent = clickX / width;
    const newTime = audioRef.current.duration * percent;

    console.log("Tua nhạc đến:", formatTime(newTime));

    // Cập nhật thời gian nghe
    audioRef.current.currentTime = newTime;

    // Cập nhật thanh tua ngay lập tức để có phản hồi trực quan
    if (seekBar.current) {
      seekBar.current.style.width = `${percent * 100}%`;
    }

    // Cập nhật thời gian hiển thị
    setTime(prev => ({
      ...prev,
      currentTime: formatTime(newTime)
    }));

    // Đồng bộ hóa video nếu có
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Chuyển bài tiếp theo
  const next = () => {
    if (trackList.current.length <= 1) return;

    trackIndex.current = (trackIndex.current + 1) % trackList.current.length;
    const nextSong = trackList.current[trackIndex.current];
    setTrack(nextSong);

    if (playStatus) {
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = nextSong.audio_file;
          audioRef.current.load();
          audioRef.current.play();
        }
      }, 50);
    }
  };

  // Chuyển bài trước đó
  const previous = () => {
    if (trackList.current.length <= 1) return;

    // Nếu đã phát hơn 3 giây, quay lại đầu bài hiện tại
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    trackIndex.current = (trackIndex.current - 1 + trackList.current.length) % trackList.current.length;
    const prevSong = trackList.current[trackIndex.current];
    setTrack(prevSong);

    if (playStatus) {
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = prevSong.audio_file;
          audioRef.current.load();
          audioRef.current.play();
        }
      }, 50);
    }
  };

  // Context value
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
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerContextProvider;