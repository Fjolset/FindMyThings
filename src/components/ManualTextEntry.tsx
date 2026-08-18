import { useState } from "react";
import { Button } from "./ui/Button";

interface ManualTextEntryProps {
  placeholder: string;
  onSubmit: (text: string) => void;
  submitLabel?: string;
}

export function ManualTextEntry({ placeholder, onSubmit, submitLabel = "Fortsæt" }: ManualTextEntryProps) {
  const [value, setValue] = useState("");
  return (
    <form
      className="mx-auto flex w-full max-w-sm flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSubmit(value.trim());
      }}
    >
      <label htmlFor="manual-text" className="sr-only">
        Skriv i stedet
      </label>
      <textarea
        id="manual-text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="focus-ring w-full resize-none rounded-2xl border border-line bg-white/80 px-4 py-3 text-lg text-ink shadow-tag dark:border-line-dark dark:bg-white/[0.06] dark:text-ink-dark"
      />
      <Button type="submit" variant="primary" size="lg" disabled={!value.trim()}>
        {submitLabel}
      </Button>
    </form>
  );
}
