// ChatWindow.js
import React, { useState, useEffect, useRef } from 'react';
import { ChatService } from '../../service/ChatService';
import { useNavigate } from 'react-router-dom';
import { FriendService } from '../../service/FriendService';
const ChatWindow = ({ selectedUserId }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);
  const currentUserId = parseInt(localStorage.getItem('userId'));

  useEffect(() => {
    if (selectedUserId) {
      loadMessages();
      loadUserInfo();
    }
  }, [selectedUserId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      await ChatService.sendMessage(selectedUserId, newMessage);
      setNewMessage('');
      loadMessages();
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
    }
  };

  const loadUserInfo = async () => {
    try {
      // Trước tiên thử lấy thông tin từ tin nhắn
      const response = await ChatService.getMessages(selectedUserId);
      if (response.results && response.results.length > 0) {
        const otherUser = response.results[0].sender === currentUserId
          ? response.results[0].receiver_detail
          : response.results[0].sender_detail;
        setSelectedUser(otherUser);
      } else {
        // Nếu chưa có tin nhắn, lấy thông tin từ danh sách bạn bè
        const friendsResponse = await FriendService.getFriends();
        const friend = friendsResponse.results.find(f => f.friend_info.id === selectedUserId);
        if (friend) {
          setSelectedUser(friend.friend_info);
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin người dùng:', error);
    }
  };

  const loadMessages = async () => {
    const data = await ChatService.getMessages(selectedUserId);

    // Lọc tin nhắn chỉ giữa người dùng hiện tại và người được chọn
    const currentUserId = parseInt(localStorage.getItem('userId'));
    const filteredMessages = data.results.filter(msg =>
      (parseInt(msg.sender) === currentUserId && parseInt(msg.receiver) === selectedUserId) ||
      (parseInt(msg.sender) === selectedUserId && parseInt(msg.receiver) === currentUserId)
    );

    const sortedMessages = filteredMessages.sort((a, b) =>
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    setMessages(sortedMessages);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#1e1e1e] p-6 rounded-xl shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#383838] mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="bg-[#2a2a2a] hover:bg-[#383838] text-white p-2 rounded-full transition-all duration-200 shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-10 h-10 bg-gradient-to-br from-[#383838] to-[#282828] rounded-full flex items-center justify-center shadow-md">
            {selectedUser?.avatar ? (
              <img
                src={selectedUser.avatar}
                alt={selectedUser.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-lg font-semibold">
                {selectedUser?.username?.charAt(0)?.toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">
              {selectedUser?.username || 'Đang tải...'}
            </h3>
            <p className="text-[#1DB954] text-xs font-medium">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-2 scrollbar-thin scrollbar-thumb-[#383838] scrollbar-track-transparent">
        {messages.map((message) => {
          const isCurrentUser = parseInt(message.sender) === currentUserId;
          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${isCurrentUser ? 'pl-10' : 'pr-10'}`}>
                <div
                  className={`rounded-2xl px-4 py-2 shadow-md ${isCurrentUser
                    ? 'bg-gradient-to-r from-[#1DB954] to-[#1ed760] text-black'
                    : 'bg-[#2a2a2a] text-white'
                    }`}
                >
                  <p className="break-words">{message.content}</p>
                </div>
                <p className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                  {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3 bg-[#2a2a2a] p-3 rounded-xl shadow-md">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-[#383838] text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[#1DB954] transition-all"
          placeholder="Nhập tin nhắn..."
        />
        <button
          onClick={handleSend}
          className="bg-gradient-to-r from-[#1DB954] to-[#1ed760] text-black px-6 py-2 rounded-lg hover:opacity-90 font-semibold shadow-md transition-all duration-200"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;