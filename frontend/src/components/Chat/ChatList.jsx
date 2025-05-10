// ChatList.js
import React, { useEffect, useState } from 'react';
import { ChatService } from '../../service/ChatService';
import { FriendService } from '../../service/FriendService';

const ChatList = ({ onSelectChat }) => {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      // Lấy danh sách bạn bè
      const friendsResponse = await FriendService.getFriends();
      const friends = friendsResponse.results;

      // Lấy danh sách cuộc trò chuyện
      const conversationsResponse = await ChatService.getConversations();

      // Tạo map lưu trữ tin nhắn cuối cùng theo user_id
      const lastMessagesMap = {};
      conversationsResponse.forEach(conv => {
        lastMessagesMap[conv.user] = {
          last_message: conv.last_message,
          unread: conv.unread,
          timestamp: conv.timestamp
        };
      });

      // Tạo danh sách conversations từ danh sách bạn bè và tin nhắn
      const conversations = friends.map(friend => ({
        user: friend.friend_info.id,
        username: friend.friend_info.username,
        avatar: friend.friend_info.avatar,
        last_message: lastMessagesMap[friend.friend_info.id]?.last_message || 'Chưa có tin nhắn',
        unread: lastMessagesMap[friend.friend_info.id]?.unread || 0,
        timestamp: lastMessagesMap[friend.friend_info.id]?.timestamp || null
      }));

      setConversations(conversations);
    } catch (error) {
      console.error('Lỗi khi tải danh sách bạn bè:', error);
      setConversations([]);
    }
  };

  const handleSelectChat = (userId) => {
    onSelectChat(userId);
    // Cập nhật lại danh sách sau khi chọn chat
    loadConversations();
  };

  return (
    <div className="bg-[#1e1e1e] p-4 rounded-xl shadow-lg h-full overflow-hidden flex flex-col">
      <h2 className="text-white text-2xl font-bold mb-6 pb-4 border-b border-[#383838]">Tin nhắn</h2>
      <div className="overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-[#383838] scrollbar-track-transparent">
        {conversations.map((conv) => (
          <div
            key={conv.user}
            onClick={() => handleSelectChat(conv.user)}
            className="p-3 hover:bg-[#2a2a2a] rounded-lg cursor-pointer flex items-center gap-3 transition-all duration-200"
          >
            {/* Avatar */}
            <div className="w-12 h-12 bg-gradient-to-br from-[#383838] to-[#282828] rounded-full flex-shrink-0 flex items-center justify-center shadow-md">
              {conv.avatar ? (
                <img
                  src={conv.avatar}
                  alt={conv.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-xl font-semibold">
                  {conv.username?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>

            {/* Chat info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold truncate">{conv.username}</span>
                {conv.unread > 0 && (
                  <span className="bg-[#1DB954] text-black px-2 py-0.5 rounded-full text-xs font-bold min-w-[20px] flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm truncate mt-1">{conv.last_message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;