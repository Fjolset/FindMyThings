import { getDB, isStorageAvailable } from "./db";
import type { HistoryEntry, Item, NewItemInput } from "../../types/item";
import { normalizeForMatch } from "../search/normalize";

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** In-memory fallback used only if IndexedDB is unavailable (e.g. private browsing edge cases). */
const memoryStore = new Map<string, Item>();
let usingMemoryFallback = !isStorageAvailable();

export interface StorageErrorInfo {
  message: string;
}

export class ItemStore extends EventTarget {
  private emitChange(): void {
    this.dispatchEvent(new Event("change"));
  }

  async getAll(): Promise<Item[]> {
    try {
      if (usingMemoryFallback) return [...memoryStore.values()].sort(byUpdatedDesc);
      const db = await getDB();
      const items = await db.getAll("items");
      return items.sort(byUpdatedDesc);
    } catch (err) {
      usingMemoryFallback = true;
      console.error("IndexedDB read failed, falling back to memory store", err);
      return [...memoryStore.values()].sort(byUpdatedDesc);
    }
  }

  async getById(id: string): Promise<Item | undefined> {
    try {
      if (usingMemoryFallback) return memoryStore.get(id);
      const db = await getDB();
      return await db.get("items", id);
    } catch (err) {
      console.error("IndexedDB getById failed", err);
      return memoryStore.get(id);
    }
  }

  /**
   * Finds an existing item that most likely refers to the same physical object,
   * so a new voice note can update it in place instead of creating a duplicate.
   */
  async findLikelyDuplicate(name: string): Promise<Item | undefined> {
    const items = await this.getAll();
    const target = normalizeForMatch(name);
    let best: { item: Item; score: number } | undefined;
    for (const item of items) {
      const candidates = [item.name, ...(item.aliases ?? [])];
      for (const candidate of candidates) {
        const score = similarity(normalizeForMatch(candidate), target);
        if (score > 0.72 && (!best || score > best.score)) {
          best = { item, score };
        }
      }
    }
    return best?.item;
  }

  /**
   * Saves a parsed voice item. If a likely-duplicate item already exists, its
   * location is updated (with history) instead of creating a new row.
   */
  async upsertFromVoice(input: NewItemInput): Promise<Item> {
    const existing = await this.findLikelyDuplicate(input.name);
    const now = new Date().toISOString();

    if (existing) {
      return this.updateLocation(existing.id, input.location, input.originalTranscript);
    }

    const item: Item = {
      id: newId(),
      name: input.name.trim(),
      location: input.location.trim(),
      originalTranscript: input.originalTranscript,
      category: input.category,
      aliases: input.aliases ?? [],
      notes: undefined,
      createdAt: now,
      updatedAt: now,
      lastConfirmedAt: now,
      history: [{ id: newId(), location: input.location.trim(), changedAt: now, originalTranscript: input.originalTranscript }],
    };
    await this.put(item);
    return item;
  }

  async updateLocation(id: string, newLocation: string, originalTranscript?: string): Promise<Item> {
    const existing = await this.getById(id);
    if (!existing) throw new Error("Item findes ikke");
    const now = new Date().toISOString();
    const historyEntry: HistoryEntry = { id: newId(), location: newLocation.trim(), changedAt: now, originalTranscript };
    const updated: Item = {
      ...existing,
      location: newLocation.trim(),
      updatedAt: now,
      lastConfirmedAt: now,
      originalTranscript: originalTranscript ?? existing.originalTranscript,
      history: [historyEntry, ...existing.history],
    };
    await this.put(updated);
    return updated;
  }

  async rename(id: string, name: string): Promise<Item> {
    const existing = await this.getById(id);
    if (!existing) throw new Error("Item findes ikke");
    const updated: Item = { ...existing, name: name.trim(), updatedAt: new Date().toISOString() };
    await this.put(updated);
    return updated;
  }

  async remove(id: string): Promise<void> {
    try {
      if (usingMemoryFallback) {
        memoryStore.delete(id);
        return;
      }
      const db = await getDB();
      await db.delete("items", id);
    } catch (err) {
      console.error("IndexedDB delete failed", err);
      memoryStore.delete(id);
    } finally {
      this.emitChange();
    }
  }

  async clearAll(): Promise<void> {
    try {
      if (usingMemoryFallback) {
        memoryStore.clear();
        return;
      }
      const db = await getDB();
      await db.clear("items");
    } catch (err) {
      console.error("IndexedDB clear failed", err);
      memoryStore.clear();
    } finally {
      this.emitChange();
    }
  }

  async put(item: Item): Promise<void> {
    try {
      if (usingMemoryFallback) {
        memoryStore.set(item.id, item);
        return;
      }
      const db = await getDB();
      await db.put("items", item);
    } catch (err) {
      console.error("IndexedDB write failed, using memory store", err);
      usingMemoryFallback = true;
      memoryStore.set(item.id, item);
    } finally {
      this.emitChange();
    }
  }

  async bulkPut(items: Item[]): Promise<void> {
    for (const item of items) {
      await this.put(item);
    }
  }

  async exportAll(): Promise<string> {
    const items = await this.getAll();
    return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), items }, null, 2);
  }

  async importFromJson(json: string): Promise<number> {
    const parsed = JSON.parse(json) as { items?: Item[] };
    const items = parsed.items ?? [];
    await this.bulkPut(items);
    return items.length;
  }
}

function byUpdatedDesc(a: Item, b: Item): number {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

/** Simple bigram-overlap similarity (Dice coefficient), good enough for short item names. */
function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return a === b ? 1 : 0;
  const bigrams = (s: string) => {
    const set = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const bg = s.slice(i, i + 2);
      set.set(bg, (set.get(bg) ?? 0) + 1);
    }
    return set;
  };
  const A = bigrams(a);
  const B = bigrams(b);
  let overlap = 0;
  for (const [bg, count] of A) {
    const bCount = B.get(bg) ?? 0;
    overlap += Math.min(count, bCount);
  }
  const total = [...A.values()].reduce((s, v) => s + v, 0) + [...B.values()].reduce((s, v) => s + v, 0);
  return total === 0 ? 0 : (2 * overlap) / total;
}

export const itemStore = new ItemStore();
