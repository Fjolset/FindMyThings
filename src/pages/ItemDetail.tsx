import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { HistoryTimeline } from "../components/HistoryTimeline";
import { MicButton } from "../components/MicButton";
import { TranscriptPreview } from "../components/TranscriptPreview";
import { ManualTextEntry } from "../components/ManualTextEntry";
import { ConfirmationCard } from "../components/ConfirmationCard";
import { Button } from "../components/ui/Button";
import { TagCard } from "../components/TagCard";
import { useItem } from "../hooks/useItems";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useSettings } from "../hooks/useSettings";
import { parsingService } from "../services/parsing/parsingService";
import { itemStore } from "../services/storage/itemStore";
import { ttsService } from "../services/tts/ttsService";
import { iconForItem } from "../utils/icons";
import { formatFullDa } from "../utils/formatDate";
import { micErrorMessage } from "../utils/micErrors";
import type { ParsedItem } from "../types/item";

export function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { item, loading, refresh } = useItem(id);
  const { settings } = useSettings();
  const recognition = useSpeechRecognition(settings.speechLang);
  const [updating, setUpdating] = useState(false);
  const [parsed, setParsed] = useState<ParsedItem[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (recognition.state === "processing" && recognition.finalTranscript && item) {
      void handleTranscript(recognition.finalTranscript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recognition.state]);

  async function handleTranscript(text: string) {
    if (!item) return;
    const result = await parsingService.parseMove(text);
    if (result.items.length > 0) {
      setParsed([{ name: item.name, location: result.items[0].location, confidence: result.items[0].confidence }]);
    } else {
      setParsed([{ name: item.name, location: text, confidence: 0.4 }]);
    }
    setConfirming(true);
  }

  async function handleConfirm(items: { name: string; location: string }[]) {
    if (!item) return;
    await itemStore.updateLocation(item.id, items[0].location, recognition.finalTranscript);
    setUpdating(false);
    setConfirming(false);
    recognition.reset();
    refresh();
  }

  async function handleDelete() {
    if (!item) return;
    await itemStore.remove(item.id);
    navigate("/items");
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-full max-w-lg flex-col px-5 pb-10">
        <PageHeader title="Indlæser..." onBack={() => navigate("/items")} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="mx-auto flex min-h-full max-w-lg flex-col px-5 pb-10">
        <PageHeader title="Ting ikke fundet" onBack={() => navigate("/items")} />
        <p className="mt-4 text-center text-ink-soft dark:text-ink-soft-dark">
          Denne ting findes ikke længere.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col px-5 pb-10">
      <PageHeader title={item.name} onBack={() => navigate("/items")} />

      {!updating ? (
        <div className="mt-4 flex flex-col gap-6">
          <div className="text-center">
            <span className="text-6xl" aria-hidden="true">
              {iconForItem(item.name, item.category)}
            </span>
          </div>

          <TagCard className="p-5 pl-12" accentColor="moss">
            <p className="text-sm font-medium text-ink-soft dark:text-ink-soft-dark">📍 Aktuel placering</p>
            <p className="mt-1 font-display text-2xl font-semibold text-ink dark:text-ink-dark">{item.location}</p>
          </TagCard>

          <TagCard className="p-5 pl-12">
            <p className="text-sm font-medium text-ink-soft dark:text-ink-soft-dark">🕒 Sidst opdateret</p>
            <p className="mt-1 text-ink dark:text-ink-dark">{formatFullDa(item.updatedAt)}</p>
          </TagCard>

          {item.originalTranscript && (
            <TagCard className="p-5 pl-12">
              <p className="text-sm font-medium text-ink-soft dark:text-ink-soft-dark">📝 Sidste registrering</p>
              <p className="mt-1 text-ink dark:text-ink-dark">“{item.originalTranscript}”</p>
            </TagCard>
          )}

          <div className="flex gap-3">
            <Button variant="primary" className="flex-1" onClick={() => setUpdating(true)}>
              🎙 Opdater placering
            </Button>
            <Button
              variant="secondary"
              disabled={!settings.ttsEnabled || !ttsService.isSupported()}
              onClick={() => ttsService.speak(`Dine ${item.name} ligger i ${item.location}.`, settings.speechLang)}
            >
              🔊
            </Button>
          </div>

          {item.history.length > 1 && (
            <div>
              <h2 className="mb-3 font-display text-xl font-semibold text-ink dark:text-ink-dark">Historik</h2>
              <HistoryTimeline history={item.history} />
            </div>
          )}

          <div className="mt-4">
            {confirmDelete ? (
              <div className="flex flex-col gap-3 rounded-2xl bg-coral-light p-4">
                <p className="text-center text-coral">Slet {item.name} permanent?</p>
                <div className="flex gap-3">
                  <Button variant="danger" className="flex-1" onClick={handleDelete}>
                    Ja, slet
                  </Button>
                  <Button variant="ghost" className="flex-1" onClick={() => setConfirmDelete(false)}>
                    Fortryd
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="focus-ring mx-auto block text-sm text-ink-soft underline decoration-dotted dark:text-ink-soft-dark"
              >
                Slet denne ting
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-8 flex flex-1 flex-col items-center justify-center gap-8">
          {!confirming ? (
            <>
              {recognition.supported ? (
                <>
                  <MicButton
                    state={recognition.state === "error" ? "idle" : recognition.state}
                    onClick={() => (recognition.state === "listening" ? recognition.stop() : recognition.start())}
                  />
                  <p className="max-w-xs text-center text-ink-soft dark:text-ink-soft-dark">
                    Hvor har du lagt {item.name.toLowerCase()} nu?
                  </p>
                  {recognition.transcript && (
                    <TranscriptPreview text={recognition.transcript} live={recognition.state === "listening"} />
                  )}
                  {recognition.state === "error" && recognition.errorReason !== "unsupported" && (
                    <p className="text-coral">{micErrorMessage(recognition.errorReason)}</p>
                  )}
                </>
              ) : (
                <ManualTextEntry placeholder="F.eks. Køkkenbordet" onSubmit={(text) => handleTranscript(text)} />
              )}
              <Button variant="ghost" onClick={() => setUpdating(false)}>
                Annuller
              </Button>
            </>
          ) : (
            <ConfirmationCard items={parsed} onConfirm={handleConfirm} onRetry={() => setConfirming(false)} confirmLabel="Opdater" />
          )}
        </div>
      )}
    </div>
  );
}
