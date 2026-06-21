import { Check } from "lucide-react";
import * as Icons from "lucide-react";
import type { CategoryDefinition } from "@/lib/questionnaire/types";

type Props = {
  categories: CategoryDefinition[];
  selected?: string;
  onSelect: (categoryId: string) => void;
};

export function CategorySelect({ categories, selected, onSelect }: Props) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.3em] text-accent">step 01</div>
      <h1 className="mt-5 text-3xl sm:text-5xl font-bold tracking-tighter leading-[1.05]">Select Your Business Category</h1>
      <p className="mt-4 max-w-2xl text-sm text-muted-foreground leading-relaxed">
        Choose the category that best represents your business. This helps us create a website tailored specifically to your industry.
      </p>
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const Icon = ((Icons as unknown) as Record<string, React.ComponentType<{ className?: string }>>)[cat.icon] ?? Icons.Building2;
          const isSelected = selected === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              aria-pressed={isSelected}
              className={`group flex min-h-[88px] items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isSelected
                  ? "border-accent/80 bg-accent/10 shadow-[0_0_35px_-20px_var(--color-accent)]"
                  : "border-foreground/10 bg-foreground/[0.03] hover:border-accent/40 hover:bg-accent/5"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition ${
                  isSelected ? "border-accent/60 bg-accent/15 text-accent" : "border-foreground/10 bg-background/40 text-muted-foreground group-hover:text-accent"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="flex-1 text-sm font-medium">{cat.label}</span>
              {isSelected && <Check className="h-4 w-4 shrink-0 text-accent" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
