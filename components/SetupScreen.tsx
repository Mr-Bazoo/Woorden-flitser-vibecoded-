import React, { useState, useEffect } from 'react';
import { WordConfig } from '../types';
import { dbService, Chapter } from '../services/databaseService';
import { Play, Settings2, BookOpen, GraduationCap, ClipboardList, CalendarDays, BookOpenCheck, Eye } from 'lucide-react';

interface SetupScreenProps {
  onStart: (config: WordConfig) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [textInput, setTextInput] = useState('');
  const [displayTime, setDisplayTime] = useState(3);
  const [isWordListVisible, setIsWordListVisible] = useState(false);
  
  // Selection State
  const [availableGroups, setAvailableGroups] = useState<number[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | ''>('');
  
  const [availableBlocks, setAvailableBlocks] = useState<Chapter[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<number | ''>('');
  
  const [selectedWeek, setSelectedWeek] = useState<number | ''>('');
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);

  const [selectedLesson, setSelectedLesson] = useState<number | ''>('');
  const [availableLessons, setAvailableLessons] = useState<number[]>([]);

  useEffect(() => {
    setAvailableGroups(dbService.getAvailableGroups());
  }, []);

  // Handlers
  const handleGroupChange = (group: number) => {
    setSelectedGroup(group);
    // Reset downstream
    setSelectedBlockId('');
    setSelectedWeek('');
    setSelectedLesson('');
    setTextInput('');
    setAvailableWeeks([]);
    setAvailableLessons([]);
    
    if (group) {
      setAvailableBlocks(dbService.getBlocksForGroup(group));
    } else {
      setAvailableBlocks([]);
    }
  };

  const handleBlockChange = (blockId: number) => {
    setSelectedBlockId(blockId);
    // Reset downstream
    setSelectedWeek('');
    setSelectedLesson('');
    setTextInput('');
    setAvailableLessons([]);

    if (selectedGroup && blockId) {
        const weeks = dbService.getWeeks(selectedGroup, blockId);
        setAvailableWeeks(weeks);
        
        // Auto-select week if only 1 is available (e.g. for revision blocks treated as week 1)
        if (weeks.length === 1) {
            handleWeekChange(weeks[0], selectedGroup, blockId);
        }
    } else {
        setAvailableWeeks([]);
    }
  };

  const handleWeekChange = (week: number, groupOverride?: number, blockOverride?: number) => {
    const group = groupOverride || selectedGroup;
    const block = blockOverride || selectedBlockId;

    setSelectedWeek(week);
    setSelectedLesson('');
    setTextInput('');
    
    if (group && block) {
        // Update available lessons based on week
        const lessons = dbService.getLessons(Number(group), Number(block), week);
        setAvailableLessons(lessons);
    }
  };

  const handleLessonChange = (lesson: number) => {
    setSelectedLesson(lesson);
    setIsWordListVisible(false);
    
    if (selectedGroup && selectedBlockId && selectedWeek) {
        const words = dbService.getWordsForLesson(
            Number(selectedGroup), 
            Number(selectedBlockId), 
            Number(selectedWeek), 
            lesson
        );
        setTextInput(words.join('\n'));
    }
  };

  const handleStart = () => {
    const words = textInput
      .split(/[\n,]+/)
      .map(w => w.trim())
      .filter(w => w.length > 0);

    if (words.length === 0) {
      alert("Geen woorden gevonden. Vul de woordenlijst in.");
      return;
    }

    onStart({
      words,
      displayDuration: displayTime
    });
  };

  // derived state for checks
  const isReadyToFlash = textInput.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto p-6 pt-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl mb-4">
            <BookOpen size={32} />
        </div>
        <h1 className="text-4xl font-display font-bold text-slate-800 mb-2">Staal Flitshulp</h1>
        <p className="text-slate-500">Oefen de spellingwoorden van Staal met je klas.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 space-y-8">
        
        {/* Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* 1. Groep */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <GraduationCap size={16} className="text-indigo-500" />
                Groep
            </label>
            <select 
                value={selectedGroup}
                onChange={(e) => handleGroupChange(Number(e.target.value))}
                className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-800 font-semibold focus:border-indigo-500 focus:bg-white outline-none transition-all cursor-pointer"
            >
                <option value="">Kies groep...</option>
                {availableGroups.map(g => (
                    <option key={g} value={g}>Groep {g}</option>
                ))}
            </select>
          </div>

          {/* 2. Blok */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <ClipboardList size={16} className="text-indigo-500" />
                Blok
            </label>
            <select 
                value={selectedBlockId}
                onChange={(e) => handleBlockChange(Number(e.target.value))}
                disabled={!selectedGroup}
                className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-800 font-semibold focus:border-indigo-500 focus:bg-white outline-none transition-all cursor-pointer disabled:opacity-50"
            >
                <option value="">Kies blok...</option>
                {availableBlocks.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                ))}
            </select>
          </div>

          {/* 3. Week */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <CalendarDays size={16} className="text-indigo-500" />
                Week
            </label>
            <select 
                value={selectedWeek}
                onChange={(e) => handleWeekChange(Number(e.target.value))}
                disabled={selectedBlockId === '' || availableWeeks.length === 0}
                className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-800 font-semibold focus:border-indigo-500 focus:bg-white outline-none transition-all cursor-pointer disabled:opacity-50"
            >
                <option value="">
                    {availableWeeks.length === 0 ? '-' : 'Kies week...'}
                </option>
                {availableWeeks.map(w => (
                    <option key={w} value={w}>Week {w}</option>
                ))}
            </select>
          </div>

          {/* 4. Les */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <BookOpenCheck size={16} className="text-indigo-500" />
                Les
            </label>
            <select 
                value={selectedLesson}
                onChange={(e) => handleLessonChange(Number(e.target.value))}
                disabled={!selectedWeek || availableLessons.length === 0}
                className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-800 font-semibold focus:border-indigo-500 focus:bg-white outline-none transition-all cursor-pointer disabled:opacity-50"
            >
                <option value="">
                    {availableLessons.length === 0 ? '-' : 'Kies les...'}
                </option>
                {availableLessons.map(l => (
                    <option key={l} value={l}>Les {l}</option>
                ))}
            </select>
          </div>
        </div>

        {/* Preview Area */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <label className="text-sm font-bold text-slate-600">
            Woordenlijst voor deze les
          </label>
          <div className="relative">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={!selectedLesson}
              placeholder={!selectedLesson ? "Selecteer eerst een les..." : "Woorden laden..."}
              className={`w-full h-40 p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-700 font-display text-lg focus:border-indigo-500 focus:bg-white outline-none transition-all resize-none shadow-inner disabled:bg-slate-100 disabled:text-slate-400 ${!isWordListVisible && selectedLesson ? 'blur-sm select-none' : ''}`}
            />
            
            {/* Overlay for hidden state */}
            {!isWordListVisible && selectedLesson && (
                <div 
                    onClick={() => setIsWordListVisible(true)}
                    className="absolute inset-0 flex items-center justify-center bg-slate-50/50 cursor-pointer rounded-2xl border-2 border-transparent hover:bg-slate-100/50 transition-colors z-10"
                >
                    <div className="flex items-center gap-2 text-slate-500 font-semibold bg-white px-4 py-2 rounded-full shadow-sm">
                        <Eye size={18} />
                        <span>Klik om woorden te tonen</span>
                    </div>
                </div>
            )}
          </div>
          <p className="text-xs text-slate-400 text-right">
             Je kunt de woorden hierboven aanpassen voor de specifieke les.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
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
            disabled={!isReadyToFlash}
            className="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white text-xl font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-slate-300 disabled:shadow-none disabled:scale-100 disabled:cursor-not-allowed"
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