import type { Item, SearchMatch } from "../../types/item";
import { itemStore } from "../storage/itemStore";
import { normalizeForMatch, tokenize } from "./normalize";
import { expandSynonyms } from "./synonyms";

export interface ItemSearchService {
  findItems(query: string): Promise<SearchMatch[]>;
}

const MATCH_THRESHOLD = 0.34;
/** Gap under which two top matches are considered ambiguous and worth asking about. */
const AMBIGUITY_GAP = 0.12;

function bigramSet(s: string): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = 0; i < s.length - 1; i++) {
    const bg = s.slice(i, i + 2);
    map.set(bg, (map.get(bg) ?? 0) + 1);
  }
  return map;
}

function diceSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const A = bigramSet(a);
  const B = bigramSet(b);
  let overlap = 0;
  for (const [bg, count] of A) overlap += Math.min(count, B.get(bg) ?? 0);
  const total = [...A.values()].reduce((s, v) => s + v, 0) + [...B.values()].reduce((s, v) => s + v, 0);
  return total === 0 ? 0 : (2 * overlap) / total;
}

/** Token-level score that accounts for synonyms and fuzzy (typo-tolerant) matches. */
function tokenOverlapScore(queryTokens: string[], targetTokens: string[]): number {
  if (queryTokens.length === 0 || targetTokens.length === 0) return 0;
  let matched = 0;
  for (const qt of queryTokens) {
    const qtSynonyms = expandSynonyms(qt);
    let best = 0;
    for (const tt of targetTokens) {
      if (qtSynonyms.has(tt) || expandSynonyms(tt).has(qt)) {
        best = 1;
        break;
      }
      best = Math.max(best, diceSimilarity(qt, tt));
    }
    matched += best;
  }
  return matched / queryTokens.length;
}

function scoreItem(query: string, item: Item): number {
  const queryTokens = tokenize(query);
  const candidateNames = [item.name, ...(item.aliases ?? [])];

  let best = 0;
  for (const candidate of candidateNames) {
    const candidateTokens = tokenize(candidate);
    const tokenScore = tokenOverlapScore(queryTokens, candidateTokens);
    const wholeStringScore = diceSimilarity(normalizeForMatch(query), normalizeForMatch(candidate));
    // Token overlap matters more for short household-object names.
    const combined = tokenScore * 0.7 + wholeStringScore * 0.3;
    best = Math.max(best, combined);
  }
  return best;
}

class FuzzyItemSearchService implements ItemSearchService {
  async findItems(query: string): Promise<SearchMatch[]> {
    const items = await itemStore.getAll();
    const scored: SearchMatch[] = items
      .map((item) => ({ item, score: scoreItem(query, item) }))
      .filter((m) => m.score >= MATCH_THRESHOLD)
      .sort((a, b) => b.score - a.score);
    return scored;
  }
}

export const searchService = new FuzzyItemSearchService();

export function isAmbiguous(matches: SearchMatch[]): boolean {
  if (matches.length < 2) return false;
  const [first, second] = matches;
  return first.score - second.score < AMBIGUITY_GAP;
}
