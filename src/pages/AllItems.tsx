import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { ItemCard } from "../components/ItemCard";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/Button";
import { useItems } from "../hooks/useItems";
import { normalizeForMatch } from "../services/search/normalize";

export function AllItems() {
  const navigate = useNavigate();
  const { items, loading } = useItems();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = normalizeForMatch(query);
    return items.filter((item) => normalizeForMatch(item.name).includes(q) || normalizeForMatch(item.location).includes(q));
  }, [items, query]);

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col px-5 pb-10">
      <PageHeader title="Alle mine ting" subtitle={`${items.length} ${items.length === 1 ? "ting gemt" : "ting gemt"}`} />

      <div className="mt-4">
        <label htmlFor="search-items" className="sr-only">
          Søg i dine ting
        </label>
        <input
          id="search-items"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Søg efter en ting eller et sted..."
          className="focus-ring w-full rounded-2xl border border-line bg-white/80 px-5 py-3 text-lg text-ink shadow-tag dark:border-line-dark dark:bg-white/[0.06] dark:text-ink-dark"
        />
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {loading ? (
          <p className="text-center text-ink-soft dark:text-ink-soft-dark">Indlæser...</p>
        ) : items.length === 0 ? (
          <EmptyState
            emoji="📦"
            title="Du har ikke gemt nogen ting endnu."
            description="Når du lægger noget et smart sted, så fortæl mig hvor."
            action={
              <Button variant="primary" size="lg" onClick={() => navigate("/place")}>
                🎙 Gem en ting
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState emoji="🔍" title={`Intet matcher "${query}"`} />
        ) : (
          filtered.map((item) => <ItemCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
