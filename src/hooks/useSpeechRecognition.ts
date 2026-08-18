import { useCallback, useEffect, useRef, useState } from "react";
import { speechRecognitionService, isSpeechRecognitionSupported } from "../services/speech/speechRecognition";

export type ListenState = "idle" | "listening" | "processing" | "error";

export function useSpeechRecognition(lang: string) {
  const [state, setState] = useState<ListenState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [errorReason, setErrorReason] = useState<string | null>(null);
  const finalRef = useRef("");

  const supported = isSpeechRecognitionSupported();

  const reset = useCallback(() => {
    finalRef.current = "";
    setTranscript("");
    setInterim("");
    setErrorReason(null);
    setState("idle");
  }, []);

  const start = useCallback(() => {
    if (!supported) {
      setState("error");
      setErrorReason("unsupported");
      return;
    }
    finalRef.current = "";
    setTranscript("");
    setInterim("");
    setErrorReason(null);
    speechRecognitionService.start(lang, {
      onStart: () => setState("listening"),
      onResult: (text, isFinal) => {
        if (isFinal) {
          finalRef.current = (finalRef.current + " " + text).trim();
          setTranscript(finalRef.current);
          setInterim("");
        } else {
          setInterim(text);
        }
      },
      onError: (err) => {
        setState("error");
        setErrorReason(err);
      },
      onEnd: () => {
        setState((prev) => {
          if (prev === "error") return prev;
          return finalRef.current.trim() ? "processing" : "idle";
        });
      },
    });
  }, [lang, supported]);

  const stop = useCallback(() => {
    speechRecognitionService.stop();
  }, []);

  useEffect(() => () => speechRecognitionService.abort(), []);

  return {
    supported,
    state,
    transcript: transcript || interim,
    finalTranscript: transcript,
    interim,
    errorReason,
    start,
    stop,
    reset,
  };
}
