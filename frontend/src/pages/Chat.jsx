// Chat.js
import React, { useState } from 'react';
import ChatList from '../components/Chat/ChatList';
import ChatWindow from '../components/Chat/ChatWindow';

const Chat = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);

  return (
    <div className="flex h-screen bg-[#121212] p-6 gap-6">
      <div className="w-[350px]">
        <ChatList onSelectChat={setSelectedUserId} />
      </div>
      <div className="flex-1">
        {selectedUserId ? (
          <ChatWindow selectedUserId={selectedUserId} />
        ) : (
          <div className="bg-[#1e1e1e] p-6 rounded-xl shadow-lg h-full flex flex-col items-center justify-center text-gray-400">
            <div className="w-24 h-24 bg-[#2a2a2a] rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Chọn cuộc trò chuyện</h3>
            <p className="text-sm max-w-md text-center">Chọn một cuộc trò chuyện từ danh sách để bắt đầu nhắn tin</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;