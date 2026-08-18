import type { Item } from "../types/item";

function daysAgo(days: number, hour = 18, minute = 30): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function makeItem(
  id: string,
  name: string,
  location: string,
  createdDaysAgo: number,
  category: string,
  transcript: string
): Item {
  const createdAt = daysAgo(createdDaysAgo);
  return {
    id,
    name,
    location,
    originalTranscript: transcript,
    category,
    aliases: [],
    createdAt,
    updatedAt: createdAt,
    lastConfirmedAt: createdAt,
    history: [{ id: `${id}-h1`, location, changedAt: createdAt, originalTranscript: transcript }],
  };
}

export const DEMO_ITEMS: Item[] = [
  makeItem(
    "demo-bilnogler",
    "Bilnøgler",
    "Skuffen i entréen",
    2,
    "Nøgler",
    "Jeg har lagt mine bilnøgler i skuffen i entréen."
  ),
  makeItem("demo-airpods", "AirPods", "Natbordet", 1, "Elektronik", "Jeg har lagt mine AirPods på natbordet."),
  makeItem(
    "demo-pas",
    "Pas",
    "Blå mappe på kontoret",
    6,
    "Dokumenter",
    "Jeg har lagt mit pas i den blå mappe på kontoret."
  ),
  makeItem(
    "demo-solbriller",
    "Solbriller",
    "Skuffen i gangen",
    0,
    "Tilbehør",
    "Jeg har lagt mine solbriller i skuffen i gangen."
  ),
  makeItem(
    "demo-batterier",
    "Ekstra batterier",
    "Skabet i bryggerset",
    9,
    "Værktøj",
    "Jeg har lagt de ekstra batterier i skabet i bryggerset."
  ),
  makeItem(
    "demo-malebaand",
    "Målebånd",
    "Værktøjskassen",
    14,
    "Værktøj",
    "Jeg har lagt målebåndet i værktøjskassen."
  ),
];
