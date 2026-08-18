export interface TextToSpeechService {
  isSupported(): boolean;
  speak(text: string, lang: string): void;
  cancel(): void;
  isSpeaking(): boolean;
}

class BrowserTextToSpeechService implements TextToSpeechService {
  isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  speak(text: string, lang: string): void {
    if (!this.isSupported()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.98;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  cancel(): void {
    if (this.isSupported()) window.speechSynthesis.cancel();
  }

  isSpeaking(): boolean {
    return this.isSupported() && window.speechSynthesis.speaking;
  }
}

export const ttsService: TextToSpeechService = new BrowserTextToSpeechService();
