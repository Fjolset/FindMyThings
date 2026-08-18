import { useNavigate } from "react-router-dom";
import type { Item } from "../types/item";
import { iconForItem } from "../utils/icons";
import { TagCard } from "./TagCard";

export function ItemCard({ item }: { item: Item }) {
  const navigate = useNavigate();
  return (
    <TagCard as="button" onClick={() => navigate(`/items/${item.id}`)} className="w-full p-5 pl-12">
      <div className="flex items-center gap-4">
        <span className="text-3xl" aria-hidden="true">
          {iconForItem(item.name, item.category)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl font-semibold text-ink dark:text-ink-dark">{item.name}</p>
          <p className="truncate text-ink-soft dark:text-ink-soft-dark">📍 {item.location}</p>
        </div>
        <span className="text-ink-soft dark:text-ink-soft-dark" aria-hidden="true">
          →
        </span>
      </div>
    </TagCard>
  );
}
