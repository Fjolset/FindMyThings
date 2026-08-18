/** Words that carry no identifying meaning for an item name or location. */
const STOPWORDS = new Set([
  "mine",
  "min",
  "mit",
  "den",
  "det",
  "de",
  "dem",
  "til",
  "hvor",
  "er",
  "har",
  "jeg",
  "lagt",
  "henne",
  "gemt",
  "lagde",
  "hvad",
  "min",
  "for",
  "og",
  "med",
  "på",
  "i",
  "a",
  "af",
]);

/** Very small stemmer for common Danish plural/definite endings on everyday nouns. */
function stemWord(word: string): string {
  let w = word;
  const suffixes = ["erne", "ene", "en", "et", "er", "e", "s"];
  for (const suf of suffixes) {
    if (w.length > suf.length + 2 && w.endsWith(suf)) {
      w = w.slice(0, -suf.length);
      break;
    }
  }
  return w;
}

export function normalizeForMatch(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents, keep æøå (not combining marks)
    .replace(/[^a-z0-9æøå\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !STOPWORDS.has(w))
    .map(stemWord)
    .join(" ")
    .trim();
}

export function tokenize(input: string): string[] {
  return normalizeForMatch(input).split(/\s+/).filter(Boolean);
}
