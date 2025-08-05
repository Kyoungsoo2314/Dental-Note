
import React, { useState } from 'react';
import { Message } from '../types';
import Icon from './Icon';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (message.summary) {
      navigator.clipboard.writeText(message.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* User Transcription Bubble */}
      <div className="flex justify-end">
        <div className="bg-blue-500 text-white rounded-lg rounded-br-none p-3 max-w-lg md:max-w-2xl shadow-sm">
          <p className="text-sm font-semibold mb-1">Your Note (Transcription)</p>
          <p className="font-mono">{message.transcription}</p>
          <p className="text-xs text-blue-200 text-right mt-2">
            {message.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* AI Summary Bubble */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0 shadow-md">
            <Icon name="ai" className="w-6 h-6 text-white"/>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg rounded-bl-none p-3 max-w-lg md:max-w-2xl shadow-sm relative group">
          <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 mb-1">AI Generated Summary</p>
          {message.summary ? (
            <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{message.summary}</p>
          ) : (
             <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
             </div>
          )}
          {message.summary && (
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                aria-label="Copy summary"
              >
                {copied ? <Icon name="check" className="w-4 h-4 text-green-500" /> : <Icon name="copy" className="w-4 h-4" />}
              </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
