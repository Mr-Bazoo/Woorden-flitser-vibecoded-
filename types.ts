export enum AppPhase {
  SETUP = 'SETUP',
  SESSION = 'SESSION',
  FINISHED = 'FINISHED'
}

export enum SessionPhase {
  COUNTDOWN = 'COUNTDOWN', // 3, 2, 1
  DISPLAY = 'DISPLAY',     // Show word
  WAITING = 'WAITING'      // Word hidden, waiting for teacher
}

export interface WordConfig {
  words: string[];
  displayDuration: number; // in seconds
}