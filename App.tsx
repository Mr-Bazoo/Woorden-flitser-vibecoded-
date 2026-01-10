import React, { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import SessionScreen from './components/SessionScreen';
import CompletionScreen from './components/CompletionScreen';
import { AppPhase, WordConfig } from './types';

const App: React.FC = () => {
  const [phase, setPhase] = useState<AppPhase>(AppPhase.SETUP);
  const [config, setConfig] = useState<WordConfig>({ words: [], displayDuration: 5 });

  const startSession = (newConfig: WordConfig) => {
    setConfig(newConfig);
    setPhase(AppPhase.SESSION);
  };

  const handleComplete = () => {
    setPhase(AppPhase.FINISHED);
  };

  const handleRestart = () => {
    setPhase(AppPhase.SESSION);
  };

  const handleEdit = () => {
    setPhase(AppPhase.SETUP);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {phase === AppPhase.SETUP && (
        <SetupScreen onStart={startSession} />
      )}
      
      {phase === AppPhase.SESSION && (
        <SessionScreen 
          config={config} 
          onComplete={handleComplete}
          onExit={handleEdit}
        />
      )}

      {phase === AppPhase.FINISHED && (
        <CompletionScreen 
          onRestart={handleRestart} 
          onEdit={handleEdit}
          wordCount={config.words.length}
          words={config.words}
        />
      )}
    </div>
  );
};

export default App;