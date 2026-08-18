/**
 * Maps a normalized word to a set of normalized words it should be considered
 * equivalent to. Kept intentionally small and editable — this is the kind of
 * thing that could later move to an LLM-backed matcher.
 */
export const SYNONYM_GROUPS: string[][] = [
  ["nøgl", "bilnøgl", "husnøgl", "reservenøgl", "ekstranøgl"],
  ["pas", "rejsepas"],
  ["briller", "solbriller", "læsebriller"],
  ["telefon", "mobil", "mobiltelefon"],
  ["hovedtelefon", "airpods", "øretelefon", "høretelefon"],
  ["pung", "tegnebog", "wallet"],
  ["taske", "rygsæk", "pose"],
  ["oplader", "charger", "ladekabel", "kabel"],
  ["kort", "rejsekort", "betalingskort", "dankort"],
  ["batteri", "batterier", "powerbank"],
  ["fjernbetjening", "remote"],
  ["paraply", "regnslag"],
];

const wordToGroup = new Map<string, Set<string>>();
for (const group of SYNONYM_GROUPS) {
  const set = new Set(group);
  for (const word of group) {
    wordToGroup.set(word, set);
  }
}

/** Returns the synonym set for a normalized word, including the word itself. */
export function expandSynonyms(word: string): Set<string> {
  for (const [key, group] of wordToGroup) {
    if (word.startsWith(key) || key.startsWith(word)) {
      return group;
    }
  }
  return new Set([word]);
}
