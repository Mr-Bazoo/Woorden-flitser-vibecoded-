import React, { useState, useEffect } from 'react';
import { WordConfig } from '../types';
import { dbService, Method, Chapter } from '../services/databaseService';
import { Play, List, Settings2, Eraser, BookOpen, GraduationCap } from 'lucide-react';

interface SetupScreenProps {
  onStart: (config: WordConfig) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [textInput, setTextInput] = useState('');
  const [displayTime, setDisplayTime] = useState(5);
  const [activeTab, setActiveTab] = useState<'manual' | 'method'>('manual');

  // Database State
  const [methods, setMethods] = useState<Method[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  
  const [selectedMethodId, setSelectedMethodId] = useState<number | ''>('');
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [selectedChapterId, setSelectedChapterId] = useState<number | ''>('');
  const [isLoadingDB, setIsLoadingDB] = useState(false);

  // Load methods on mount
  useEffect(() => {
    const loadMethods = async () => {
      try {
        const data = await dbService.getMethods();
        setMethods(data);
      } catch (err) {
        console.error("Failed to load methods", err);
      }
    };
    loadMethods();
  }, []);

  const handleMethodChange = async (methodId: number) => {
    setSelectedMethodId(methodId);
    setSelectedYear('');
    setSelectedChapterId('');
    setYears([]);
    setChapters([]);
    
    if (methodId) {
      setIsLoadingDB(true);
      const data = await dbService.getYearsForMethod(methodId);
      setYears(data);
      setIsLoadingDB(false);
    }
  };

  const handleYearChange = async (year: number) => {
    setSelectedYear(year);
    setSelectedChapterId('');
    setChapters([]);

    if (selectedMethodId && year) {
        setIsLoadingDB(true);
        const data = await dbService.getChapters(Number(selectedMethodId), year);
        setChapters(data);
        setIsLoadingDB(false);
    }
  }

  const handleChapterChange = async (chapterId: number) => {
    setSelectedChapterId(chapterId);
    if (chapterId) {
      setIsLoadingDB(true);
      const words = await dbService.getWordsByChapter(chapterId);
      setTextInput(words.join('\n'));
      setIsLoadingDB(false);
    }
  };

  const handleStart = () => {
    const words = textInput
      .split(/[\n,]+/)
      .map(w => w.trim())
      .filter(w => w.length > 0);

    if (words.length === 0) {
      alert("Voer ten minste één woord in om te starten.");
      return;
    }

    onStart({
      words,
      displayDuration: displayTime
    });
  };

  const clearWords = () => {
    if(confirm('Weet je zeker dat je de lijst wilt wissen?')) {
        setTextInput('');
        setSelectedMethodId('');
        setSelectedYear('');
        setSelectedChapterId('');
        setYears([]);
        setChapters([]);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-display font-bold text-indigo-600 mb-2">FlitsWoord</h1>
        <p className="text-slate-500">Bereid je flitsles voor de klas voor.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-4 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'manual' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <List size={18} />
            Handmatig
          </button>
          <button
            onClick={() => setActiveTab('method')}
            className={`flex-1 py-4 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'method' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen size={18} />
            Methodes (Database)
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Typ of plak je woordenlijst (één per regel of gescheiden door komma's)
              </label>
              <div className="relative">
                <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="vis&#10;aap&#10;noot&#10;..."
                    className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none font-display text-lg shadow-inner bg-slate-50 text-slate-900"
                />
                {textInput.length > 0 && (
                     <button 
                        onClick={clearWords}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Lijst wissen"
                     >
                        <Eraser size={20} />
                     </button>
                )}
              </div>
              <div className="text-right text-xs text-slate-400">
                {textInput.split(/[\n,]+/).filter(w => w.trim().length > 0).length} woorden
              </div>
            </div>
          )}

          {activeTab === 'method' && (
            <div className="space-y-6">
               <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <BookOpen size={20} />
                    Kies een methode
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Methode Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1">1. Methode</label>
                      <select 
                        className="w-full p-3 rounded-lg border border-blue-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-300 outline-none"
                        value={selectedMethodId}
                        onChange={(e) => handleMethodChange(Number(e.target.value))}
                      >
                        <option value="">Selecteer methode...</option>
                        {methods.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Leerjaar Dropdown */}
                    <div className="relative">
                       <label className="block text-sm font-medium text-blue-800 mb-1 flex items-center gap-1">
                         2. Leerjaar
                       </label>
                       <div className="relative">
                         <select 
                            className="w-full p-3 pl-10 rounded-lg border border-blue-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-300 outline-none disabled:opacity-50 disabled:bg-slate-100"
                            value={selectedYear}
                            onChange={(e) => handleYearChange(Number(e.target.value))}
                            disabled={!selectedMethodId || years.length === 0}
                          >
                            <option value="">
                              {years.length === 0 && selectedMethodId ? 'Geen leerjaren gevonden' : 'Selecteer leerjaar (groep)...'}
                            </option>
                            {years.map(y => (
                              <option key={y} value={y}>Groep {y}</option>
                            ))}
                          </select>
                          <GraduationCap size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                       </div>
                    </div>

                    {/* Hoofdstuk Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1">3. Hoofdstuk / Blok</label>
                      <select 
                        className="w-full p-3 rounded-lg border border-blue-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-300 outline-none disabled:opacity-50 disabled:bg-slate-100"
                        value={selectedChapterId}
                        onChange={(e) => handleChapterChange(Number(e.target.value))}
                        disabled={!selectedYear || chapters.length === 0}
                      >
                        <option value="">
                          {chapters.length === 0 && selectedYear ? 'Geen hoofdstukken gevonden' : 'Selecteer hoofdstuk...'}
                        </option>
                        {chapters.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
               </div>

               <div className="relative">
                 <label className="block text-sm font-medium text-slate-700 mb-2">
                   Geselecteerde Woorden (aanpasbaar)
                 </label>
                 <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    readOnly={isLoadingDB}
                    placeholder="Selecteer hierboven een methode..."
                    className={`w-full h-48 p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none font-display text-lg shadow-inner bg-slate-50 text-slate-900 ${isLoadingDB ? 'opacity-50' : ''}`}
                />
               </div>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                <Settings2 size={18} className="text-slate-500" />
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">Tijd per woord:</span>
                    <select 
                        value={displayTime} 
                        onChange={(e) => setDisplayTime(Number(e.target.value))}
                        className="bg-transparent font-bold text-indigo-600 outline-none cursor-pointer"
                    >
                        <option value={1}>1 sec</option>
                        <option value={2}>2 sec</option>
                        <option value={3}>3 sec</option>
                        <option value={5}>5 sec</option>
                        <option value={10}>10 sec</option>
                    </select>
                </div>
              </div>

              <button
                onClick={handleStart}
                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Play size={20} fill="currentColor" />
                Start Oefening
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;