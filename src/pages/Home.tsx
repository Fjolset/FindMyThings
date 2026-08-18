import { useNavigate } from "react-router-dom";
import { TagCard } from "../components/TagCard";

export function Home() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center gap-8 px-5 py-10">
      <div className="text-center">
        <p className="font-display text-sm uppercase tracking-[0.2em] text-honey-deep">Find My Stuff</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-ink dark:text-ink-dark">Hvad vil du?</h1>
      </div>

      <div className="flex flex-col gap-5">
        <TagCard
          as="button"
          onClick={() => navigate("/place")}
          className="p-7 pl-14"
          accentColor="moss"
        >
          <div className="flex items-center gap-5">
            <span className="text-5xl" aria-hidden="true">
              📦
            </span>
            <div>
              <p className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">Jeg vil placere en ting</p>
              <p className="mt-1 text-ink-soft dark:text-ink-soft-dark">Fortæl mig, hvor du har lagt den</p>
            </div>
          </div>
        </TagCard>

        <TagCard
          as="button"
          onClick={() => navigate("/find")}
          className="p-7 pl-14"
          accentColor="honey"
        >
          <div className="flex items-center gap-5">
            <span className="text-5xl" aria-hidden="true">
              🔎
            </span>
            <div>
              <p className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">Jeg vil finde en ting</p>
              <p className="mt-1 text-ink-soft dark:text-ink-soft-dark">Find noget, du tidligere har lagt væk</p>
            </div>
          </div>
        </TagCard>
      </div>
    </div>
  );
}
