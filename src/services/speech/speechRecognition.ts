export type SpeechListener = {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
  onStart?: () => void;
};

// Minimal typing for the (still non-standard) Web Speech API.
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}
interface SpeechRecognitionResultListLike {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: { transcript: string; confidence: number };
}
interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export class SpeechRecognitionService {
  private recognition: SpeechRecognitionLike | null = null;
  private active = false;

  isSupported(): boolean {
    return isSpeechRecognitionSupported();
  }

  isActive(): boolean {
    return this.active;
  }

  start(lang: string, listener: SpeechListener): void {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      listener.onError("unsupported");
      return;
    }
    if (this.active) {
      this.stop();
    }

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      this.active = true;
      listener.onStart?.();
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      if (finalTranscript) {
        listener.onResult(finalTranscript.trim(), true);
      } else if (interimTranscript) {
        listener.onResult(interimTranscript.trim(), false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      this.active = false;
      listener.onError(event.error || "unknown");
    };

    recognition.onend = () => {
      this.active = false;
      listener.onEnd();
    };

    this.recognition = recognition;
    try {
      recognition.start();
    } catch (err) {
      this.active = false;
      listener.onError(err instanceof Error ? err.message : "start-failed");
    }
  }

  stop(): void {
    this.recognition?.stop();
  }

  abort(): void {
    this.recognition?.abort();
    this.active = false;
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
