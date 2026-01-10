// databaseService.ts
// Uses static TS files for data to avoid JSON import issues.

// Import data files directly
import lijn3_gr3 from '../data/lijn3_groep3';
import vll_kim_gr3 from '../data/vll_kim_groep3';
import staal_gr4 from '../data/staal_groep4';
import taalactief_gr5 from '../data/taalactief_groep5';

// Types
export interface Method {
  id: number;
  name: string;
}

export interface Chapter {
  id: number;
  method_id: number;
  year: number;
  name: string;
}

// Internal Interface for Data structure
interface JsonBlock {
  name: string;
  words: string[];
}

// ---------------------------------------------------------
// Configuration Registry
// ---------------------------------------------------------

// 1. Define Methods
const METHODS: Method[] = [
  { id: 1, name: 'Lijn 3' },
  { id: 2, name: 'Veilig Leren Lezen (Kim)' },
  { id: 3, name: 'Staal (Spelling)' },
  { id: 4, name: 'Taal Actief' }
];

// 2. Define Mapping: Key = "MethodID-Year" -> Value = Data Block
const DATA_REGISTRY: Record<string, JsonBlock[]> = {
  "1-3": lijn3_gr3,        // Lijn 3, Groep 3
  "2-3": vll_kim_gr3,      // VLL Kim, Groep 3
  "3-4": staal_gr4,        // Staal, Groep 4
  "4-5": taalactief_gr5    // Taal Actief, Groep 5
};

// ---------------------------------------------------------
// Helper: Cache for Chapter lookups
// ---------------------------------------------------------
// We need to generate unique numerical IDs for chapters to keep the UI happy.
// We'll store the mapping of ID -> { words: string[] } here when chapters are requested.
const chapterCache: Record<number, string[]> = {};

export const dbService = {
  getMethods: async (): Promise<Method[]> => {
    // Simulate async for consistency
    return METHODS;
  },

  getYearsForMethod: async (methodId: number): Promise<number[]> => {
    // Look through the registry keys to find years available for this method ID
    const years = Object.keys(DATA_REGISTRY)
      .filter(key => key.startsWith(`${methodId}-`))
      .map(key => parseInt(key.split('-')[1], 10))
      .sort((a, b) => a - b);
    
    return years;
  },

  getChapters: async (methodId: number, year: number): Promise<Chapter[]> => {
    const key = `${methodId}-${year}`;
    const data = DATA_REGISTRY[key];

    if (!data) return [];

    return data.map((block, index) => {
      // Generate a unique ID: Method(2 digits) + Year(1 digit) + Index(2 digits)
      // Example: Method 1, Year 3, Index 0 -> 1300
      const chapterId = (methodId * 1000) + (year * 100) + index;
      
      // Store words in cache for quick retrieval
      chapterCache[chapterId] = block.words;

      return {
        id: chapterId,
        method_id: methodId,
        year: year,
        name: block.name
      };
    });
  },

  getWordsByChapter: async (chapterId: number): Promise<string[]> => {
    // Retrieve from cache
    return chapterCache[chapterId] || [];
  }
};