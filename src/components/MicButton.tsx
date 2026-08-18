import type { ListenState } from "../hooks/useSpeechRecognition";

interface MicButtonProps {
  state: ListenState;
  onClick: () => void;
  disabled?: boolean;
}

const LABELS: Record<ListenState, string> = {
  idle: "Tryk for at tale",
  listening: "Lytter... tryk for at stoppe",
  processing: "Bearbejder...",
  error: "Prøv igen",
};

export function MicButton({ state, onClick, disabled }: MicButtonProps) {
  const listening = state === "listening";
  const processing = state === "processing";

  return (
    <div className="flex flex-col items-center gap-5">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || processing}
        aria-pressed={listening}
        aria-label={LABELS[state]}
        className={`focus-ring relative flex h-32 w-32 items-center justify-center rounded-full text-white shadow-tag-lg transition-transform duration-200 disabled:opacity-60 ${
          listening ? "bg-coral scale-105" : "bg-moss hover:bg-moss-deep active:scale-95"
        }`}
      >
        {listening && <span className="animate-listen absolute inset-0 rounded-full" aria-hidden="true" />}
        {processing ? (
          <svg className="h-10 w-10 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : (
          <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
            <path
              d="M5 11a7 7 0 0 0 14 0M12 18v4m-4 0h8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
      <p className="text-lg font-medium text-ink-soft dark:text-ink-soft-dark" aria-live="polite">
        {LABELS[state]}
      </p>
    </div>
  );
}
