// contexts/AIAssistantContext.tsx - Update sendMessage function
'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantContextType {
  messages: AIMessage[];
  isOpen: boolean;
  isLoading: boolean;
  toggleAIPanel: () => void;
  sendMessage: (message: string, code?: string, currentLevel?: number) => Promise<void>;
  clearMessages: () => void;
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleAIPanel = React.useCallback(() => {
    console.log('toggleAIPanel called, current isOpen:', isOpen);
    setIsOpen(prev => !prev);
  }, [isOpen]);

  const clearMessages = React.useCallback(() => {
    setMessages([]);
  }, []);

  const sendMessage = async (userMessage: string, code?: string, currentLevel?: number) => {
    if (!userMessage.trim()) return;

    // Add user message
    const userMsg: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      console.log('Sending message to API...', { userMessage, currentLevel });
      
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          code: code || '',
          currentLevel: currentLevel || 1,
          conversationHistory: messages.slice(-6) // Last 6 messages for context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response received:', data);

      const assistantMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('AI Assistant error:', error);
      
      const errorMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Maaf, terjadi gangguan koneksi dengan AI Assistant. 😔

Error: ${error instanceof Error ? error.message : 'Unknown error'}

Silakan:
• Cek koneksi internet Anda
• Coba lagi dalam beberapa saat
• Hubungi support jika masalah berlanjut

Terima kasih! 🙏`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const value = React.useMemo(() => ({
    messages,
    isOpen,
    isLoading,
    toggleAIPanel,
    sendMessage,
    clearMessages
  }), [messages, isOpen, isLoading, toggleAIPanel, clearMessages]);

  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
}