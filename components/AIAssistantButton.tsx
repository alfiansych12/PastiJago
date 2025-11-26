// components/AIAssistantButton.tsx
'use client';
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import { useEffect } from 'react';

export default function AIAssistantButton() {
  const { toggleAIPanel, isOpen, messages } = useAIAssistant();

  useEffect(() => {
    console.log('AIAssistantButton mounted');
    return () => console.log('AIAssistantButton unmounted');
  }, []);

  useEffect(() => {
    console.log('AIAssistantButton - isOpen changed:', isOpen);
  }, [isOpen]);

  const handleClick = () => {
    console.log('AI Button clicked, current isOpen:', isOpen);
    toggleAIPanel();
  };

  return (
    <button
      className="ai-assistant-button btn btn-warning rounded-pill position-fixed shadow-lg d-flex align-items-center justify-content-center"
      onClick={handleClick}
      style={{
        bottom: '30px',
        right: '30px',
        zIndex: 10000,
        width: '70px',
        height: '70px',
        border: '3px solid rgba(255,255,255,0.3)',
        backgroundColor: '#f59e0b'
      }}
      title="AI Learning Assistant - Klik untuk bantuan"
    >
      <i className={`fas ${isOpen ? 'fa-times' : 'fa-robot'} fs-5`}></i>
      
      {/* Badge untuk jumlah pesan */}
      {messages.length > 0 && !isOpen && (
        <span 
          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          style={{
            fontSize: '0.7rem',
            minWidth: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {messages.length}
        </span>
      )}
    </button>
  );
}