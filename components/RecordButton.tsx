import React from 'react';
import Icon from './Icon';

interface RecordButtonProps {
  isRecording: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const RecordButton: React.FC<RecordButtonProps> = ({ isRecording, onClick, disabled = false }) => {
  const buttonClasses = `
    w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-4
    ${
      isRecording
        ? 'bg-red-500 text-white shadow-lg scale-110 ring-red-500/50'
        : 'bg-teal-500 text-white shadow-lg hover:bg-teal-600 ring-teal-500/50'
    }
    ${disabled ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed hover:bg-slate-400 scale-100 ring-slate-400/50' : ''}
  `;

  return (
    <button onClick={onClick} className={buttonClasses} aria-label={isRecording ? 'Stop recording' : 'Start recording'} disabled={disabled}>
      {isRecording ? (
        <div className="w-8 h-8 bg-white rounded-md animate-pulse"></div>
      ) : (
        <Icon name="mic" className="w-10 h-10" />
      )}
    </button>
  );
};

export default RecordButton;
