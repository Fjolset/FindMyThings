export interface ParsePattern {
  /** Matches the whole utterance. Group "items" and group "location" are required. */
  regex: RegExp;
  confidence: number;
}

// Notes on style: patterns are intentionally permissive about connector words
// ("i", "på", "ved", "inde i", "nede i", "ned i") since speech recognition
// output varies a lot in how prepositions come out.
const LOCATION_CONNECTOR = "(?:inde i|nede i|ned i|hen i|op i|i|på|ved|under|bag)";

export const PLACE_PATTERNS: ParsePattern[] = [
  // "Jeg har lagt bilnøglerne i skuffen i entréen"
  {
    regex: new RegExp(`^jeg har lagt (?<items>.+?) ${LOCATION_CONNECTOR} (?<location>.+)$`, "i"),
    confidence: 0.95,
  },
  // "Jeg har placeret / puttede / lagde / stillede X i/på Y"
  {
    regex: new RegExp(
      `^jeg (?:har )?(?:placerede|puttede|lagde|stillede|satte|gemte) (?<items>.+?) ${LOCATION_CONNECTOR} (?<location>.+)$`,
      "i"
    ),
    confidence: 0.9,
  },
  // "Bilnøglerne ligger / er i skuffen i entréen"
  {
    regex: new RegExp(`^(?<items>.+?) (?:ligger|er|befinder sig) ${LOCATION_CONNECTOR} (?<location>.+)$`, "i"),
    confidence: 0.85,
  },
  // "Mine AirPods er i skuffen ved siden af sengen" (same as above but explicit "mine")
  {
    regex: new RegExp(`^mine (?<items>.+?) (?:er|ligger) ${LOCATION_CONNECTOR} (?<location>.+)$`, "i"),
    confidence: 0.85,
  },
  // Fallback: "X i/på Y" with no verb at all, e.g. dictated shorthand.
  {
    regex: new RegExp(`^(?<items>.+?) ${LOCATION_CONNECTOR} (?<location>.+)$`, "i"),
    confidence: 0.55,
  },
];

export interface MovePattern {
  regex: RegExp;
  confidence: number;
}

export const MOVE_PATTERNS: ParsePattern[] = [
  // "Jeg har flyttet bilnøglerne til køkkenbordet"
  {
    regex: /^jeg har flyttet (?<items>.+?) (?:til|hen til|over til) (?<location>.+)$/i,
    confidence: 0.95,
  },
  {
    regex: /^jeg flyttede (?<items>.+?) (?:til|hen til|over til) (?<location>.+)$/i,
    confidence: 0.9,
  },
];

export interface FindPattern {
  regex: RegExp;
}

export const FIND_PATTERNS: FindPattern[] = [
  { regex: /^hvor (?:er|har jeg lagt|ligger|befinder|har jeg gemt) (?<items>.+?)\??$/i },
  { regex: /^find (?<items>.+?)\??$/i },
  { regex: /^hvor finder jeg (?<items>.+?)\??$/i },
];

/** Splits an item-name phrase like "pas og rejsekort" into ["pas", "rejsekort"]. */
export function splitItemNames(itemsPhrase: string): string[] {
  return itemsPhrase
    .split(/,| og | samt /i)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(stripLeadingDeterminers);
}

function stripLeadingDeterminers(phrase: string): string {
  return phrase.replace(/^(mine|min|mit|den|det|de|en|et)\s+/i, "").trim();
}
