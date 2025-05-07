import AIChat from '../components/AIChat/AIChat';

const AIChatPage = () => {
  return (
    <div className="ai-chat-page">
      <h1>Trợ lý AI</h1>
      <div className="ai-chat-wrapper">
        <AIChat />
      </div>
    </div>
  );
};

export default AIChatPage;