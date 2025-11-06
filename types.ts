export type WindowId = 'terminal' | 'manual' | 'ascii' | 'log' | 'lore' | 'netfeed' | 'notes' | 'memeDecrypt' | 'playWithMe';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface WindowState {
  isOpen: boolean;
  position: Position;
  size: Size;
  zIndex: number;
}

export type LogEntryType = 'player' | 'ai' | 'system';

export interface LogEntry {
  id: number;
  text: string;
  type: LogEntryType;
}

export type PuzzleState = number | 'MEME_PROCESSING' | 'SELECT_MEME' | 'NOBLE_PROCESSING' | 'MEME_YN';

export interface NobleChoice {
    text: string;
    flavor: string[];
}

export interface CursedMenuItem {
    file: string;
    commentary: string;
}

export interface BugInfo {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface PopupInfo {
  id: number;
  position: Position;
  buttonPosition: Position;
  lastMoved: number;
  isClosing?: boolean;
}

// Specific state slice for puzzle validation logic
export interface PuzzleValidationState {
  commandHistory: string[];
  selectedMeme: string | null;
}


// Fix: Add types for the non-standard Battery Status API to satisfy TypeScript.
declare global {
  interface Navigator {
    getBattery(): Promise<BatteryManager>;
  }

  interface BatteryManager {
    level: number;
  }
}