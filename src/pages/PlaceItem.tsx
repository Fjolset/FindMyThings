import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { MicButton } from "../components/MicButton";
import { TranscriptPreview } from "../components/TranscriptPreview";
import { UnsupportedSpeechNotice } from "../components/UnsupportedSpeechNotice";
import { ManualTextEntry } from "../components/ManualTextEntry";
import { ConfirmationCard } from "../components/ConfirmationCard";
import { SuccessCelebration } from "../components/SuccessCelebration";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useSettings } from "../hooks/useSettings";
import { parsingService } from "../services/parsing/parsingService";
import { itemStore } from "../services/storage/itemStore";
import type { ParsedItem } from "../types/item";
import { micErrorMessage } from "../utils/micErrors";

type Stage = "listen" | "clarify" | "confirm" | "success";

export function PlaceItem() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const recognition = useSpeechRecognition(settings.speechLang);
  const [stage, setStage] = useState<Stage>("listen");
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [savedItems, setSavedItems] = useState<{ name: string; location: string }[]>([]);
  const [rawTranscript, setRawTranscript] = useState("");

  const [showManualFallback, setShowManualFallback] = useState(false);

  useEffect(() => {
    if (recognition.state === "processing" && recognition.finalTranscript) {
      void handleTranscript(recognition.finalTranscript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recognition.state]);

  async function handleTranscript(text: string) {
    setRawTranscript(text);
    const result = await parsingService.parse(text);
    if (result.items.length === 0) {
      setStage("clarify");
    } else {
      setParsedItems(result.items);
      setStage("confirm");
    }
  }

  async function handleManualClarify(itemText: string, locationText: string) {
    setParsedItems([{ name: itemText, location: locationText, confidence: 1 }]);
    setStage("confirm");
  }

  async function handleConfirm(items: { name: string; location: string }[]) {
    for (const item of items) {
      await itemStore.upsertFromVoice({ name: item.name, location: item.location, originalTranscript: rawTranscript });
    }
    setSavedItems(items);
    setStage("success");
    setTimeout(() => navigate("/"), 1600);
  }

  function handleRetry() {
    recognition.reset();
    setRawTranscript("");
    setParsedItems([]);
    setStage("listen");
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col px-5 pb-10">
      <PageHeader title="Hvad har du lagt væk?" onBack={() => navigate("/")} />

      <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-8">
        {stage === "listen" && (
          <>
            {recognition.supported && !showManualFallback ? (
              <>
                <MicButton
                  state={recognition.state === "error" ? "idle" : recognition.state}
                  onClick={() => (recognition.state === "listening" ? recognition.stop() : recognition.start())}
                />
                <p className="max-w-xs text-center text-ink-soft dark:text-ink-soft-dark">
                  Tryk og fortæl mig, hvor du har lagt tingen. For eksempel: “Jeg har lagt min ekstranøgle i den øverste
                  skuffe i køkkenet.”
                </p>
                {recognition.transcript && <TranscriptPreview text={recognition.transcript} live={recognition.state === "listening"} />}
                {recognition.state === "error" && recognition.errorReason !== "unsupported" && (
                  <p className="text-coral">{micErrorMessage(recognition.errorReason)}</p>
                )}
                <button
                  onClick={() => setShowManualFallback(true)}
                  className="focus-ring text-sm text-ink-soft underline decoration-dotted dark:text-ink-soft-dark"
                >
                  Skriv i stedet
                </button>
              </>
            ) : recognition.supported ? (
              <>
                <ManualTextEntry
                  placeholder="F.eks. Jeg har lagt mine bilnøgler i skuffen i entréen"
                  onSubmit={(text) => handleTranscript(text)}
                />
                <button
                  onClick={() => setShowManualFallback(false)}
                  className="focus-ring text-sm text-ink-soft underline decoration-dotted dark:text-ink-soft-dark"
                >
                  Brug mikrofon i stedet
                </button>
              </>
            ) : (
              <>
                <UnsupportedSpeechNotice />
                <ManualTextEntry
                  placeholder="F.eks. Jeg har lagt mine bilnøgler i skuffen i entréen"
                  onSubmit={(text) => handleTranscript(text)}
                />
              </>
            )}
          </>
        )}

        {stage === "clarify" && (
          <div className="flex w-full max-w-sm flex-col gap-6">
            {rawTranscript && <TranscriptPreview text={rawTranscript} />}
            <p className="text-center text-ink-soft dark:text-ink-soft-dark">
              Jeg er ikke helt sikker på, hvad du mente. Kan du hjælpe mig?
            </p>
            <ClarifyForm onSubmit={handleManualClarify} />
          </div>
        )}

        {stage === "confirm" && (
          <ConfirmationCard items={parsedItems} onConfirm={handleConfirm} onRetry={handleRetry} />
        )}

        {stage === "success" && <SuccessCelebration items={savedItems} />}
      </div>
    </div>
  );
}

function ClarifyForm({ onSubmit }: { onSubmit: (item: string, location: string) => void }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim() && location.trim()) onSubmit(name.trim(), location.trim());
      }}
    >
      <label className="text-sm font-medium text-ink-soft dark:text-ink-soft-dark">
        Hvad har du lagt væk?
        <input
          className="focus-ring mt-1 w-full rounded-xl border border-line bg-white/80 px-4 py-3 text-lg text-ink dark:border-line-dark dark:bg-white/[0.06] dark:text-ink-dark"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="F.eks. Bilnøgler"
          autoFocus
        />
      </label>
      <label className="text-sm font-medium text-ink-soft dark:text-ink-soft-dark">
        Hvor har du lagt den?
        <input
          className="focus-ring mt-1 w-full rounded-xl border border-line bg-white/80 px-4 py-3 text-lg text-ink dark:border-line-dark dark:bg-white/[0.06] dark:text-ink-dark"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="F.eks. Skuffen i entréen"
        />
      </label>
      <button
        type="submit"
        disabled={!name.trim() || !location.trim()}
        className="focus-ring rounded-2xl bg-moss px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-moss-deep disabled:opacity-50"
      >
        Fortsæt
      </button>
    </form>
  );
}
