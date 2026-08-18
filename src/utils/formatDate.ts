export function formatRelativeDa(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86400000);

  const time = date.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });

  if (diffDays === 0) return `I dag kl. ${time}`;
  if (diffDays === 1) return `I går kl. ${time}`;
  if (diffDays > 1 && diffDays < 7) return `${diffDays} dage siden, kl. ${time}`;

  return `${date.toLocaleDateString("da-DK", { day: "numeric", month: "long" })} kl. ${time}`;
}

export function formatFullDa(iso: string): string {
  const date = new Date(iso);
  return `${date.toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" })} kl. ${date.toLocaleTimeString(
    "da-DK",
    { hour: "2-digit", minute: "2-digit" }
  )}`;
}

export function formatShortDa(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("da-DK", { day: "numeric", month: "short" });
}
