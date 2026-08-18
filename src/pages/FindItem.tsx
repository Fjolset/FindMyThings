import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { MicButton } from "../components/MicButton";
import { TranscriptPreview } from "../components/TranscriptPreview";
import { UnsupportedSpeechNotice } from "../components/UnsupportedSpeechNotice";
import { ManualTextEntry } from "../components/ManualTextEntry";
import { AmbiguousChooser } from "../components/AmbiguousChooser";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/Button";
import { ConfirmationCard } from "../components/ConfirmationCard";
import { SuccessCelebration } from "../components/SuccessCelebration";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useSettings } from "../hooks/useSettings";
import { parsingService } from "../services/parsing/parsingService";
import { searchService, isAmbiguous } from "../services/search/searchService";
import { itemStore } from "../services/storage/itemStore";
import { ttsService } from "../services/tts/ttsService";
import { iconForItem } from "../utils/icons";
import { formatRelativeDa } from "../utils/formatDate";
import { micErrorMessage } from "../utils/micErrors";
import type { Item, SearchMatch, ParsedItem } from "../types/item";

type Stage = "listen" | "result" | "ambiguous" | "notfound" | "moving-listen" | "moving-confirm" | "moving-success";

export function FindItem() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const recognition = useSpeechRecognition(settings.speechLang);
  const moveRecognition = useSpeechRecognition(settings.speechLang);
  const [stage, setStage] = useState<Stage>("listen");
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [resultItem, setResultItem] = useState<Item | undefined>();
  const [searchedFor, setSearchedFor] = useState("");
  const [moveParsed, setMoveParsed] = useState<ParsedItem[]>([]);
  const [showManualFallback, setShowManualFallback] = useState(false);

  useEffect(() => {
    if (recognition.state === "processing" && recognition.finalTranscript) {
      void handleQuery(recognition.finalTranscript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recognition.state]);

  useEffect(() => {
    if (moveRecognition.state === "processing" && moveRecognition.finalTranscript && resultItem) {
      void handleMoveTranscript(moveRecognition.finalTranscript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveRecognition.state]);

  async function handleQuery(text: string) {
    const cleanedQuery = parsingService.parseFindQuery(text);
    setSearchedFor(cleanedQuery);
    const found = await searchService.findItems(cleanedQuery);
    if (found.length === 0) {
      setStage("notfound");
    } else if (isAmbiguous(found)) {
      setMatches(found.slice(0, 3));
      setStage("ambiguous");
    } else {
      setResultItem(found[0].item);
      setStage("result");
      if (settings.ttsEnabled && settings.autoReadAnswers) {
        ttsService.speak(`Dine ${found[0].item.name} ligger i ${found[0].item.location}.`, settings.speechLang);
      }
    }
  }

  function selectMatch(id: string) {
    const chosen = matches.find((m) => m.item.id === id)?.item;
    if (chosen) {
      setResultItem(chosen);
      setStage("result");
      if (settings.ttsEnabled && settings.autoReadAnswers) {
        ttsService.speak(`Dine ${chosen.name} ligger i ${chosen.location}.`, settings.speechLang);
      }
    }
  }

  function startOver() {
    recognition.reset();
    setSearchedFor("");
    setMatches([]);
    setResultItem(undefined);
    setStage("listen");
  }

  function startMoveFlow() {
    moveRecognition.reset();
    setStage("moving-listen");
  }

  async function handleMoveTranscript(text: string) {
    if (!resultItem) return;
    const result = await parsingService.parseMove(text);
    if (result.items.length > 0) {
      setMoveParsed([{ name: resultItem.name, location: result.items[0].location, confidence: result.items[0].confidence }]);
    } else {
      // Treat the whole utterance as the new location if nothing matched a pattern.
      setMoveParsed([{ name: resultItem.name, location: text, confidence: 0.4 }]);
    }
    setStage("moving-confirm");
  }

  async function confirmMove(items: { name: string; location: string }[]) {
    if (!resultItem) return;
    const updated = await itemStore.updateLocation(resultItem.id, items[0].location, moveRecognition.finalTranscript);
    setResultItem(updated);
    setStage("moving-success");
    setTimeout(() => setStage("result"), 1400);
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col px-5 pb-10">
      <PageHeader
        title={stage === "listen" ? "Hvad leder du efter?" : "Find en ting"}
        onBack={() => navigate("/")}
        right={
          stage === "listen" ? (
            <button
              onClick={() => navigate("/items")}
              className="focus-ring mt-1 whitespace-nowrap rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-moss shadow-tag dark:bg-white/10 dark:text-moss-light"
            >
              Se alle
            </button>
          ) : null
        }
      />

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
                  Spørg for eksempel: “Hvor er mine bilnøgler?”
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
                <ManualTextEntry placeholder="F.eks. Hvor er mine bilnøgler?" submitLabel="Søg" onSubmit={(text) => handleQuery(text)} />
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
                <ManualTextEntry placeholder="F.eks. Hvor er mine bilnøgler?" submitLabel="Søg" onSubmit={(text) => handleQuery(text)} />
              </>
            )}
          </>
        )}

        {stage === "ambiguous" && <AmbiguousChooser matches={matches} onSelect={selectMatch} />}

        {stage === "notfound" && (
          <EmptyState
            emoji="🤔"
            title={`Jeg kan ikke finde "${searchedFor}".`}
            description="Prøv at sige det på en anden måde, eller se alle dine ting."
            action={
              <div className="flex gap-3">
                <Button variant="primary" onClick={startOver}>
                  Prøv igen
                </Button>
                <Button variant="secondary" onClick={() => navigate("/items")}>
                  Se alle ting
                </Button>
              </div>
            }
          />
        )}

        {stage === "result" && resultItem && (
          <div className="animate-rise mx-auto flex w-full max-w-sm flex-col items-center gap-5 text-center">
            <span className="text-6xl" aria-hidden="true">
              {iconForItem(resultItem.name, resultItem.category)}
            </span>
            <h2 className="font-display text-3xl font-semibold text-ink dark:text-ink-dark">{resultItem.name}</h2>
            <p className="font-display text-2xl text-moss dark:text-moss-light">📍 {resultItem.location}</p>

            {resultItem.originalTranscript && (
              <div className="rounded-2xl bg-white/70 px-5 py-4 dark:bg-white/[0.06]">
                <p className="text-sm font-medium text-ink-soft dark:text-ink-soft-dark">Du lagde dem her:</p>
                <p className="mt-1 text-ink dark:text-ink-dark">“{resultItem.originalTranscript}”</p>
              </div>
            )}

            <p className="text-sm text-ink-soft dark:text-ink-soft-dark">Lagt væk: {formatRelativeDa(resultItem.updatedAt)}</p>

            <div className="mt-2 flex w-full flex-col gap-3">
              <Button
                variant="primary"
                size="lg"
                disabled={!settings.ttsEnabled || !ttsService.isSupported()}
                onClick={() => ttsService.speak(`Dine ${resultItem.name} ligger i ${resultItem.location}.`, settings.speechLang)}
              >
                🔊 Læs svaret højt
              </Button>
              <Button variant="secondary" size="lg" onClick={startMoveFlow}>
                Jeg har flyttet den
              </Button>
              <Button variant="ghost" onClick={startOver}>
                Ny søgning
              </Button>
            </div>
          </div>
        )}

        {stage === "moving-listen" && resultItem && (
          <>
            {moveRecognition.supported ? (
              <>
                <MicButton
                  state={moveRecognition.state === "error" ? "idle" : moveRecognition.state}
                  onClick={() => (moveRecognition.state === "listening" ? moveRecognition.stop() : moveRecognition.start())}
                />
                <p className="max-w-xs text-center text-ink-soft dark:text-ink-soft-dark">
                  Hvor har du flyttet {resultItem.name.toLowerCase()} hen?
                </p>
                {moveRecognition.transcript && (
                  <TranscriptPreview text={moveRecognition.transcript} live={moveRecognition.state === "listening"} />
                )}
                {moveRecognition.state === "error" && moveRecognition.errorReason !== "unsupported" && (
                  <p className="text-coral">{micErrorMessage(moveRecognition.errorReason)}</p>
                )}
              </>
            ) : (
              <ManualTextEntry
                placeholder="F.eks. Jeg har flyttet den til køkkenbordet"
                onSubmit={(text) => handleMoveTranscript(text)}
              />
            )}
          </>
        )}

        {stage === "moving-confirm" && (
          <ConfirmationCard
            items={moveParsed}
            onConfirm={confirmMove}
            onRetry={() => setStage("moving-listen")}
            confirmLabel="Opdater"
          />
        )}

        {stage === "moving-success" && resultItem && (
          <SuccessCelebration items={[{ name: resultItem.name, location: resultItem.location }]} />
        )}
      </div>
    </div>
  );
}
