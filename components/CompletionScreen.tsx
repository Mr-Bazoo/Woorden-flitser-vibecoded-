import React, { useState } from 'react';
import { RotateCcw, Edit, Trophy, Highlighter, CheckCircle2, ArrowLeft } from 'lucide-react';

interface CompletionScreenProps {
  onRestart: () => void;
  onEdit: () => void;
  wordCount: number;
  words: string[]; // Added words prop to access the list
}

type HighlightColor = 'yellow' | 'green' | 'pink' | 'blue';

const CompletionScreen: React.FC<CompletionScreenProps> = ({ onRestart, onEdit, wordCount, words }) => {
  const [view, setView] = useState<'summary' | 'review'>('summary');
  
  // State to track highlighting: Record<wordIndex, Record<charIndex, color>>
  const [highlights, setHighlights] = useState<Record<number, Record<number, HighlightColor>>>({});
  const [activeColor, setActiveColor] = useState<HighlightColor>('yellow');

  const toggleHighlight = (wordIdx: number, charIdx: number) => {
    setHighlights(prev => {
      const wordHighlights = prev[wordIdx] || {};
      const currentColor = wordHighlights[charIdx];
      
      if (currentColor === activeColor) {
        // Remove highlight
        const nextWord = { ...wordHighlights };
        delete nextWord[charIdx];
        return { ...prev, [wordIdx]: nextWord };
      } else {
        // Add/Change highlight
        return {
          ...prev,
          [wordIdx]: { ...wordHighlights, [charIdx]: activeColor }
        };
      }
    });
  };

  const getBgColor = (color: HighlightColor) => {
    switch (color) {
      case 'yellow': return 'bg-yellow-300';
      case 'green': return 'bg-green-300';
      case 'pink': return 'bg-pink-300';
      case 'blue': return 'bg-blue-300';
    }
  };

  if (view === 'review') {
    return (
      <div className="max-w-4xl mx-auto p-6 pt-10">
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-slate-50 z-20 py-4 border-b border-slate-200">
          <button 
            onClick={() => setView('summary')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium"
          >
            <ArrowLeft size={20} />
            Terug
          </button>
          
          <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
            {(['yellow', 'green', 'pink', 'blue'] as HighlightColor[]).map(c => (
              <button
                key={c}
                onClick={() => setActiveColor(c)}
                className={`w-8 h-8 rounded-full ${getBgColor(c)} ${activeColor === c ? 'ring-2 ring-slate-400 scale-110' : 'opacity-70 hover:opacity-100'} transition-all`}
              />
            ))}
          </div>

          <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
            <Highlighter size={20} />
            Nakijken
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {words.map((word, wordIdx) => (
            <div key={wordIdx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
              <div className="text-3xl font-display font-bold tracking-wide cursor-pointer select-none">
                {word.split('').map((char, charIdx) => {
                   const color = highlights[wordIdx]?.[charIdx];
                   return (
                    <span 
                      key={charIdx}
                      onClick={() => toggleHighlight(wordIdx, charIdx)}
                      className={`inline-block px-[1px] rounded transition-colors ${color ? getBgColor(color) : 'hover:bg-slate-100'}`}
                    >
                      {char}
                    </span>
                   );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 text-center pt-20">
      <div className="mb-8 relative inline-block">
        <div className="absolute inset-0 bg-yellow-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
        <Trophy size={80} className="text-yellow-500 relative z-10 mx-auto" />
      </div>
      
      <h2 className="text-3xl font-display font-bold text-slate-800 mb-4">Goed gedaan!</h2>
      <p className="text-slate-600 mb-10 text-lg">
        Jullie hebben alle <span className="font-bold text-indigo-600">{wordCount}</span> woorden geflitst.
      </p>

      <div className="flex flex-col gap-3">
        <button
            onClick={() => setView('review')}
            className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-200 mb-2"
        >
            <Highlighter size={20} />
            Woorden Nakijken
        </button>

        <button
          onClick={onRestart}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
        >
          <RotateCcw size={20} />
          Opnieuw Flitsen
        </button>
        <button
          onClick={onEdit}
          className="w-full py-4 bg-white text-slate-600 border-2 border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center gap-2"
        >
          <Edit size={20} />
          Nieuwe Lijst
        </button>
      </div>
    </div>
  );
};

export default CompletionScreen;