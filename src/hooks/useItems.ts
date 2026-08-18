import { useCallback, useEffect, useState } from "react";
import { itemStore } from "../services/storage/itemStore";
import type { Item } from "../types/item";

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const all = await itemStore.getAll();
    setItems(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    itemStore.addEventListener("change", handler);
    return () => itemStore.removeEventListener("change", handler);
  }, [refresh]);

  return { items, loading, refresh };
}

export function useItem(id: string | undefined) {
  const [item, setItem] = useState<Item | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!id) {
      setItem(undefined);
      setLoading(false);
      return;
    }
    const found = await itemStore.getById(id);
    setItem(found);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    itemStore.addEventListener("change", handler);
    return () => itemStore.removeEventListener("change", handler);
  }, [refresh]);

  return { item, loading, refresh };
}
