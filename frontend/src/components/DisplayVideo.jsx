import React, { useContext, useEffect, useRef } from "react";
import { PlayerContext } from "../context/PlayerContextProvider";

const DisplayVideo = () => {
    const { track, videoRef, audioRef, playStatus } = useContext(PlayerContext);
    const containerRef = useRef(null);

    const handleDownload = async () => {
      try {
        // Sử dụng endpoint API mới thay vì truy cập trực tiếp file
        const downloadUrl = `/api/download/video/${encodeURIComponent(track.video_file.replace('/media/', ''))}`;

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${track.title}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Download failed:', error);
        alert('Tải xuống thất bại. Vui lòng thử lại!');
      }
    };

    // Đồng bộ video với audio
    useEffect(() => {
        if (videoRef.current && audioRef.current && track?.video_file) {
            videoRef.current.currentTime = audioRef.current.currentTime;
            if (playStatus) {
                videoRef.current.play().catch(err => console.error("Lỗi phát video:", err));
            }
        }
    }, [track, videoRef, audioRef, playStatus]);

    if (!track?.video_file) {
        return (
            <div className="bg-[#121212] w-[100%] h-full relative">
                <div className="absolute flex items-center justify-between w-full text-white p-3 rounded-lg z-50">
                    Trình duyệt không hỗ trợ video.
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="bg-[#121212] w-[80%] h-full flex flex-col">
            {/* Player video */}
            <div className="relative">
                <div className="w-full flex items-start z-20">
                    <video
                        ref={videoRef}
                        className="w-full h-auto"
                        preload="auto"
                        controls={false}
                        muted
                        playsInline
                    >
                        <source src={track.video_file} type="video/mp4" />
                        Trình duyệt không hỗ trợ video.
                    </video>
                </div>
            </div>
            
            {/* Thông tin bài hát và nút tải xuống */}
            <div className="bg-[#121212] text-white p-4">
                <div className="flex items-start space-x-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold uppercase">{track.title}</h3>
                    </div>
                    <div className="flex space-x-2">
                        {/* Nút yêu thích */}
                        <button className="text-white p-2 rounded-full hover:bg-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>

                        {/* Nút tải xuống (đã cập nhật dùng file-saver) */}
                        <button
                            className="text-white p-2 rounded-full hover:bg-gray-700"
                            onClick={handleDownload}
                            title="Download"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 4v12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
                
                {/* Ngày phát hành (nếu có) */}
                {track.release_date && (
                    <div className="mt-3 text-sm text-gray-400">
                        {track.release_date}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisplayVideo;