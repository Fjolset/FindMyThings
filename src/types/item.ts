export interface HistoryEntry {
  id: string;
  location: string;
  changedAt: string; // ISO timestamp
  originalTranscript?: string;
}

export interface Item {
  id: string;
  name: string;
  location: string;
  originalTranscript?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  lastConfirmedAt?: string; // ISO timestamp
  category?: string;
  aliases?: string[];
  notes?: string;
  history: HistoryEntry[];
}

export type NewItemInput = Pick<Item, "name" | "location" | "originalTranscript" | "category" | "aliases">;

export interface ParsedItem {
  name: string;
  location: string;
  confidence: number; // 0..1, how sure the parser is
}

export interface ParseResult {
  items: ParsedItem[];
  location: string | null;
  needsConfirmation: boolean;
  rawTranscript: string;
}

export interface SearchMatch {
  item: Item;
  score: number; // 0..1, higher is better
}

export type AppSettings = {
  speechLang: string;
  ttsEnabled: boolean;
  autoReadAnswers: boolean;
  theme: "light" | "dark" | "system";
  demoDataEnabled: boolean;
};
