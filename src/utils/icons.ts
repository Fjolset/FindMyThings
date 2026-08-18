const CATEGORY_EMOJI: Record<string, string> = {
  Nøgler: "🔑",
  Elektronik: "🎧",
  Dokumenter: "📕",
  Tilbehør: "🕶️",
  Værktøj: "🧰",
  Tegnebog: "👛",
  Tasker: "🎒",
};

const KEYWORD_EMOJI: [RegExp, string][] = [
  [/nøgl/i, "🔑"],
  [/pas\b/i, "📕"],
  [/rejsekort|kort\b/i, "💳"],
  [/airpods|hovedtelefon|høretelefon|øretelefon/i, "🎧"],
  [/brille/i, "🕶️"],
  [/telefon|mobil/i, "📱"],
  [/pung|tegnebog|wallet/i, "👛"],
  [/taske|rygsæk/i, "🎒"],
  [/oplader|kabel|charger/i, "🔌"],
  [/batteri|powerbank/i, "🔋"],
  [/målebånd|værktøj/i, "🧰"],
  [/paraply/i, "☂️"],
  [/fjernbetjening/i, "📺"],
  [/ur\b/i, "⌚"],
  [/smykke|ring|halskæde/i, "💍"],
];

export function iconForItem(name: string, category?: string): string {
  if (category && CATEGORY_EMOJI[category]) return CATEGORY_EMOJI[category];
  for (const [pattern, emoji] of KEYWORD_EMOJI) {
    if (pattern.test(name)) return emoji;
  }
  return "📦";
}
