import React, { useState, useEffect, useCallback } from 'react';
import { SessionPhase, WordConfig } from '../types';
import { ArrowRight, X, Clock } from 'lucide-react';

interface SessionScreenProps {
  config: WordConfig;
  onComplete: () => void;
  onExit: () => void;
}

const SessionScreen: React.FC<SessionScreenProps> = ({ config, onComplete, onExit }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState<SessionPhase>(SessionPhase.COUNTDOWN);
  const [counter, setCounter] = useState(3);
  
  // Total progress percentage
  const progress = ((wordIndex) / config.words.length) * 100;
  
  // Handlers for switching phases
  const startCountdown = useCallback(() => {
    setPhase(SessionPhase.COUNTDOWN);
    setCounter(3);
  }, []);

  const showWord = useCallback(() => {
    setPhase(SessionPhase.DISPLAY);
    setCounter(config.displayDuration);
  }, [config.displayDuration]);

  const hideWord = useCallback(() => {
    setPhase(SessionPhase.WAITING);
  }, []);

  const nextWord = () => {
    if (wordIndex < config.words.length - 1) {
      setWordIndex(prev => prev + 1);
      startCountdown();
    } else {
      onComplete();
    }
  };

  // Timer logic
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (phase === SessionPhase.COUNTDOWN) {
      if (counter > 0) {
        timer = setTimeout(() => setCounter(c => c - 1), 1000);
      } else {
        // Countdown finished, show word
        showWord();
      }
    } else if (phase === SessionPhase.DISPLAY) {
      if (counter > 0) {
        timer = setTimeout(() => setCounter(c => c - 1), 1000);
      } else {
        // Display time finished, hide word
        hideWord();
      }
    }

    return () => clearTimeout(timer);
  }, [phase, counter, showWord, hideWord]);

  // Keyboard support for "Next"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowRight' || e.code === 'Enter') {
        if (phase === SessionPhase.WAITING) {
          nextWord();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, wordIndex, config.words.length]);

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col z-50">
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      {/* Top Bar */}
      <div className="flex justify-between items-center p-6 text-slate-400">
        <div className="text-lg font-medium">
            Woord {wordIndex + 1} van {config.words.length}
        </div>
        <button onClick={onExit} className="hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800">
          <X size={24} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full">
        
        {/* Countdown Phase */}
        {phase === SessionPhase.COUNTDOWN && (
          <div key="countdown" className="text-center animate-pulse">
            <span className="text-[15rem] font-bold text-yellow-400 font-display leading-none select-none">
              {counter > 0 ? counter : 'Start!'}
            </span>
            <p className="text-slate-400 text-xl mt-4 font-medium uppercase tracking-widest">Klaar...</p>
          </div>
        )}

        {/* Display Phase */}
        {phase === SessionPhase.DISPLAY && (
          <div key="word" className="text-center w-full px-4">
             {/* Progress bar and numeric timer for time remaining */}
             <div className="flex flex-col items-center gap-2 mb-12">
               <div className="text-4xl font-mono font-bold text-slate-500 tabular-nums">
                 {counter}
               </div>
               <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                      className="h-full bg-indigo-500"
                      style={{ 
                        width: '100%',
                        animation: `shrink ${config.displayDuration}s linear forwards`
                      }}
                  />
               </div>
             </div>
             
            <h1 className="text-[8vw] sm:text-[6rem] font-display font-bold text-white tracking-wide break-words">
              {config.words[wordIndex]}
            </h1>
          </div>
        )}

        {/* Waiting Phase */}
        {phase === SessionPhase.WAITING && (
          <div key="waiting" className="text-center animate-in fade-in zoom-in duration-300">
             <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6">
                <Clock size={48} className="text-slate-500" />
             </div>
            <p className="text-slate-400 text-2xl mb-8">Het woord is verdwenen.</p>
            
            <button
              onClick={nextWord}
              className="group relative px-10 py-5 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-2xl font-bold shadow-[0_10px_0_rgb(21,128,61)] active:shadow-none active:translate-y-[10px] transition-all flex items-center gap-4 mx-auto"
            >
              <span>Volgend Woord</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
            </button>
            <p className="mt-8 text-slate-600 text-sm">
                Druk op <span className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-400">Spatie</span> om verder te gaan
            </p>
          </div>
        )}
      </div>

      {/* Bottom Progress Bar (Overall) */}
      <div className="h-2 bg-slate-800 w-full">
        <div 
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default SessionScreen;