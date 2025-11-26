// components/AIAssistant.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import { usePathname } from 'next/navigation';

// Tidak perlu props karena sekarang global
export default function AIAssistant() {
  const { 
    messages, 
    isOpen, 
    isLoading, 
    toggleAIPanel, 
    sendMessage, 
    clearMessages 
  } = useAIAssistant();
  
  const pathname = usePathname();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dapatkan konteks berdasarkan halaman saat ini
  const getCurrentContext = () => {
    if (pathname?.startsWith('/belajar/')) {
      const levelMatch = pathname.match(/\/belajar\/(\d+)/);
      const currentLevel = levelMatch ? parseInt(levelMatch[1]) : 1;
      return { type: 'learning', level: currentLevel };
    } else if (pathname?.startsWith('/projects/')) {
      const projectMatch = pathname.match(/\/projects\/(\d+)/);
      const projectId = projectMatch ? parseInt(projectMatch[1]) : 1;
      return { type: 'project', level: projectId + 10 };
    } else if (pathname === '/belajar') {
      return { type: 'learning-dashboard', level: 1 };
    } else if (pathname === '/projects') {
      return { type: 'projects-dashboard', level: 11 };
    } else if (pathname === '/groups') {
      return { type: 'groups', level: 1 };
    } else if (pathname === '/leaderboard') {
      return { type: 'leaderboard', level: 1 };
    } else {
      return { type: 'general', level: 1 };
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const context = getCurrentContext();
    await sendMessage(inputMessage, '', context.level);
    setInputMessage('');
  };

  const predefinedQuestions = [
    "Bisa jelaskan konsep ini dengan sederhana?",
    "Ada error di kode saya, bisa bantu?",
    "Berikan contoh praktis untuk konsep ini",
    "Apa bedanya dengan konsep sebelumnya?",
    "Tips untuk mengingat konsep ini?"
  ];

  // Context-based predefined questions
  const getContextQuestions = () => {
    const context = getCurrentContext();
    
    switch (context.type) {
      case 'learning':
        return [
          "Bantu saya memahami konsep level ini",
          "Berikan contoh kode untuk tantangan ini",
          "Apa output yang diharapkan?",
          "Tips untuk menyelesaikan level ini"
        ];
      case 'project':
        return [
          "Bantu saya memulai project ini",
          "Struktur kode seperti apa yang direkomendasikan?",
          "Fitur apa saja yang harus saya implementasi?",
          "Cara testing project ini?"
        ];
      case 'groups':
        return [
          "Bagaimana cara membuat grup belajar?",
          "Cara bergabung dengan grup?",
          "Fitur apa saja di grup belajar?",
          "Bagaimana kompetisi di grup bekerja?"
        ];
      default:
        return predefinedQuestions;
    }
  };

  // Jangan render jika tidak terbuka
  if (!isOpen) return null;

  const contextQuestions = getContextQuestions();

  return (
    <div 
      className="ai-assistant-panel glass-effect rounded-4 border border-warning position-fixed"
      style={{
        bottom: '120px',
        right: '30px',
        width: '400px',
        height: '500px',
        zIndex: 9999
      }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary">
        <div className="d-flex align-items-center">
          <div className="ai-avatar bg-warning rounded-circle d-flex align-items-center justify-content-center me-3"
               style={{width: '40px', height: '40px'}}>
            <i className="fas fa-robot text-dark"></i>
          </div>
          <div>
            <h6 className="text-warning mb-0">AI Learning Assistant</h6>
            <small className="text-muted">
              {getCurrentContext().type === 'learning' ? `Level ${getCurrentContext().level}` : 'Siap membantu!'}
            </small>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-warning btn-sm"
            onClick={clearMessages}
            disabled={messages.length === 0}
          >
            <i className="fas fa-eraser"></i>
          </button>
          <button 
            className="btn btn-outline-light btn-sm"
            onClick={toggleAIPanel}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container p-3" style={{height: '350px', overflowY: 'auto'}}>
        {messages.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="fas fa-robot display-4 mb-3"></i>
            <h6>Halo! Saya AI Assistant</h6>
            <p className="small">
              {getCurrentContext().type === 'learning' 
                ? `Siap membantu Anda di Level ${getCurrentContext().level}!` 
                : 'Siap membantu belajar JavaScript!'}
            </p>
            
            {/* Context-based Predefined Questions */}
            <div className="mt-4">
                {/* If you want an input, render it here: */}
                {/* <input style={{ color: 'white', background: '#222' }} /> */}
                {contextQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="btn btn-outline-warning btn-sm small text-start"
                    onClick={() => {
                      const context = getCurrentContext();
                      sendMessage(question, '', context.level);
                    }}
                    style={{ fontSize: '0.8rem' }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div className="d-flex align-items-start">
                  <div className={`avatar rounded-circle d-flex align-items-center justify-content-center me-2 ${
                    message.role === 'user' ? 'bg-primary' : 'bg-warning'
                  }`} style={{width: '32px', height: '32px', flexShrink: 0}}>
                    <i className={`fas ${message.role === 'user' ? 'fa-user' : 'fa-robot'} text-dark`}></i>
                  </div>
                  <div className="message-content flex-grow-1">
                    <div className={`p-3 rounded-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-light' 
                        : 'bg-secondary text-light'
                    }`}>
                      {message.role === 'assistant' ? (
                        <div 
                          className="ai-response-content"
                          dangerouslySetInnerHTML={{ 
                            __html: message.content
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\`(.*?)\`/g, '<code class="bg-dark px-1 rounded">$1</code>')
                              .replace(/\n/g, '<br>')
                          }}
                        />
                      ) : (
                        message.content
                      )}
                    </div>
                    <small className="text-muted mt-1 d-block">
                      {message.timestamp.toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </small>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message ai-message">
                <div className="d-flex align-items-start">
                  <div className="avatar bg-warning rounded-circle d-flex align-items-center justify-content-center me-2"
                       style={{width: '32px', height: '32px', flexShrink: 0}}>
                    <i className="fas fa-robot text-dark"></i>
                  </div>
                  <div className="p-3 bg-secondary rounded-3 text-light">
                    <div className="d-flex align-items-center">
                      <div className="spinner-border spinner-border-sm text-warning me-2"></div>
                      <span>AI Assistant sedang berpikir...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 border-top border-secondary">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              style={{ color: 'white', background: '#222' }}
              type="text"
              className="form-control glass-effect border-0 text-light"
              placeholder="Tanyakan tentang JavaScript..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="btn btn-warning"
              disabled={!inputMessage.trim() || isLoading}
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </button>
          </div>
        </form>
        <small className="text-muted mt-2 d-block">
          Tekan Enter untuk mengirim. Tersedia di semua halaman!
        </small>
      </div>
    </div>
  );
}