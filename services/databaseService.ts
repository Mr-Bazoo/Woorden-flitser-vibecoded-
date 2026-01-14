// databaseService.ts - Dedicated for Staal method
import staal_gr4 from '../data/staal_groep4';
import staal_gr5 from '../data/staal_groep5';

export interface Chapter {
  id: number;
  name: string;
  words: string[];
}

const DATA_REGISTRY: Record<number, { name: string, words: string[] }[]> = {
  4: staal_gr4,
  5: staal_gr5
};

export const dbService = {
  getAvailableGroups: (): number[] => {
    return Object.keys(DATA_REGISTRY).map(Number).sort();
  },

  getBlocksForGroup: (group: number): Chapter[] => {
    const blocks = DATA_REGISTRY[group] || [];
    return blocks.map((b, index) => ({
      id: index,
      name: b.name,
      words: b.words
    }));
  }
};