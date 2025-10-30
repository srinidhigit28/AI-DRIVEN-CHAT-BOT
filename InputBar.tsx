import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SendIcon, MicIcon, StopIcon } from './Icons';

interface InputBarProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null); // Using 'any' for SpeechRecognition
  const textBeforeListening = useRef<string>('');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };
  
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(adjustTextareaHeight, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim() && !isLoading) {
      onSend(text);
      setText('');
    }
  };
  
  const setupSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            for (let i = 0; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setText(textBeforeListening.current + finalTranscript + interimTranscript);
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    setupSpeechRecognition();
  }, [setupSpeechRecognition]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
    } else {
        textBeforeListening.current = text ? text + ' ' : '';
        recognitionRef.current.start();
        setIsListening(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700"
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask about a symptom or disease..."
        className="flex-1 bg-transparent p-2 border-none focus:ring-0 resize-none max-h-40 overflow-y-auto scrollbar-thin placeholder-gray-500 dark:placeholder-gray-400"
        rows={1}
        disabled={isLoading}
      />
      <button
        type="button"
        onClick={toggleListening}
        className={`p-3 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-emerald-100 text-emerald-600 dark:bg-slate-700 dark:hover:bg-emerald-900 dark:text-emerald-400'}`}
        disabled={isLoading}
        aria-label={isListening ? 'Stop listening' : 'Start listening'}
      >
        {isListening ? <StopIcon className="w-6 h-6" /> : <MicIcon className="w-6 h-6" />}
      </button>
      <button
        type="submit"
        className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:bg-emerald-300 dark:disabled:bg-emerald-800 transition-all transform hover:scale-110 disabled:scale-100"
        disabled={isLoading || !text.trim()}
        aria-label="Send message"
      >
        <SendIcon className="w-6 h-6" />
      </button>
    </form>
  );
};