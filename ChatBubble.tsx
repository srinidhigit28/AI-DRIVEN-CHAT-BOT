import React, { useState } from 'react';
import { Message, Role } from '../types';
import { BotIcon, UserIcon, SpeakerOnIcon, CopyIcon, CheckIcon } from './Icons';

interface ChatBubbleProps {
  message: Message;
  isLoading?: boolean;
  onSpeak: (text: string) => void;
}

const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1 p-2">
    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
  </div>
);

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isLoading = false, onSpeak }) => {
  const isBot = message.role === Role.BOT;
  const [isCopied, setIsCopied] = useState(false);

  const bubbleClasses = isBot
    ? 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-700 shadow-sm'
    : 'bg-emerald-600 text-white';
  const alignmentClasses = isBot ? 'justify-start' : 'justify-end';
  const textContainerClasses = isBot ? 'items-start' : 'items-end';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className={`flex gap-3 w-full animate-fade-in ${alignmentClasses}`}>
      {isBot && (
        <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
          <BotIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
      )}

      <div className={`flex flex-col w-full max-w-xl ${textContainerClasses}`}>
        <div className={`px-4 py-3 rounded-2xl ${bubbleClasses} ${isBot ? 'rounded-tl-none' : 'rounded-tr-none'}`}>
          {isLoading ? (
            <TypingIndicator />
          ) : (
            <p className="whitespace-pre-wrap">{message.text}</p>
          )}
        </div>
        {isBot && !isLoading && message.text && (
          <div className="mt-2 flex items-center gap-4">
             <button 
                onClick={() => onSpeak(message.text)} 
                className="text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 text-sm"
                aria-label="Read message aloud"
              >
                <SpeakerOnIcon className="w-4 h-4" />
                Listen
              </button>
              <button 
                onClick={handleCopy}
                className="text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 text-sm"
                aria-label="Copy message text"
              >
                {isCopied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
           </div>
        )}
      </div>

      {!isBot && (
        <div className="flex-shrink-0 w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
          <UserIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </div>
      )}
    </div>
  );
};