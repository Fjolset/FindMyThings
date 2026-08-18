# Find My Stuff

En simpel, voice-first PWA til mennesker, der ofte glemmer, hvor de har lagt deres ting.

Sig "Jeg har lagt mine bilnøgler i skuffen i entréen", og spørg senere "Hvor er mine bilnøgler?" — appen husker det for dig.

## Kom i gang

```bash
npm install
npm run dev
```

Åbn linket der vises i terminalen (typisk `http://localhost:5173`). Tal-funktionerne (mikrofon, taleoplæsning) virker bedst i Chrome/Edge på desktop og Android; Safari/iOS har mere begrænset understøttelse af Web Speech API's continuous recognition, men appen falder automatisk tilbage til tekstinput, hvis stemmegenkendelse ikke er tilgængelig.

```bash
npm run build    # produktions-build til dist/
npm run preview  # forhåndsvisning af produktions-build
```

## Teknologi

- **React 19 + TypeScript + Vite** — moderne, hurtig udviklingsoplevelse
- **Tailwind CSS v4** — styling via `@theme` design tokens i `src/index.css`
- **IndexedDB** (via `idb`) — lokal, persistent lagring; fungerer helt uden backend
- **Web Speech API** — tale-til-tekst, med graceful fallback til tekstinput hvor browseren ikke understøtter det
- **SpeechSynthesis API** — tekst-til-tale, bag en abstraktion så den senere kan udskiftes
- **react-router-dom** (HashRouter, så navigation virker uden server-config) 
- **vite-plugin-pwa** — installerbar app, offline shell, manifest

Alt dette er valgt fordi det kører 100% i browseren uden noget serverbackend, mens strukturen (se `services/`) er lavet så et rigtigt backend/cloud-sync og en LLM-baseret parser nemt kan kobles på senere uden at omskrive resten af appen.

## Projektstruktur

```text
src/
  components/     Genbrugelige UI-komponenter (MicButton, TagCard, ConfirmationCard, ...)
  pages/          Home, PlaceItem, FindItem, AllItems, ItemDetail, Settings
  services/
    speech/       Web Speech API wrapper
    storage/      IndexedDB (items + settings)
    parsing/      Dansk regel-baseret sætningsparser (ItemParser interface)
    search/       Fuzzy søgning m. synonymer, normalisering og tvetydighed
    tts/          SpeechSynthesis wrapper
  hooks/          useItems, useSettings, useSpeechRecognition
  types/          Data-model (Item, ParsedItem, SearchMatch, ...)
  data/           Demo-data til førstegangsbrug
```

Forretningslogik ligger i `services/`, ikke i komponenterne.

## AI-abstraktion

`services/parsing/parsingService.ts` implementerer et `ItemParser`-interface med en lokal, regelbaseret parser (ingen ekstern API nødvendig). Skulle appen senere skulle bruge en rigtig LLM (OpenAI/Claude/Gemini) til bedre sprogforståelse, er det kun denne fil, der skal udskiftes — resten af appen taler kun med interfacet.

Det samme gælder søgning (`ItemSearchService`) og lagring (`ItemStore`), som begge er skrevet som udskiftelige services.

## Data og privatliv

Alt data gemmes lokalt i browserens IndexedDB — intet sendes til nogen server. Under Indstillinger kan du eksportere/importere dine data som JSON, eller slette det hele.

## Kendte begrænsninger (MVP)

- Web Speech API er ikke standardiseret på tværs af browsere; kvaliteten af talegenkendelse varierer.
- Den lokale parser dækker almindelige danske formuleringsmønstre, men er ikke en fuld NLP-løsning — usikre sætninger sendes til manuel bekræftelse i stedet for at gætte forkert.
- Ingen cloud-sync endnu — data er bundet til den browser/enhed, du bruger.
