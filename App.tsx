import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from './hooks/useChat';
import { Header } from './components/Header';
import { ChatBubble } from './components/ChatBubble';
import { InputBar } from './components/InputBar';
import { SuggestionChip } from './components/SuggestionChip';
import { Message, Role } from './types';
import { BotIcon } from './components/Icons';

const App: React.FC = () => {
  const { messages, sendMessage, isLoading, error, clearChat } = useChat();
  const [isAutoSpeakEnabled, setIsAutoSpeakEnabled] = useState<boolean>(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const stripEmojis = (text: string) => {
    return text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
  };

  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(stripEmojis(text));
      utterance.lang = 'en-US';
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  useEffect(() => {
    if (isAutoSpeakEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === Role.BOT && !isLoading) {
        speakText(lastMessage.text);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoading, isAutoSpeakEnabled, speakText]);

  const handleSend = (text: string) => {
    if (text.trim()) {
      sendMessage(text);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const suggestionStarters = [
    "What are common diseases?",
    "I have a headache",
    "Tell me about the common cold",
    "First-aid for a cough"
  ];

  return (
    <div className="flex flex-col h-screen bg-transparent text-gray-800 dark:text-gray-200 font-sans">
      <Header 
        isAutoSpeakEnabled={isAutoSpeakEnabled} 
        setIsAutoSpeakEnabled={setIsAutoSpeakEnabled} 
        theme={theme}
        toggleTheme={toggleTheme}
        clearChat={clearChat}
      />
      <main className="flex-1 overflow-y-auto p-4 pb-28 scrollbar-thin">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-start gap-4 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
             <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center animate-float">
               <BotIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
             </div>
             <div>
                <p className="font-bold text-emerald-800 dark:text-emerald-300">MediPal</p>
                <p className="text-gray-600 dark:text-gray-300">
                  Hello! I'm MediPal, your friendly health assistant. How can I help you today? You can ask me about diseases, symptoms, or home remedies.
                </p>
             </div>
          </div>

          {messages.map((msg: Message) => (
            <ChatBubble key={msg.id} message={msg} onSpeak={speakText} />
          ))}

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
             <ChatBubble message={{ id: 'loading', role: Role.BOT, text: '' }} isLoading={true} onSpeak={() => {}} />
          )}

          {error && <div className="text-red-500 text-center p-2 bg-red-100 dark:bg-red-900/50 rounded-md">{error}</div>}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-100/50 dark:from-slate-900/50 to-transparent">
        <div className="max-w-4xl mx-auto p-4">
           {messages.length === 0 && !isLoading && (
              <div className="flex flex-wrap gap-2 mb-2 justify-center">
                  {suggestionStarters.map(s => <SuggestionChip key={s} text={s} onClick={() => handleSuggestionClick(s)} />)}
              </div>
            )}
           <InputBar onSend={handleSend} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  );
};

export default App;