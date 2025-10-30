import React from 'react';
import { BotIcon, SpeakerOnIcon, SpeakerOffIcon, SunIcon, MoonIcon, TrashIcon } from './Icons';

interface HeaderProps {
    isAutoSpeakEnabled: boolean;
    setIsAutoSpeakEnabled: (enabled: boolean) => void;
    theme: string;
    toggleTheme: () => void;
    clearChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isAutoSpeakEnabled, setIsAutoSpeakEnabled, theme, toggleTheme, clearChat }) => {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-md sticky top-0 z-10 border-b border-gray-200 dark:border-slate-800">
      <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-full">
            <BotIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">MediPal</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoSpeakEnabled(!isAutoSpeakEnabled)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            aria-label={isAutoSpeakEnabled ? 'Disable auto-speaking' : 'Enable auto-speaking'}
          >
            {isAutoSpeakEnabled ? (
              <SpeakerOnIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <SpeakerOffIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            )}
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <MoonIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <SunIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            )}
          </button>
           <button
            onClick={clearChat}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
            aria-label="Clear chat history"
          >
            <TrashIcon className="w-6 h-6 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400" />
          </button>
        </div>
      </div>
    </header>
  );
};