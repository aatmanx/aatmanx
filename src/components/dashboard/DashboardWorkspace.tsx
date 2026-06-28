import { Link, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  CreditCard,
  Database,
  Expand,
  Laptop,
  LogOut,
  Pencil,
  Puzzle,
  Rocket,
  Smartphone,
  Tablet,
  User,
} from "lucide-react";
import { useState } from "react";
import type { DashboardData } from "@/lib/dashboard/queries";
import type { SiteContent } from "@/lib/templates/hydrateSiteContent";
import { WebsitePreview, WebsitePreviewPlaceholder } from "./WebsitePreview";
import { ProgressTimeline, WebsiteStatusBadge } from "./DashboardSections";

type Viewport = "desktop" | "tablet" | "mobile";

type DockItem = {
  id: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
};

function DockTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="group relative flex items-center justify-center">
      {children}
      <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-xl border border-white/10 bg-[#171717] px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        {label}
      </span>
    </div>
  );
}

function FloatingDock({
  items,
  side,
  expanded,
  onToggleExpand,
}: {
  items: DockItem[];
  side: "left" | "right";
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  return (
    <aside
      className={`fixed top-1/2 z-30 -translate-y-1/2 transition-all duration-250 ${
        side === "left" ? "left-4" : "right-4"
      } ${expanded ? "w-56" : "w-[68px]"}`}
    >
      <div className="flex flex-col gap-2 rounded-[22px] border border-white/[0.08] bg-[#111111]/95 p-2 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <button
          type="button"
          onClick={onToggleExpand}
          className="mb-1 flex h-9 w-full items-center justify-center rounded-xl text-white/40 transition hover:bg-white/[0.06] hover:text-[#4DA3FF]"
          aria-label="Toggle panel"
        >
          <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? (side === "left" ? "rotate-180" : "") : side === "right" ? "rotate-180" : ""}`} />
        </button>
        {items.map((item) => {
          const inner = (
            <button
              type="button"
              onClick={item.onClick}
              className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-white/70 transition duration-150 hover:bg-white/[0.06] hover:text-[#4DA3FF] hover:shadow-[0_0_20px_rgba(77,163,255,0.15)]"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">{item.icon}</span>
              {expanded && <span className="truncate text-xs font-medium">{item.label}</span>}
            </button>
          );

          if (item.href) {
            return (
              <Link key={item.id} to={item.href} className="block">
                {expanded ? inner : <DockTooltip label={item.label}>{inner}</DockTooltip>}
              </Link>
            );
          }

          return (
            <div key={item.id}>
              {expanded ? inner : <DockTooltip label={item.label}>{inner}</DockTooltip>}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function CreditUsageCard() {
  const used = 34;
  const total = 100;
  const remaining = total - used;

  return (
    <div className="fixed bottom-6 right-6 z-40 w-56 rounded-[18px] border border-white/[0.08] bg-[#111111]/95 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-white/80">Credit Usage</span>
        <span className="text-[#4DA3FF]">{used}%</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#4DA3FF]/80 to-[#4DA3FF] transition-all duration-300"
          style={{ width: `${used}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-white/45">{remaining} credits remaining</p>
    </div>
  );
}

function PreviewToolbar({
  viewport,
  onViewportChange,
  onFullscreen,
}: {
  viewport: Viewport;
  onViewportChange: (v: Viewport) => void;
  onFullscreen: () => void;
}) {
  const buttons: { id: Viewport | "fullscreen"; icon: React.ReactNode; label: string }[] = [
    { id: "desktop", icon: <Laptop className="h-4 w-4" />, label: "View Desktop" },
    { id: "tablet", icon: <Tablet className="h-4 w-4" />, label: "View Tablet" },
    { id: "mobile", icon: <Smartphone className="h-4 w-4" />, label: "View Mobile" },
    { id: "fullscreen", icon: <Expand className="h-4 w-4" />, label: "View Fullscreen" },
  ];

  return (
    <div className="absolute -top-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/[0.08] bg-[#171717]/95 px-3 py-2 shadow-lg backdrop-blur-xl">
      {buttons.map((btn, i) => (
        <div key={btn.id} className="flex items-center">
          {i === 3 && <div className="mx-1 h-4 w-px bg-white/10" />}
          <DockTooltip label={btn.label}>
            <button
              type="button"
              onClick={() => (btn.id === "fullscreen" ? onFullscreen() : onViewportChange(btn.id as Viewport))}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition duration-150 ${
                btn.id !== "fullscreen" && viewport === btn.id
                  ? "bg-[#4DA3FF]/15 text-[#4DA3FF] shadow-[0_0_16px_rgba(77,163,255,0.2)]"
                  : "text-white/50 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {btn.icon}
            </button>
          </DockTooltip>
        </div>
      ))}
    </div>
  );
}

const viewportWidths: Record<Viewport, string> = {
  desktop: "max-w-[960px]",
  tablet: "max-w-[720px]",
  mobile: "max-w-[390px]",
};

type Props = {
  email: string | null;
  data: DashboardData;
  onSignOut: () => void;
};

export function DashboardWorkspace({ email, data, onSignOut }: Props) {
  const navigate = useNavigate();
  const [leftExpanded, setLeftExpanded] = useState(false);
  const [rightExpanded, setRightExpanded] = useState(false);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [showProgress, setShowProgress] = useState(false);

  const websiteJson = data.website?.website_json as {
    siteContent?: SiteContent;
    profile?: { businessName?: string };
  } | null;

  const siteContent = websiteJson?.siteContent;
  const businessName =
    data.business?.business_name ??
    (data.questionnaire?.answers_json as Record<string, unknown> | undefined)?.business_name ??
    websiteJson?.profile?.businessName;

  const previewMessage =
    data.website?.status === "generating"
      ? "Your website is being generated. Preview will appear shortly…"
      : data.website?.status === "ready" && !siteContent
        ? "Website is ready but preview content is loading…"
        : !data.website
          ? "Complete the questionnaire to generate your website preview."
          : "Generating preview from your template and AI content…";

  const leftItems: DockItem[] = [
    { id: "account", icon: <User className="h-4 w-4" strokeWidth={1.75} />, label: "Account Settings", href: "/account" },
    { id: "credits", icon: <CreditCard className="h-4 w-4" strokeWidth={1.75} />, label: "Buy Credits", href: "/billing" },
    { id: "integrations", icon: <Puzzle className="h-4 w-4" strokeWidth={1.75} />, label: "Integrations" },
    { id: "resources", icon: <BookOpen className="h-4 w-4" strokeWidth={1.75} />, label: "Resources" },
  ];

  const rightItems: DockItem[] = [
    { id: "publish", icon: <Rocket className="h-4 w-4" strokeWidth={1.75} />, label: "Publish", href: "/publish" },
    { id: "analytics", icon: <BarChart3 className="h-4 w-4" strokeWidth={1.75} />, label: "Analytics" },
    {
      id: "edit",
      icon: <Pencil className="h-4 w-4" strokeWidth={1.75} />,
      label: "Edit Mode",
      onClick: data.website
        ? () => navigate({ to: "/editor", search: { id: data.website!.id } })
        : () => setShowProgress(true),
    },
    { id: "database", icon: <Database className="h-4 w-4" strokeWidth={1.75} />, label: "Database", onClick: () => setShowProgress(true) },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090909] font-sans text-white selection:bg-[#4DA3FF]/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(77,163,255,0.06),transparent_55%)]" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-[#4DA3FF] shadow-[0_0_12px_#4DA3FF]" />
          <span className="text-sm font-semibold tracking-tight">aatman</span>
        </Link>
        <div className="flex items-center gap-4">
          <WebsiteStatusBadge data={data} />
          <span className="hidden text-xs text-white/40 sm:inline">{email}</span>
          <button
            type="button"
            onClick={onSignOut}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-white/50 transition hover:border-[#4DA3FF]/30 hover:text-[#4DA3FF]"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </header>

      <FloatingDock
        items={leftItems}
        side="left"
        expanded={leftExpanded}
        onToggleExpand={() => setLeftExpanded((v) => !v)}
      />
      <FloatingDock
        items={rightItems}
        side="right"
        expanded={rightExpanded}
        onToggleExpand={() => setRightExpanded((v) => !v)}
      />

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-[1400px] flex-col items-center justify-center px-24 pb-24 pt-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {businessName ? `${businessName}` : "Your workspace"}
          </h1>
          <p className="mt-1 text-sm text-white/45">
            {businessName ? "Live website preview" : "Start your questionnaire to build your site"}
          </p>
        </div>

        <div className={`relative w-full transition-all duration-300 ${viewportWidths[viewport]}`}>
          <PreviewToolbar
            viewport={viewport}
            onViewportChange={setViewport}
            onFullscreen={() => {
              const el = document.getElementById("website-preview-frame");
              el?.requestFullscreen?.();
            }}
          />

          <div
            id="website-preview-frame"
            className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#111] shadow-[0_24px_80px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.04)] ring-1 ring-[#4DA3FF]/[0.06]"
          >
            <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#0d0d0d] px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              </div>
              <div className="mx-auto flex h-7 w-48 items-center justify-center rounded-full bg-white/[0.04] text-[10px] text-white/30">
                {data.website?.slug ? `${data.website.slug}.aatman.app` : "preview.aatman.app"}
              </div>
            </div>

            <div className="max-h-[min(72vh,820px)] overflow-y-auto overflow-x-hidden">
              {siteContent ? (
                <WebsitePreview content={siteContent} />
              ) : (
                <WebsitePreviewPlaceholder message={previewMessage} />
              )}
            </div>
          </div>
        </div>

        {showProgress && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
            <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-[22px] border border-white/[0.08] bg-[#111111] p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Project Progress</h2>
                <button type="button" onClick={() => setShowProgress(false)} className="text-white/40 hover:text-white">
                  ✕
                </button>
              </div>
              <div className="mt-4">
                <ProgressTimeline data={data} />
              </div>
            </div>
          </div>
        )}
      </main>

      <CreditUsageCard />
    </div>
  );
}
