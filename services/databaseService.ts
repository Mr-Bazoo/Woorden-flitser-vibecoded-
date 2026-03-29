// databaseService.ts - Dedicated for Staal method
import staal_gr4 from '../data/staal_groep4';
import staal_gr5 from '../data/staal_groep5';

export interface Chapter {
  id: number;
  name: string;
  words: string[];
}

// Types for the nested data structure (Group 5)
interface RawLessonData {
  les: number;
  woorden?: string[]; // Group 5 uses 'woorden' in JSON
  words?: string[];   // Fallback / Group 4
}
interface WeekData {
  week: number;
  lessen: RawLessonData[];
}
interface BlockData {
  blok: number;
  weken?: WeekData[];
  lessen?: RawLessonData[]; // For blocks without weeks (e.g. 9 & 10)
  name?: string; // Group 4
  words?: string[]; // Group 4
}

// Registry now holds either the simple format (Gr4) or nested format (Gr5)
const DATA_REGISTRY: Record<number, any> = {
  4: staal_gr4,
  5: staal_gr5
};

export const dbService = {
  getAvailableGroups: (): number[] => {
    return Object.keys(DATA_REGISTRY).map(Number).sort();
  },

  getBlocksForGroup: (group: number): Chapter[] => {
    const rawData = DATA_REGISTRY[group];
    if (!rawData) return [];

    if (group === 5) {
      // Handle nested format
      return (rawData as BlockData[]).map((b) => ({
        id: b.blok,
        name: `Blok ${b.blok}`,
        words: [] // Words are fetched per lesson now
      }));
    } else {
      // Handle simple format (Group 4)
      return (rawData as {name: string, words: string[]}[]).map((b, index) => ({
        id: index + 1, // Use 1-based index for consistency if possible, or just index
        name: b.name,
        words: b.words
      }));
    }
  },

  getWeeks: (group: number, blockId: number): number[] => {
    if (group === 5) {
      const blocks = DATA_REGISTRY[5] as BlockData[];
      const block = blocks.find(b => b.blok === blockId);
      if (block) {
        if (block.weken) {
          return block.weken.map(w => w.week);
        }
        // If block has lessons but no weeks (e.g. Block 9/10), we simulate "Week 1"
        if (block.lessen) {
          return [1];
        }
      }
    }
    // Default fallback
    return [1, 2, 3, 4];
  },

  getLessons: (group: number, blockId: number, week: number): number[] => {
    if (group === 5) {
      const blocks = DATA_REGISTRY[5] as BlockData[];
      const block = blocks.find(b => b.blok === blockId);
      
      if (block) {
        // Case 1: Standard structure with Weeks
        if (block.weken) {
          const weekData = block.weken.find(w => w.week === week);
          if (weekData) {
            let lessons = weekData.lessen.map(l => l.les);
            // Filter out 3.4 test lesson rule
            if (week === 3) {
                lessons = lessons.filter(l => l !== 4);
            }
            return lessons;
          }
        }
        // Case 2: Direct lessons (Block 9/10)
        // We treat them as being in "Week 1"
        if (block.lessen && week === 1) {
             return block.lessen.map(l => l.les);
        }
      }
      return [];
    }

    // Default fallback for simple structure
    const lessons = [1, 2, 3, 4, 5];
    if (week === 3) {
        return lessons.filter(l => l !== 4);
    }
    return lessons;
  },

  getWordsForLesson: (group: number, blockId: number, week: number, lesson: number): string[] => {
    if (group === 5) {
      const blocks = DATA_REGISTRY[5] as BlockData[];
      const block = blocks.find(b => b.blok === blockId);
      if (block) {
        let lessonData: RawLessonData | undefined;

        // Case 1: Standard
        if (block.weken) {
          const weekData = block.weken.find(w => w.week === week);
          lessonData = weekData?.lessen.find(l => l.les === lesson);
        }
        // Case 2: Direct lessons (Block 9/10)
        else if (block.lessen) {
           lessonData = block.lessen.find(l => l.les === lesson);
        }

        // Handle both 'woorden' and 'words' properties safely
        if (lessonData) {
            return lessonData.woorden || lessonData.words || [];
        }
      }
      return [];
    }
    
    // Fallback for Group 4 (Simulated, as we don't have granular data)
    // We just return the whole block's words if we can find it
    const rawData = DATA_REGISTRY[group];
    // Note: getBlocksForGroup returned ID as index+1 for Gr4
    const blockIndex = blockId - 1; 
    if (rawData && rawData[blockIndex]) {
        return rawData[blockIndex].words || [];
    }

    return [];
  }
};