import { useEffect, useState } from "react";

const useWebSocket = (url) => {
    const [data, setData] = useState(null);
    useEffect(() => {
        const socket = new WebSocket(url);
        socket.onmessage = (event) => {
            setData(JSON.parse(event.data));
        };
        return () => socket.close();
    }, [url]);
    return data;
};

export default useWebSocket;
