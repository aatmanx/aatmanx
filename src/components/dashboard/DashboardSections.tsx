import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import type { DashboardData } from "@/lib/dashboard/queries";
import { isDashboardQuestionnaireComplete } from "@/lib/dashboard/queries";
import { derivePipelineStage, getStageIndex, PIPELINE_STAGES } from "@/lib/dashboard/pipeline";

type Props = {
  email: string | null;
  data: DashboardData;
};

export function WelcomeCard({ email, data }: Props) {
  const name = email?.split("@")[0] ?? "there";
  const answers = (data.questionnaire?.answers_json ?? {}) as Record<string, unknown>;
  const businessName = data.business?.business_name ?? (answers.business_name as string | undefined);
  const stage = derivePipelineStage(data.questionnaire, data.website);
  const stageMeta = PIPELINE_STAGES.find((s) => s.id === stage);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-card/60 to-background p-6 sm:p-8">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            welcome back
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tighter">{name}</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg">
            {businessName
              ? `Your ${businessName} website project is at stage: ${stageMeta?.label ?? "Draft"}.`
              : "No questionnaire found. Start the questionnaire to build your real estate website."}
          </p>
        </div>
        {!isDashboardQuestionnaireComplete(data) && (
          <Link
            to="/questionnaire"
            className="inline-flex shrink-0 items-center gap-2 rounded-md border border-accent/70 bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:bg-foreground/90 transition"
          >
            Start questionnaire <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

export function ProgressTimeline({ data }: { data: DashboardData }) {
  const stage = derivePipelineStage(data.questionnaire, data.website);
  const activeIndex = getStageIndex(stage);

  return (
    <ol className="space-y-0">
      {PIPELINE_STAGES.map((item, index) => {
        const isComplete = index < activeIndex;
        const isCurrent = index === activeIndex;
        return (
          <li key={item.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                  isComplete
                    ? "border-accent bg-accent text-accent-foreground"
                    : isCurrent
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-border bg-background text-muted-foreground"
                }`}
              >
                {isComplete ? "✓" : index + 1}
              </div>
              {index < PIPELINE_STAGES.length - 1 && (
                <div className={`w-px flex-1 min-h-[24px] ${isComplete ? "bg-accent/60" : "bg-border"}`} />
              )}
            </div>
            <div className="pb-6">
              <div className={`text-sm font-medium ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                {item.label}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function WebsiteStatusBadge({ data }: { data: DashboardData }) {
  const stage = derivePipelineStage(data.questionnaire, data.website);
  const meta = PIPELINE_STAGES.find((s) => s.id === stage);

  const colorMap: Record<string, string> = {
    draft: "bg-white/10 text-white/50",
    completed: "bg-blue-500/15 text-blue-300",
    processing: "bg-amber-500/15 text-amber-300",
    ai_generation: "bg-purple-500/15 text-purple-300",
    template_selection: "bg-cyan-500/15 text-cyan-300",
    website_building: "bg-orange-500/15 text-orange-300",
    website_ready: "bg-[#4DA3FF]/15 text-[#4DA3FF]",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${colorMap[stage] ?? colorMap.draft}`}>
      {meta?.label ?? "Draft"}
    </span>
  );
}
