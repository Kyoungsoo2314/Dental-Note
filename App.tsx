import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from './types';
import { summarizeDentalNote } from './services/geminiService';
import Header from './components/Header';
import ChatBubble from './components/ChatBubble';
import RecordButton from './components/RecordButton';
import Footer from './components/Footer';
import Icon from './components/Icon';
import ApiKeyModal from './components/ApiKeyModal';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);


  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRecordingRef = useRef(isRecording);
  isRecordingRef.current = isRecording;
  const currentTranscriptRef = useRef(currentTranscript);
  currentTranscriptRef.current = currentTranscript;

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  useEffect(() => {
    const handleInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);
  
  const handleInstallClick = () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      installPromptEvent.userChoice.then(choiceResult => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setInstallPromptEvent(null);
      });
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSummarizing, interimTranscript, isRecording]);

  const handleSummarize = useCallback(async (transcription: string) => {
    if (!transcription.trim()) return;
    if (!apiKey) {
        setError("API Key is not set. Cannot summarize.");
        setIsApiKeyModalOpen(true);
        return;
    }

    setIsSummarizing(true);
    setError(null);
    setApiKeyError(null);
    const tempId = Date.now();
    
    setMessages(prev => [...prev, { id: tempId, transcription, summary: '', timestamp: new Date() }]);

    try {
      const summary = await summarizeDentalNote(transcription, apiKey);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempId ? { ...msg, summary } : msg
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      if (errorMessage.includes('API key is not valid')) {
        localStorage.removeItem('gemini_api_key');
        setApiKey(null);
        setApiKeyError(errorMessage);
        setIsApiKeyModalOpen(true);
      } else {
        setError(`Failed to get summary: ${errorMessage}`);
      }
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    } finally {
      setIsSummarizing(false);
    }
  }, [apiKey]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Web Speech API is not supported in this browser.');
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ko-KR';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscriptChunk = '';
      let currentInterim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscriptChunk += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      if (finalTranscriptChunk) {
        setCurrentTranscript(prev => prev + finalTranscriptChunk + ' ');
      }
      setInterimTranscript(currentInterim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      if (isRecordingRef.current) {
        try {
          recognition.start();
        } catch (err) {
          console.error("Error restarting speech recognition:", err);
          setError("Recognition stopped and could not restart.");
          setIsRecording(false);
        }
      } else {
        setIsRecording(false);
        if (currentTranscriptRef.current.trim()) {
            handleSummarize(currentTranscriptRef.current.trim());
            setCurrentTranscript('');
            setInterimTranscript('');
        }
      }
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [handleSummarize]);
  

  const toggleRecording = () => {
    if (!apiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        try {
          setCurrentTranscript('');
          setInterimTranscript('');
          recognitionRef.current.start();
          setIsRecording(true);
          setError(null);
        } catch(e) {
          setError("Recording could not be started. It might have been stopped prematurely.")
          setIsRecording(false);
        }
      }
    }
  };

  const handleApiKeySave = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    setIsApiKeyModalOpen(false);
    setApiKeyError(null);
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-900 font-sans h-screen w-screen flex flex-col items-center">
      {isApiKeyModalOpen && <ApiKeyModal onSave={handleApiKeySave} initialError={apiKeyError} />}
      <Header onInstallClick={handleInstallClick} showInstallButton={!!installPromptEvent} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 w-full max-w-4xl">
        {messages.length === 0 && !isRecording && !isSummarizing && (
          <div className="mt-12 md:mt-20">
              <div className="md:grid md:grid-cols-2 md:gap-12 md:items-center">
                <div className="text-center md:text-left">
                  <Icon name="mic" className="w-16 h-16 mx-auto md:mx-0 mb-4 text-slate-400" />
                  <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">Dental Voice Note AI</h2>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">
                    Click the microphone button below to start recording your clinical notes. The AI will transcribe and summarize them for you.
                  </p>
                </div>
                <div className="hidden md:block bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">Example Usage</h3>
                    <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                        <li className="flex items-start">
                            <Icon name="ai" className="w-4 h-4 mr-2.5 mt-0.5 text-teal-500 flex-shrink-0" />
                            <span>"김민준 환자, #36 신경치료 시작했고 임시 충전재로 막아뒀습니다. 2주 뒤에 다시 오시기로 했어요."</span>
                        </li>
                        <li className="flex items-start">
                            <Icon name="ai" className="w-4 h-4 mr-2.5 mt-0.5 text-teal-500 flex-shrink-0" />
                            <span>"이수빈님 스케일링이랑 전문가 칫솔질 교육 진행했습니다. 따님이 다음 주에 대학에 입학한다고 하네요."</span>
                        </li>
                        <li className="flex items-start">
                           <Icon name="ai" className="w-4 h-4 mr-2.5 mt-0.5 text-teal-500 flex-shrink-0" />
                           <span>"박지훈 어린이, 상악 유치에 불소 도포 완료. 울지 않고 진료 잘 받았음."</span>
                        </li>
                    </ul>
                </div>
              </div>
          </div>
        )}
        
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {isRecording && (
          <div className="flex justify-end">
              <div className="bg-blue-500 text-white rounded-lg rounded-br-none p-3 max-w-lg md:max-w-2xl">
                <p className="font-mono text-sm">
                  {currentTranscript}
                  <span className="text-blue-300">{interimTranscript}</span>
                   <span className="inline-block w-2 h-4 bg-white ml-1 animate-pulse align-middle"></span>
                </p>
              </div>
            </div>
        )}
        
        {isSummarizing && messages[messages.length - 1]?.summary === '' && (
          <div className="flex items-start gap-3">
             <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
               <Icon name="ai" className="w-6 h-6 text-white"/>
             </div>
             <div className="bg-white dark:bg-slate-800 rounded-lg rounded-bl-none p-3 max-w-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></div>
                </div>
             </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </main>

      <footer className="p-4 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 w-full">
         <div className="w-full max-w-4xl mx-auto">
            {error && (
            <div className="text-center text-red-500 mb-2 text-sm">
                {error}
            </div>
            )}
            <div className="flex justify-center items-center">
            <RecordButton isRecording={isRecording} onClick={toggleRecording} disabled={!apiKey} />
            </div>
            <Footer />
        </div>
      </footer>
    </div>
  );
};

export default App;