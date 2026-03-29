import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Edit, Trophy, Highlighter, CheckCircle2, ArrowLeft, Eraser, PenTool, Keyboard, Trash2, ChevronLeft, ChevronRight, Info, X } from 'lucide-react';

interface CompletionScreenProps {
  onRestart: () => void;
  onEdit: () => void;
  wordCount: number;
  words: string[];
}

interface Category {
  id: string;
  label: string;
  color: string;
  textColor?: string;
  instruction: string;
}

const CATEGORIES: Category[] = [
  { id: 'hak', label: '1. Hakwoord', color: '#FFD700', instruction: 'Ik schrijf het woord zoals ik het hoor.' },
  { id: 'zing', label: '2. Zingwoord', color: '#FFA500', instruction: 'Net als bij ding dong.' },
  { id: 'lucht', label: '3. Luchtwoord', color: '#87CEEB', instruction: 'Korte klank + cht (behalve bij: hij legt, hij ligt, hij zegt).' },
  { id: 'plank', label: '4. Plankwoord', color: '#9370DB', textColor: '#fff', instruction: 'Daar mag géén g tussen.' },
  { id: 'eer_oor_eur', label: '5. Eer-oor-eur-woord', color: '#98FB98', instruction: 'Ik schrijf ee, oo of eu.' },
  { id: 'aai_ooi_oei', label: '6. Aai-ooi-oei-woord', color: '#FF6347', textColor: '#fff', instruction: 'Ik hoor de j, maar ik schrijf de i.' },
  { id: 'eeuw_ieuw', label: '7. Eeuw-ieuw-woord', color: '#FFB6C1', instruction: 'Ik denk aan de u.' },
  { id: 'langermaak', label: '8. Langermaakwoord', color: '#DDA0DD', instruction: 'Hoor ik een t of b aan het eind? Langer maken om te horen of ik een d, t of b schrijf.' },
  { id: 'voorvoegsel', label: '9. Voorvoegsel', color: '#F0E68C', instruction: 'Ik hoor de u, maar ik schrijf de e (be-, ge-, ver-).' },
  { id: 'klankgroepen', label: '10. Klankgroepenwoord', color: '#FFFF00', instruction: '• Korte klank: Ik schrijf de medeklinker dubbel.\n• Lange klank: Ik neem een stukje van de letter weg.\n• Twee-tekenklank/Medeklinker: Ik schrijf het woord zoals ik het hoor.' },
  { id: 'verklein', label: '11. Verkleinwoord', color: '#FF69B4', textColor: '#fff', instruction: 'Grondwoord + -je, -pje of -tje. Ik hoor de u, maar schrijf de e.' },
  { id: 'achtervoegsel', label: '12. Achtervoegsel', color: '#FA8072', instruction: 'Ik hoor -ug of -luk, maar ik schrijf -ig of -lijk.' },
  { id: 'kilo', label: '13. Kilowoord', color: '#20B2AA', textColor: '#fff', instruction: 'Ik hoor de ie, maar ik schrijf de i.' },
  { id: 'komma_s', label: '14. Komma ’s-woord', color: '#00CED1', instruction: 'Eerst de komma, dan de s (bijv. ’s avonds).' },
  { id: 'cent', label: '15. Centwoord', color: '#7FFFD4', instruction: 'Ik hoor de s, maar ik schrijf de c.' },
  { id: 'komma_s_meervoud', label: '16. Komma ’s-meervoud', color: '#4682B4', textColor: '#fff', instruction: 'Bij een lange klank aan het eind (behalve bij ee).' },
  { id: 'politie', label: '17. Politiewoord', color: '#1E90FF', textColor: '#fff', instruction: 'Ik hoor tsie, maar ik schrijf tie.' },
  { id: 'cola', label: '18. Colawoord', color: '#6495ED', textColor: '#fff', instruction: 'Ik hoor de k, maar ik schrijf de c.' },
  { id: 'tropisch', label: '19. Tropisch-woord', color: '#00BFFF', instruction: 'Ik hoor ies, maar ik schrijf isch.' },
];

const CompletionScreen: React.FC<CompletionScreenProps> = ({ onRestart, onEdit, wordCount, words }) => {
  const [view, setView] = useState<'summary' | 'review'>('summary');
  
  // State to track highlighting: Record<wordIndex, Record<charIndex, categoryId>>
  const [highlights, setHighlights] = useState<Record<number, Record<number, string>>>({});
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(CATEGORIES[0].id);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [infoModalCategory, setInfoModalCategory] = useState<Category | null>(null);

  // Sentence writing state
  const [inputType, setInputType] = useState<'draw' | 'type'>('draw');
  const [sentenceText, setSentenceText] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize canvas context
  useEffect(() => {
    if (view === 'review' && inputType === 'draw' && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = '#1e293b'; // slate-800
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
        
        // Handle resize to prevent stretching
        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                // Save current content
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                tempCtx?.drawImage(canvas, 0, 0);

                // Resize
                canvas.width = parent.clientWidth;
                canvas.height = 200; // Fixed height for the writing area

                // Restore content
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.strokeStyle = '#1e293b';
                    ctx.lineWidth = 2;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.drawImage(tempCanvas, 0, 0);
                }
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, [view, inputType]);

  const toggleHighlight = (wordIdx: number, charIdx: number) => {
    if (!activeCategoryId) {
        return;
    }

    setHighlights(prev => {
      const wordHighlights = prev[wordIdx] || {};
      const currentCategoryId = wordHighlights[charIdx];
      
      if (currentCategoryId === activeCategoryId) {
        // Remove highlight if clicking with same color
        const nextWord = { ...wordHighlights };
        delete nextWord[charIdx];
        return { ...prev, [wordIdx]: nextWord };
      } else {
        // Apply new highlight
        return {
          ...prev,
          [wordIdx]: { ...wordHighlights, [charIdx]: activeCategoryId }
        };
      }
    });
  };

  const clearHighlights = () => {
    if (confirm('Weet je zeker dat je alle markeringen wilt wissen?')) {
        setHighlights({});
    }
  };

  // Drawing handlers
  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in event) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = (event as React.MouseEvent).clientX;
        clientY = (event as React.MouseEvent).clientY;
    }

    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        ctx.lineTo(x, y);
        ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        ctx.closePath();
    }
  };

  const clearSentence = () => {
    if (inputType === 'type') {
        setSentenceText('');
    } else {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
  };

  if (view === 'review') {
    const currentWord = words[currentWordIndex];

    return (
      <div className="h-screen bg-slate-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setView('summary')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium transition-colors"
            >
                <ArrowLeft size={20} />
                Terug
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                <Highlighter size={20} className="text-indigo-600" />
                Nakijken
            </h2>
          </div>
          
          <button 
            onClick={clearHighlights}
            className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Eraser size={16} />
            Alles wissen
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Sidebar - Categories */}
            <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto p-4 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-20">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Categorieën</h3>
                <div className="space-y-2">
                    {CATEGORIES.map(cat => (
                        <div key={cat.id} className="flex items-center gap-1">
                            <button
                                onClick={() => setActiveCategoryId(cat.id)}
                                className={`flex-1 flex items-center gap-3 p-2 rounded-lg transition-all text-left group ${
                                    activeCategoryId === cat.id 
                                        ? 'bg-slate-100 ring-2 ring-indigo-500 ring-inset shadow-sm' 
                                        : 'hover:bg-slate-50'
                                }`}
                            >
                                <span 
                                    className="w-6 h-6 rounded-full shadow-sm border border-black/10 shrink-0"
                                    style={{ backgroundColor: cat.color }}
                                />
                                <span className={`text-sm font-medium ${activeCategoryId === cat.id ? 'text-slate-900' : 'text-slate-600'}`}>
                                    {cat.label}
                                </span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setInfoModalCategory(cat);
                                }}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shrink-0"
                                title="Informatie over deze categorie"
                            >
                                <Info size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content - Words */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                <div className="max-w-5xl mx-auto space-y-12">
                    {/* Single Word Display */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[300px] relative">
                        
                        {/* Navigation Controls */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                            <button 
                                onClick={() => setCurrentWordIndex(Math.max(0, currentWordIndex - 1))}
                                disabled={currentWordIndex === 0}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-center gap-2"
                            >
                                <ChevronLeft size={24} />
                                <span className="font-medium hidden sm:inline">Vorige</span>
                            </button>
                            <span className="text-slate-400 font-medium">Woord {currentWordIndex + 1} van {words.length}</span>
                            <button 
                                onClick={() => setCurrentWordIndex(Math.min(words.length - 1, currentWordIndex + 1))}
                                disabled={currentWordIndex === words.length - 1}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-center gap-2"
                            >
                                <span className="font-medium hidden sm:inline">Volgende</span>
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        <div className="text-6xl sm:text-7xl md:text-8xl font-display font-bold tracking-wide cursor-pointer select-none flex flex-wrap justify-center gap-y-2 mt-12">
                            {currentWord.split('').map((char, charIdx) => {
                                const catId = highlights[currentWordIndex]?.[charIdx];
                                const category = CATEGORIES.find(c => c.id === catId);
                                
                                return (
                                    <span 
                                        key={charIdx}
                                        onClick={() => toggleHighlight(currentWordIndex, charIdx)}
                                        className="inline-flex items-center justify-center min-w-[1ch] px-[2px] py-1 rounded mx-[2px] transition-all hover:scale-110 active:scale-95"
                                        style={{ 
                                            backgroundColor: category?.color || 'transparent',
                                            color: category?.textColor || '#1e293b',
                                            boxShadow: category ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                        }}
                                    >
                                        {char}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="text-center text-slate-400 text-sm">
                        Selecteer een categorie links en klik op de letters om ze te markeren.
                    </div>

                    {/* Sentence Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <Edit size={18} className="text-indigo-500" />
                                Schrijf de zin
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="flex bg-slate-200 p-1 rounded-lg">
                                    <button
                                        onClick={() => setInputType('draw')}
                                        className={`p-2 rounded-md transition-all ${inputType === 'draw' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                        title="Schrijven"
                                    >
                                        <PenTool size={18} />
                                    </button>
                                    <button
                                        onClick={() => setInputType('type')}
                                        className={`p-2 rounded-md transition-all ${inputType === 'type' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                        title="Typen"
                                    >
                                        <Keyboard size={18} />
                                    </button>
                                </div>
                                <button 
                                    onClick={clearSentence}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Zin wissen"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-1 bg-white min-h-[200px]">
                            {inputType === 'draw' ? (
                                <div className="relative w-full h-[200px] cursor-crosshair touch-none">
                                    {/* Ruling lines background */}
                                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-evenly px-4 opacity-20">
                                        <div className="border-b border-slate-900"></div>
                                        <div className="border-b border-slate-900 border-dashed"></div>
                                        <div className="border-b border-slate-900"></div>
                                    </div>
                                    <canvas
                                        ref={canvasRef}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                        className="absolute inset-0 w-full h-full"
                                    />
                                </div>
                            ) : (
                                <textarea
                                    value={sentenceText}
                                    onChange={(e) => setSentenceText(e.target.value)}
                                    placeholder="Typ hier de zin..."
                                    className="w-full h-[200px] p-6 text-2xl font-display leading-loose outline-none resize-none placeholder:text-slate-300"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Info Modal */}
        {infoModalCategory && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setInfoModalCategory(null)}>
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between" style={{ backgroundColor: `${infoModalCategory.color}20` }}>
                        <div className="flex items-center gap-3">
                            <span 
                                className="w-4 h-4 rounded-full shadow-sm border border-black/10"
                                style={{ backgroundColor: infoModalCategory.color }}
                            />
                            <h3 className="font-bold text-slate-800 text-lg">{infoModalCategory.label}</h3>
                        </div>
                        <button 
                            onClick={() => setInfoModalCategory(null)}
                            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-6">
                        <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                            {infoModalCategory.instruction}
                        </p>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={() => setInfoModalCategory(null)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Sluiten
                        </button>
                    </div>
                </div>
            </div>
        )}
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