import React, { useState, useEffect } from 'react';
import { WordConfig } from '../types';
import { dbService, Chapter } from '../services/databaseService';
import { Play, Settings2, BookOpen, GraduationCap, ClipboardList } from 'lucide-react';

interface SetupScreenProps {
  onStart: (config: WordConfig) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [textInput, setTextInput] = useState('');
  const [displayTime, setDisplayTime] = useState(3);
  
  const [availableGroups, setAvailableGroups] = useState<number[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | ''>('');
  const [availableBlocks, setAvailableBlocks] = useState<Chapter[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<number | ''>('');

  useEffect(() => {
    setAvailableGroups(dbService.getAvailableGroups());
  }, []);

  const handleGroupChange = (group: number) => {
    setSelectedGroup(group);
    setSelectedBlockId('');
    setTextInput('');
    if (group) {
      setAvailableBlocks(dbService.getBlocksForGroup(group));
    } else {
      setAvailableBlocks([]);
    }
  };

  const handleBlockChange = (blockId: number) => {
    setSelectedBlockId(blockId);
    const block = availableBlocks.find(b => b.id === blockId);
    if (block) {
      setTextInput(block.words.join('\n'));
    }
  };

  const handleStart = () => {
    const words = textInput
      .split(/[\n,]+/)
      .map(w => w.trim())
      .filter(w => w.length > 0);

    if (words.length === 0) {
      alert("Geen woorden gevonden. Selecteer eerst een blok.");
      return;
    }

    onStart({
      words,
      displayDuration: displayTime
    });
  };

  return (
    <div className="max-w-xl mx-auto p-6 pt-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl mb-4">
            <BookOpen size={32} />
        </div>
        <h1 className="text-4xl font-display font-bold text-slate-800 mb-2">Staal Flitshulp</h1>
        <p className="text-slate-500">Oefen de spellingwoorden van Staal met je klas.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 space-y-8">
        
        {/* Selection Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <GraduationCap size={16} className="text-indigo-500" />
                1. Kies Groep
            </label>
            <select 
                value={selectedGroup}
                onChange={(e) => handleGroupChange(Number(e.target.value))}
                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-800 font-semibold focus:border-indigo-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
            >
                <option value="">Selecteer groep...</option>
                {availableGroups.map(g => (
                    <option key={g} value={g}>Groep {g}</option>
                ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <ClipboardList size={16} className="text-indigo-500" />
                2. Kies Blok
            </label>
            <select 
                value={selectedBlockId}
                onChange={(e) => handleBlockChange(Number(e.target.value))}
                disabled={!selectedGroup}
                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-800 font-semibold focus:border-indigo-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <option value="">Selecteer blok...</option>
                {availableBlocks.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                ))}
            </select>
          </div>
        </div>

        {/* Preview Area */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-600">
            Woordenlijst voor deze sessie
          </label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Kies een groep en blok om woorden te laden..."
            className="w-full h-40 p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-700 font-display text-lg focus:border-indigo-500 focus:bg-white outline-none transition-all resize-none shadow-inner"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <div className="flex-1 flex items-center gap-3 bg-slate-100 px-5 py-3 rounded-2xl w-full">
            <Settings2 size={20} className="text-slate-400" />
            <div className="flex-1 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600">Snelheid:</span>
                <select 
                    value={displayTime} 
                    onChange={(e) => setDisplayTime(Number(e.target.value))}
                    className="bg-transparent font-bold text-indigo-600 outline-none cursor-pointer"
                >
                    {[1, 1.5, 2, 3, 5, 8].map(t => (
                        <option key={t} value={t}>{t} sec</option>
                    ))}
                </select>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!textInput.trim()}
            className="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white text-xl font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-slate-300 disabled:shadow-none disabled:scale-100"
          >
            <Play size={24} fill="currentColor" />
            Flitsen!
          </button>
        </div>
      </div>
      
      <p className="text-center mt-8 text-slate-400 text-sm">
        Gemaakt voor en door leerkrachten.
      </p>
    </div>
  );
};

export default SetupScreen;