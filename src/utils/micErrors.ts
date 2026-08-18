export function micErrorMessage(reason: string | null): string {
  switch (reason) {
    case "not-allowed":
    case "service-not-allowed":
      return "Jeg har ikke adgang til mikrofonen. Tjek dine browserindstillinger og prøv igen.";
    case "no-speech":
      return "Jeg hørte ikke noget. Prøv at tale lidt højere.";
    case "audio-capture":
      return "Jeg kunne ikke finde en mikrofon på enheden.";
    case "network":
      return "Der er et problem med internetforbindelsen. Prøv igen.";
    default:
      return "Jeg kunne ikke høre dig ordentligt. Prøv igen.";
  }
}
