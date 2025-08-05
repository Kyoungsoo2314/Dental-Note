
import React from 'react';
import Icon from './Icon';

interface HeaderProps {
  onInstallClick: () => void;
  showInstallButton: boolean;
}


const Header: React.FC<HeaderProps> = ({ onInstallClick, showInstallButton }) => {
  return (
    <header className="p-4 bg-white dark:bg-slate-800 shadow-md border-b border-slate-200 dark:border-slate-700 w-full">
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <Icon name="logo" className="w-8 h-8 text-teal-500" />
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Dental Voice Note AI
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Real-time Transcription & Summarization
              </p>
            </div>
        </div>

        {showInstallButton && (
            <button
                onClick={onInstallClick}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors"
                aria-label="Install App"
            >
                <Icon name="install" className="w-5 h-5" />
                <span>Install App</span>
            </button>
        )}
      </div>
    </header>
  );
};

export default Header;
