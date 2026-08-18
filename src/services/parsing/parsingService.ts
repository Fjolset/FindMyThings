import type { ParsedItem, ParseResult } from "../../types/item";
import { PLACE_PATTERNS, MOVE_PATTERNS, FIND_PATTERNS, splitItemNames } from "./patterns";

/** Abstraction so parsing can later be swapped for an LLM/API-backed implementation. */
export interface ItemParser {
  parse(text: string): Promise<ParseResult>;
  parseMove(text: string): Promise<ParseResult>;
  parseFindQuery(text: string): string;
}

const CONFIDENT_THRESHOLD = 0.75;

function cleanLocation(loc: string): string {
  return loc.trim().replace(/[.!]+$/, "");
}

function cleanTranscript(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

class LocalRuleBasedParser implements ItemParser {
  async parse(text: string): Promise<ParseResult> {
    const transcript = cleanTranscript(text);
    const lower = transcript.toLowerCase();

    for (const pattern of PLACE_PATTERNS) {
      const match = lower.match(pattern.regex);
      if (match?.groups) {
        const itemNames = splitItemNames(match.groups.items);
        const location = cleanLocation(match.groups.location);
        if (itemNames.length > 0 && location) {
          const items: ParsedItem[] = itemNames.map((name) => ({
            name: capitalize(name),
            location: capitalize(location),
            confidence: pattern.confidence,
          }));
          return {
            items,
            location: capitalize(location),
            needsConfirmation: pattern.confidence < CONFIDENT_THRESHOLD,
            rawTranscript: transcript,
          };
        }
      }
    }

    // Nothing matched at all — hand back to the UI for manual confirmation.
    return {
      items: [],
      location: null,
      needsConfirmation: true,
      rawTranscript: transcript,
    };
  }

  async parseMove(text: string): Promise<ParseResult> {
    const transcript = cleanTranscript(text);
    const lower = transcript.toLowerCase();

    for (const pattern of MOVE_PATTERNS) {
      const match = lower.match(pattern.regex);
      if (match?.groups) {
        const itemNames = splitItemNames(match.groups.items);
        const location = cleanLocation(match.groups.location);
        if (itemNames.length > 0 && location) {
          return {
            items: itemNames.map((name) => ({ name: capitalize(name), location: capitalize(location), confidence: pattern.confidence })),
            location: capitalize(location),
            needsConfirmation: pattern.confidence < CONFIDENT_THRESHOLD,
            rawTranscript: transcript,
          };
        }
      }
    }

    // Fall back to the general "place" patterns — a move is really just a new placement.
    return this.parse(text);
  }

  /** Strips question phrasing ("Hvor er...") down to the item the user is asking about. */
  parseFindQuery(text: string): string {
    const transcript = cleanTranscript(text);
    const lower = transcript.toLowerCase();
    for (const pattern of FIND_PATTERNS) {
      const match = lower.match(pattern.regex);
      if (match?.groups?.items) {
        return match.groups.items.trim();
      }
    }
    return transcript;
  }
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const parsingService: ItemParser = new LocalRuleBasedParser();
