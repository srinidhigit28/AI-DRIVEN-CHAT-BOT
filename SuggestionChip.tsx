import React from 'react';

interface SuggestionChipProps {
  text: string;
  onClick: () => void;
}

export const SuggestionChip: React.FC<SuggestionChipProps> = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-white/80 dark:bg-slate-700/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-slate-600 rounded-full text-sm hover:bg-emerald-100 hover:border-emerald-400 dark:hover:bg-slate-600 transition-all transform hover:scale-105"
    >
      {text}
    </button>
  );
};