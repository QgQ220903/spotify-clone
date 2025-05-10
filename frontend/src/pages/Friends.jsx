import React, { useState, useEffect } from 'react';
import { FriendService } from '../service/FriendService';

const Friends = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]); // Thêm state mới
  const [loading, setLoading] = useState(false);
  const currentUserId = parseInt(localStorage.getItem('userId'));

  // Lấy danh sách bạn bè
  const loadFriendsList = async () => {
    try {
      const response = await FriendService.getFriends();
      console.log('Response từ getFriends:', response);
      console.log('Cấu trúc của response.results:', response?.results);
      setFriendsList(response?.results || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bạn bè:', error);
      setFriendsList([]);
    }
  };

  useEffect(() => {
    loadFriendRequests();
    loadFriendsList(); // Tải danh sách bạn bè khi component mount
  }, []);

  // Tìm kiếm người dùng
  const handleSearch = async () => {
    if (searchTerm.length < 2) return;
    setLoading(true);
    try {
      const results = await FriendService.searchUsers(searchTerm);
      // Filter out current user from search results
      const filteredResults = results.filter(user => user.id !== currentUserId);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
    }
    setLoading(false);
  };

  // Lấy danh sách lời mời kết bạn
  const loadFriendRequests = async () => {
    try {
      const response = await FriendService.getFriendRequests();
      console.log('Response từ getFriendRequests:', response);
      console.log('Cấu trúc của friendRequests:', response.results);
      setFriendRequests(response.results);
    } catch (error) {
      console.error('Lỗi lấy lời mời kết bạn:', error);
    }
  };

  // Gửi lời mời kết bạn
  const handleSendRequest = async (userId) => {
    try {
      const response = await FriendService.sendFriendRequest(userId);
      console.log('Response từ sendFriendRequest:', response);
      alert('Đã gửi lời mời kết bạn!');
    } catch (error) {
      console.log('Lỗi chi tiết khi gửi lời mời:', error.response?.data);
      alert('Lỗi khi gửi lời mời kết bạn');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await FriendService.acceptFriendRequest(requestId);
      console.log('Response từ acceptFriendRequest:', response);
      await loadFriendRequests();
      alert('Đã chấp nhận lời mời kết bạn!');
    } catch (error) {
      console.log('Lỗi chi tiết khi chấp nhận lời mời:', error.response?.data);
      console.error(error);
      alert(error.response?.data?.message || 'Lỗi khi chấp nhận lời mời kết bạn');
    }
  };

  useEffect(() => {
    loadFriendRequests();
  }, []);

  // Debug logs trước khi render
  console.log('Debug state values:');
  console.log('- friendRequests:', friendRequests);
  console.log('- currentUserId:', currentUserId);
  console.log('- searchResults:', searchResults);
  console.log('- searchTerm:', searchTerm);
  console.log('- friendsList:', friendsList);

  return (
    <div className="bg-[#121212] min-h-screen p-6 text-white">
      <div className="max-w-4xl mx-auto">
        {/* Phần danh sách bạn bè */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Bạn bè</h2>
          <div className="space-y-2">
            {friendsList.length > 0 ? (
              friendsList.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between bg-[#282828] p-4 rounded-lg">
                  <div>
                    <p className="font-semibold">{friend.friend_info?.username || 'Không có tên'}</p>
                    <p className="text-sm text-gray-400">{friend.friend_info?.email || 'Không có email'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Bạn chưa có bạn bè nào</p>
            )}
          </div>
        </div>

        {/* Phần tìm kiếm */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Tìm bạn bè</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Nhập tên người dùng..."
              className="flex-1 bg-[#282828] text-white px-4 py-2 rounded-lg"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-[#1DB954] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#1ed760] transition-colors"
            >
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </div>

          {/* Kết quả tìm kiếm */}
          <div className="mt-4 space-y-2">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between bg-[#282828] p-4 rounded-lg"
              >
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
                <button
                  onClick={() => handleSendRequest(user.id)}
                  className="bg-[#1DB954] text-black px-4 py-1 rounded-full text-sm font-semibold hover:bg-[#1ed760] transition-colors"
                >
                  Kết bạn
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Phần lời mời kết bạn */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Lời mời kết bạn</h2>
          <div className="space-y-2">
            {friendRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between bg-[#282828] p-4 rounded-lg">
                <div>
                  <p className="font-semibold">{request.friend_info.username || 'Unknown User'}</p>
                  <p className="text-sm text-gray-400">{request.friend_info.email || 'No email'}</p>
                </div>
                <button
                  onClick={() => handleAcceptRequest(request.id)}
                  className="bg-[#1DB954] text-black px-4 py-1 rounded-full text-sm font-semibold"
                >
                  Chấp nhận
                </button>
              </div>
            ))}
            {friendRequests.length === 0 && (
              <p className="text-gray-400">Không có lời mời kết bạn nào</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;