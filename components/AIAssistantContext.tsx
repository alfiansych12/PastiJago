// contexts/AIAssistantContext.tsx
export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  console.log('AIAssistantProvider state:', { isOpen, messagesCount: messages.length }); // Debug log

  const toggleAIPanel = () => {
    console.log('toggleAIPanel called, current isOpen:', isOpen); // Debug log
    setIsOpen(prev => !prev);
  };

  // ... rest of the code
}