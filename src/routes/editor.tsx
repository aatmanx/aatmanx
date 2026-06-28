import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Expand, Loader2 } from "lucide-react";
import { useRequireAuth } from "@/lib/auth/guards";
import { getPrimaryWebsite } from "@/lib/dashboard/queries";
import type { SiteContent } from "@/lib/templates/hydrateSiteContent";
import { WebsitePreview, WebsitePreviewPlaceholder } from "@/components/dashboard/WebsitePreview";

export const Route = createFileRoute("/editor")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: EditorPage,
});

function EditorPage() {
  const { userId, loading: authLoading } = useRequireAuth({ redirectTo: "/login" });
  const navigate = useNavigate();
  const { id } = Route.useSearch();

  const { data: website, isLoading } = useQuery({
    queryKey: ["editor-website", userId, id],
    queryFn: () => getPrimaryWebsite(userId!),
    enabled: Boolean(userId),
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090909]">
        <Loader2 className="h-5 w-5 animate-spin text-[#4DA3FF]" />
      </div>
    );
  }

  const websiteJson = website?.website_json as { siteContent?: SiteContent } | null;
  const siteContent = websiteJson?.siteContent;

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <header className="flex h-14 items-center justify-between border-b border-white/[0.08] px-6">
        <Link to="/dashboard" className="text-sm text-white/50 transition hover:text-white">
          ← Dashboard
        </Link>
        <span className="text-xs text-white/40">Website Editor</span>
        <button
          type="button"
          onClick={() => document.getElementById("editor-preview")?.requestFullscreen?.()}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-white/50 hover:text-[#4DA3FF]"
          aria-label="Fullscreen"
        >
          <Expand className="h-4 w-4" />
        </button>
      </header>
      <main id="editor-preview" className="mx-auto max-w-5xl px-4 py-8">
        {siteContent ? (
          <div className="overflow-hidden rounded-[28px] border border-white/[0.08] shadow-2xl">
            <WebsitePreview content={siteContent} />
          </div>
        ) : (
          <WebsitePreviewPlaceholder
            message={
              website?.status === "generating"
                ? "Your website is still being generated. Return to the dashboard to track progress."
                : "No preview available yet. Complete the questionnaire and wait for AI generation."
            }
          />
        )}
        <button
          type="button"
          onClick={() => navigate({ to: "/dashboard" })}
          className="mt-8 rounded-xl border border-[#4DA3FF]/40 px-5 py-2.5 text-sm text-[#4DA3FF] transition hover:bg-[#4DA3FF]/10"
        >
          Back to dashboard
        </button>
      </main>
    </div>
  );
}
