import React, { useState } from 'react';
import Icon from './Icon';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
  initialError?: string | null;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, initialError }) => {
  const [key, setKey] = useState('');

  const handleSave = () => {
    if (key.trim()) {
      onSave(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col items-center text-center">
            <div className="bg-teal-100 dark:bg-teal-900/50 p-3 rounded-full mb-4">
                <Icon name="key" className="w-8 h-8 text-teal-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gemini API Key Required</h2>
            <p className="text-slate-600 dark:text-gray-300 mt-2 mb-4">
                To enable AI summarization, please enter your Google Gemini API key. Your key is saved in your browser and not sent anywhere else.
            </p>
        </div>
        {initialError && <p className="text-red-500 text-sm mb-4 text-center">{initialError}</p>}
        <div className="space-y-4">
            <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="Enter your API key here"
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            />
            <button
            onClick={handleSave}
            className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
            disabled={!key.trim()}
            >
            Save and Start
            </button>
        </div>
        <div className="text-center mt-4">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 dark:text-teal-400 hover:underline">
                Get a Gemini API Key
            </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
