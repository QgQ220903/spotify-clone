import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const AIChat = ({ compactMode = false }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const [timeoutId, setTimeoutId] = useState(null);
  const abortControllerRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Hủy yêu cầu trước đó nếu có
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Tạo abort controller mới
    abortControllerRef.current = new AbortController();
    
    // Thiết lập timeout 30 giây
    const timeout = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setLoading(false);
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: 'Yêu cầu đã quá thời gian chờ. Vui lòng thử lại với câu hỏi ngắn gọn hơn.'
        }]);
      }
    }, 30000);
    
    setTimeoutId(timeout);

    try {
      const response = await axios.post('http://localhost:8000/api/ai/chat/', {
        message: input,
        conversation_id: conversationId
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        signal: abortControllerRef.current.signal
      });

      clearTimeout(timeout);
      console.log('API Response:', response.data); // Add this line to debug

      if (!conversationId) {
        setConversationId(response.data.conversation_id);
      }

      // Make sure this matches your API response structure
      const aiMessage = {
        role: 'assistant',
        content: response.data.message.content
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Lỗi khi gọi AI API:', error);
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: 'Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn.'
        }]);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={`${compactMode ? 'h-full flex flex-col' : 'ai-chat-container'}`}>
      <div className={`${compactMode ? 'flex-1 overflow-y-auto' : 'ai-chat-messages'}`}>
        {messages.length === 0 ? (
          <div className={`${compactMode ? 'p-2 text-sm' : 'ai-chat-welcome'}`}>
            <h3 className="font-semibold text-white mb-2">Chào mừng đến với Trợ lý AI</h3>
            <p className="text-gray-300 text-sm mb-1">Hãy hỏi tôi bất cứ điều gì về âm nhạc!</p>
            {!compactMode && (
              <>
                <p className="text-gray-300 text-sm mb-1">Tôi có thể giúp bạn tìm kiếm thông tin về:</p>
                <ul className="text-gray-400 text-xs list-disc pl-5">
                  <li>Bài hát và album của nghệ sĩ yêu thích</li>
                  <li>Thông tin chi tiết về nghệ sĩ</li>
                  <li>Gợi ý bài hát tương tự</li>
                  <li>Cách sử dụng ứng dụng</li>
                </ul>
              </>
            )}
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`${compactMode ? 
                `p-2 mb-2 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-[#1DB954] text-white ml-auto' : 'bg-[#282828] text-gray-200 mr-auto'}` 
                : `ai-chat-message ${msg.role}`}`}
            >
              <div className={compactMode ? 'text-sm' : 'ai-chat-message-content'}>
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
          <div className={compactMode ? "p-2 mb-2 rounded-lg bg-[#282828] text-gray-200 mr-auto max-w-[80%]" : "ai-chat-message assistant"}>
            <div className={compactMode ? "flex gap-1" : "ai-chat-message-content"}>
              <div className={compactMode ? "flex space-x-1 p-1" : "ai-chat-loading"}>
                <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form 
        onSubmit={handleSubmit} 
        className={compactMode ? "mt-2 flex gap-2" : "ai-chat-input-form"}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi trợ lý AI..."
          disabled={loading}
          className={compactMode ? 
            "flex-1 bg-[#282828] text-white text-sm rounded-full px-3 py-2 outline-none border border-transparent focus:border-[#1DB954]" 
            : ""}
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          className={compactMode ? 
            "bg-[#1DB954] text-white rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50" 
            : ""}
        >
          Gửi
        </button>
      </form>
    </div>
  );
};

export default AIChat;