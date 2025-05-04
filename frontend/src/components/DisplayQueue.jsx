import React, { useContext, useEffect, useState } from "react";
import { PlayerContext } from "../context/PlayerContextProvider";

const DisplayQueue = ({ isOpen, onClose }) => {
    // Get needed values from context
    const playerContext = useContext(PlayerContext);
    
    // Local state to store queue data
    const [queueData, setQueueData] = useState({ current: null, upcoming: [] });
    
    // Update queue data when relevant things change
    useEffect(() => {
        if (!isOpen) return;
        
        // Use the new getCurrentQueue helper function
        if (playerContext.getCurrentQueue) {
            setQueueData(playerContext.getCurrentQueue());
        } else {
            // Fallback to manual calculation if the helper doesn't exist
            const manualQueueData = getQueueDataManually();
            setQueueData(manualQueueData);
        }
    }, [isOpen, playerContext.track, playerContext.queueUpdated]);
    
    // Manual fallback function to get queue data
    const getQueueDataManually = () => {
        const trackListRef = playerContext.trackList;
        const trackIndexRef = playerContext.trackIndex;
        
        if (!trackListRef?.current || !trackListRef.current.length) {
            return { current: null, upcoming: [] };
        }
        
        const currentTrack = trackListRef.current[trackIndexRef.current];
        const upcomingTracks = trackListRef.current.slice(trackIndexRef.current + 1);
        
        return {
            current: currentTrack,
            upcoming: upcomingTracks
        };
    };

    // Play selected song from queue
    const playSongFromQueue = (song) => {
        if (playerContext.playWithSong && song) {
            // Use the current playlist when playing from queue
            if (playerContext.trackList?.current) {
                playerContext.playWithSong(song, playerContext.trackList.current);
            } else {
                playerContext.playWithSong(song);
            }
        }
    };

    // Don't render anything if not open
    if (!isOpen) return null;

    return (
        <div className="fixed top-0 right-0 h-full bg-[#121212] w-80 z-50 text-white overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h3 className="text-lg font-bold">Queue</h3>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-gray-800 rounded-full"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Currently playing */}
                <div className="p-4">
                    <h4 className="text-sm text-gray-400 mb-2">Now Playing</h4>
                    {queueData.current ? (
                        <div className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded group">
                            {queueData.current.thumbnail && (
                                <img 
                                    src={queueData.current.thumbnail} 
                                    alt={queueData.current.title} 
                                    className="w-10 h-10 rounded"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{queueData.current.title}</p>
                                <p className="text-xs text-gray-400 truncate">
                                    {queueData.current.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}
                                </p>
                            </div>
                            <div className="text-green-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No track playing</p>
                    )}
                </div>

                {/* Next up */}
                <div className="p-4 pt-0">
                    <h4 className="text-sm text-gray-400 mb-2">Next Up</h4>
                    {queueData.upcoming && queueData.upcoming.length > 0 ? (
                        <div className="space-y-1">
                            {queueData.upcoming.map((song, index) => (
                                <div 
                                    key={`${song.id || index}-${index}`}
                                    className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded group cursor-pointer"
                                    onClick={() => playSongFromQueue(song)}
                                >
                                    {song.thumbnail && (
                                        <img 
                                            src={song.thumbnail} 
                                            alt={song.title} 
                                            className="w-10 h-10 rounded"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{song.title}</p>
                                        <p className="text-xs text-gray-400 truncate">
                                            {song.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}
                                        </p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No upcoming tracks</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DisplayQueue;