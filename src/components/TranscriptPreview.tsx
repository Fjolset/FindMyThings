export function TranscriptPreview({ text, live }: { text: string; live?: boolean }) {
  if (!text) return null;
  return (
    <div className="animate-rise mx-auto max-w-sm rounded-2xl bg-white/70 px-5 py-4 text-center shadow-tag dark:bg-white/[0.06]">
      {!live && <p className="mb-1 text-sm font-medium text-ink-soft dark:text-ink-soft-dark">Jeg tror, du sagde:</p>}
      <p className={`font-display text-xl text-ink dark:text-ink-dark ${live ? "opacity-70" : ""}`}>“{text}”</p>
    </div>
  );
}
