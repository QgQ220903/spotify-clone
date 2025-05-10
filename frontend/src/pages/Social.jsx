import React, { useState, useEffect } from 'react';
import { FriendService } from '../service/FriendService';
import { ChatService } from '../service/ChatService';
import ChatWindow from '../components/Chat/ChatWindow';

const Social = () => {
  // State quản lý tab đang active (messages hoặc friends)
  const [activeTab, setActiveTab] = useState('messages');

  // State lưu ID của user đang được chọn để chat
  const [selectedUserId, setSelectedUserId] = useState(null);

  // State lưu danh sách các cuộc trò chuyện
  const [conversations, setConversations] = useState([]);

  // State lưu từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');

  // State lưu kết quả tìm kiếm
  const [searchResults, setSearchResults] = useState([]);

  // State lưu danh sách lời mời kết bạn
  const [friendRequests, setFriendRequests] = useState([]);

  // State lưu danh sách bạn bè
  const [friends, setFriends] = useState([]);

  // Lấy ID của user hiện tại từ localStorage
  const currentUserId = parseInt(localStorage.getItem('userId'));

  // Hook useEffect để load dữ liệu bạn bè và lời mời khi component mount
  useEffect(() => {
    loadFriends();
    loadFriendRequests();
  }, []);

  /**
   * Hàm load danh sách bạn bè và các cuộc trò chuyện
   */
  const loadFriends = async () => {
    try {
      // Gọi API để lấy danh sách bạn bè
      const friendsResponse = await FriendService.getFriends();

      // Gọi API để lấy danh sách các cuộc trò chuyện
      const conversationsResponse = await ChatService.getConversations();

      // Tạo map để lưu tin nhắn cuối cùng và số tin nhắn chưa đọc
      const lastMessagesMap = {};
      conversationsResponse.forEach(conv => {
        lastMessagesMap[conv.user] = {
          last_message: conv.last_message,
          unread: conv.unread,
          timestamp: conv.timestamp
        };
      });

      // Kết hợp thông tin bạn bè với tin nhắn cuối cùng
      const friendsList = friendsResponse.results.map(friend => ({
        id: friend.friend_info.id,
        username: friend.friend_info.username,
        avatar: friend.friend_info.avatar,
        last_message: lastMessagesMap[friend.friend_info.id]?.last_message || 'Chưa có tin nhắn',
        unread: lastMessagesMap[friend.friend_info.id]?.unread || 0,
        timestamp: lastMessagesMap[friend.friend_info.id]?.timestamp
      }));

      // Cập nhật state
      setFriends(friendsList);
      setConversations(friendsList);
    } catch (error) {
      console.error('Lỗi khi tải danh sách bạn bè:', error);
    }
  };

  /**
   * Hàm load danh sách lời mời kết bạn
   */
  const loadFriendRequests = async () => {
    try {
      const response = await FriendService.getFriendRequests();
      setFriendRequests(response.results);
    } catch (error) {
      console.error('Lỗi khi tải lời mời kết bạn:', error);
    }
  };

  /**
   * Hàm xử lý tìm kiếm bạn bè
   */
  const handleSearch = async () => {
    // Không thực hiện tìm kiếm nếu từ khóa quá ngắn
    if (searchTerm.length < 2) return;

    try {
      const results = await FriendService.searchUsers(searchTerm);
      // Lọc bỏ user hiện tại khỏi kết quả tìm kiếm
      setSearchResults(results.filter(user => user.id !== currentUserId));
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
    }
  };

  /**
   * Hàm gửi lời mời kết bạn
   * @param {number} userId - ID của user muốn gửi lời mời
   */
  const handleSendRequest = async (userId) => {
    try {
      await FriendService.sendFriendRequest(userId);
      alert('Đã gửi lời mời kết bạn!');
      // Xóa user khỏi danh sách kết quả tìm kiếm sau khi gửi lời mời
      setSearchResults(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      alert('Lỗi khi gửi lời mời kết bạn');
    }
  };

  /**
   * Hàm chấp nhận lời mời kết bạn
   * @param {number} requestId - ID của lời mời kết bạn
   */
  const handleAcceptRequest = async (requestId) => {
    try {
      await FriendService.acceptFriendRequest(requestId);
      alert('Đã chấp nhận lời mời kết bạn!');
      // Load lại danh sách sau khi chấp nhận
      loadFriendRequests();
      loadFriends();
    } catch (error) {
      alert('Lỗi khi chấp nhận lời mời kết bạn');
    }
  };

  return (
    <div className="flex h-screen bg-[#121212] p-6 gap-6">
      {/* Sidebar bên trái */}
      <div className="w-[350px] flex flex-col gap-4">
        {/* Các tab chức năng */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'messages'
                ? 'bg-[#1DB954] text-black'
                : 'bg-[#282828] text-white hover:bg-[#383838]'
              }`}
          >
            Tin nhắn
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'friends'
                ? 'bg-[#1DB954] text-black'
                : 'bg-[#282828] text-white hover:bg-[#383838]'
              }`}
          >
            Bạn bè
          </button>
        </div>

        {/* Nội dung tương ứng với tab đang chọn */}
        <div className="bg-[#1e1e1e] p-4 rounded-xl shadow-lg flex-1 overflow-hidden flex flex-col">
          {activeTab === 'messages' ? (
            /* Danh sách tin nhắn */
            <div className="flex-1 overflow-y-auto">
              <h2 className="text-white text-xl font-bold mb-4">Tin nhắn</h2>
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedUserId(conv.id)}
                    className={`p-3 hover:bg-[#2a2a2a] rounded-lg cursor-pointer flex items-center gap-3 ${selectedUserId === conv.id ? 'bg-[#2a2a2a]' : ''
                      }`}
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-[#383838] rounded-full flex items-center justify-center">
                      {conv.avatar ? (
                        <img
                          src={conv.avatar}
                          alt={conv.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-xl">
                          {conv.username[0].toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Thông tin cuộc trò chuyện */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-semibold truncate">
                          {conv.username}
                        </span>
                        {conv.unread > 0 && (
                          <span className="bg-[#1DB954] text-black px-2 rounded-full text-xs">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm truncate">
                        {conv.last_message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Quản lý bạn bè */
            <div className="flex-1 overflow-y-auto">
              {/* Thanh tìm kiếm */}
              <div className="mb-6">
                <h2 className="text-white text-xl font-bold mb-3">Tìm bạn</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Nhập tên hoặc email..."
                    className="flex-1 bg-[#383838] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
                  />
                  <button
                    onClick={handleSearch}
                    className="bg-[#1DB954] hover:bg-[#1ed760] text-black px-4 rounded-lg font-semibold transition-colors"
                  >
                    Tìm
                  </button>
                </div>
              </div>

              {/* Kết quả tìm kiếm */}
              {searchResults.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">Kết quả tìm kiếm</h3>
                  <div className="space-y-3">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between bg-[#282828] p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#383838] rounded-full flex items-center justify-center">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.username}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white">
                                {user.username[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{user.username}</p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSendRequest(user.id)}
                          className="bg-[#1DB954] hover:bg-[#1ed760] text-black px-3 py-1 rounded-full text-sm font-semibold transition-colors"
                        >
                          Kết bạn
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lời mời kết bạn */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Lời mời kết bạn</h3>
                  {friendRequests.length > 0 && (
                    <span className="bg-[#1DB954] text-black px-2 rounded-full text-xs">
                      {friendRequests.length}
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {friendRequests.length > 0 ? (
                    friendRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between bg-[#282828] p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#383838] rounded-full flex items-center justify-center">
                            {request.friend_info.avatar ? (
                              <img
                                src={request.friend_info.avatar}
                                alt={request.friend_info.username}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white">
                                {request.friend_info.username[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-semibold">
                              {request.friend_info.username}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {request.friend_info.email}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="bg-[#1DB954] hover:bg-[#1ed760] text-black px-3 py-1 rounded-full text-sm font-semibold transition-colors"
                        >
                          Chấp nhận
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm py-2">Không có lời mời mới</p>
                  )}
                </div>
              </div>

              {/* Danh sách bạn bè */}
              <div>
                <h3 className="text-white font-semibold mb-3">Danh sách bạn bè ({friends.length})</h3>
                <div className="space-y-3">
                  {friends.length > 0 ? (
                    friends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center gap-3 bg-[#282828] p-3 rounded-lg hover:bg-[#2e2e2e] cursor-pointer"
                        onClick={() => {
                          setSelectedUserId(friend.id);
                          setActiveTab('messages');
                        }}
                      >
                        <div className="w-10 h-10 bg-[#383838] rounded-full flex items-center justify-center">
                          {friend.avatar ? (
                            <img
                              src={friend.avatar}
                              alt={friend.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white">
                              {friend.username[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{friend.username}</p>
                          <p className="text-gray-400 text-sm truncate">
                            {friend.last_message}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm py-2">Bạn chưa có bạn bè nào</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cửa sổ chat bên phải */}
      <div className="flex-1">
        {selectedUserId ? (
          <ChatWindow selectedUserId={selectedUserId} />
        ) : (
          <div className="bg-[#1e1e1e] p-6 rounded-xl shadow-lg h-full flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-[#282828] rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">Chọn một cuộc trò chuyện</h3>
            <p className="text-gray-400 text-center max-w-md">
              {activeTab === 'messages'
                ? "Chọn từ danh sách trò chuyện hoặc tìm bạn bè mới từ tab 'Bạn bè'"
                : "Tìm kiếm bạn bè hoặc chấp nhận lời mời kết bạn"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Social;