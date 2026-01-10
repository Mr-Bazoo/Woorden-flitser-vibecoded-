import React from 'react';
import { RotateCcw, Edit, Trophy } from 'lucide-react';

interface CompletionScreenProps {
  onRestart: () => void;
  onEdit: () => void;
  wordCount: number;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({ onRestart, onEdit, wordCount }) => {
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