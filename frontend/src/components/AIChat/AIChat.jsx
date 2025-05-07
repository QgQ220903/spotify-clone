import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './AIChat.css';

const AIChat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  // Cuộn xuống cuối cuộc trò chuyện khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Thêm tin nhắn của người dùng vào state
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Gọi API backend
      const response = await axios.post('http://localhost:8000/api/ai/chat/', {
        message: input,
        conversation_id: conversationId
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Lưu ID cuộc trò chuyện nếu là cuộc trò chuyện mới
      if (!conversationId) {
        setConversationId(response.data.conversation_id);
      }

      // Thêm phản hồi của AI vào state
      const aiMessage = {
        role: 'assistant',
        content: response.data.message.content
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Lỗi khi gọi AI API:', error);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-messages">
        {messages.length === 0 ? (
          <div className="ai-chat-welcome">
            <h3>Chào mừng đến với Trợ lý AI</h3>
            <p>Hãy hỏi tôi bất cứ điều gì về âm nhạc, nghệ sĩ, album hoặc bài hát trong ứng dụng!</p>
            <p>Tôi có thể giúp bạn tìm kiếm thông tin về:</p>
            <ul>
              <li>Bài hát và album của nghệ sĩ yêu thích</li>
              <li>Thông tin chi tiết về nghệ sĩ</li>
              <li>Gợi ý bài hát tương tự</li>
              <li>Cách sử dụng ứng dụng</li>
            </ul>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`ai-chat-message ${msg.role}`}>
              <div className="ai-chat-message-content">
                {msg.role === 'assistant' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="ai-chat-message assistant">
            <div className="ai-chat-message-content">
              <div className="ai-chat-loading">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="ai-chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi trợ lý AI..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Gửi
        </button>
      </form>
    </div>
  );
};

export default AIChat;