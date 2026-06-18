import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Home,
  Sparkles,
  Workflow,
  Wallet,
  LayoutDashboard,
  ArrowUpRight,
  Check,
  X,
  Terminal,
  Zap,
  Globe,
  Shield,
  LineChart,
  Code2,
  Send,
  ChevronRight,
} from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { PixelHero } from "@/components/ui/pixel-hero";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "aatman — Production websites for businesses, in minutes" },
      {
        name: "description",
        content:
          "aatman is a B2B website engine. Answer a structured intake, get a production-grade business website — SEO, performance and conversion wired up by default.",
      },
    ],
  }),
  component: Index,
});

const navItems = [
  { name: "home", url: "#home", icon: Home },
  { name: "features", url: "#features", icon: Sparkles },
  { name: "workflow", url: "#workflow", icon: Workflow },
  { name: "pricing", url: "#pricing", icon: Wallet },
];

function Index() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <NavBar
        items={navItems}
        trailing={
          <a
            href="/dashboard"
            aria-label="Open dashboard"
            className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/60 text-foreground/80 backdrop-blur-lg shadow-lg transition hover:border-accent/60 hover:text-foreground"
          >
            <LayoutDashboard className="h-4 w-4" />
          </a>
        }
      />
      <PixelHero
        onPrimaryClick={() => navigate({ to: "/questionnaire" })}
        onSecondaryClick={() => {
          document.querySelector("#workflow")?.scrollIntoView({ behavior: "smooth" });
        }}
      />
      <Features />
      <WorkflowSection />
      <Pricing />
      <Resources />
      <Tradeoffs />
      <Footer />
    </div>
  );
}

/* ---------------- FEATURES (visualized cards) ---------------- */
function Features() {
  return (
    <section id="features" className="relative px-6 py-32 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          tag="// 01"
          title="built for operators"
          subtitle="Every block is engineered for the way real businesses convert customers — not for design awards."
        />

        {/* Grid of visualization cards */}
        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <BigVizCard
            title="Structured intake → live URL"
            body="A short questionnaire about your business, sector, services and tone. Our engine assembles copy, layout and pages, then deploys to a production URL."
            visual={<IntakeMockup />}
            className="md:col-span-2 lg:col-span-2"
          />
          <BigVizCard
            title="Performance, baked in"
            body="98+ Lighthouse out of the box. Edge-cached, optimized images, semantic HTML."
            visual={<LighthouseMockup />}
          />
          <BigVizCard
            title="On-brand by default"
            body="Pick a direction or upload a brand kit. Type, color and spacing scales lock to your identity across every page."
            visual={<BrandMockup />}
          />
          <BigVizCard
            title="Iterate in plain English"
            body="Don't like a hero, change a CTA, re-do the pricing? Describe it. The site re-deploys in seconds."
            visual={<ChatMockup />}
            className="lg:col-span-2"
          />
        </div>

        {/* Small feature row */}
        <div className="mt-4 grid gap-px bg-border rounded-lg overflow-hidden border border-border md:grid-cols-3">
          {[
            { icon: Zap, title: "instant_generate()", body: "Form submit to live URL in under a minute." },
            { icon: Shield, title: "secure_by_default", body: "HTTPS, headers, CDN, image opt — wired up." },
            { icon: Globe, title: "custom_domain", body: "Bring your domain or use a free .aatman.app subdomain." },
          ].map((f) => (
            <div key={f.title} className="bg-background p-6">
              <f.icon className="h-4 w-4 text-accent" strokeWidth={1.75} />
              <h3 className="mt-4 text-sm font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BigVizCard({
  title,
  body,
  visual,
  className = "",
}: {
  title: string;
  body: string;
  visual: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className={`group relative rounded-2xl border border-border bg-card/40 backdrop-blur p-6 overflow-hidden ${className}`}
    >
      <div className="rounded-lg border border-border bg-background/60 h-56 overflow-hidden relative">
        {visual}
      </div>
      <div className="mt-5">
        <h3 className="text-base font-semibold text-foreground tracking-tight">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </motion.div>
  );
}

/* ----- Mockup visuals ----- */
function IntakeMockup() {
  return (
    <div className="relative h-full w-full p-5">
      <div className="grid grid-cols-2 gap-3 h-full">
        <div className="space-y-2">
          {[
            ["business_name", "north & co. coffee"],
            ["industry", "f&b · café"],
            ["tone", "warm, editorial"],
            ["pages", "home, menu, about"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-md border border-border bg-card/60 px-3 py-2">
              <div className="text-[10px] text-muted-foreground">{k}</div>
              <div className="text-xs text-foreground truncate">{v}</div>
            </div>
          ))}
        </div>
        <div className="rounded-md border border-border bg-background overflow-hidden flex flex-col">
          <div className="px-3 py-1.5 border-b border-border flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
            <span className="ml-2 text-[9px] text-muted-foreground">northandco.aatman.app</span>
          </div>
          <div className="flex-1 p-3 space-y-1.5">
            <div className="h-2 w-2/3 bg-foreground/80 rounded" />
            <div className="h-1.5 w-full bg-muted rounded" />
            <div className="h-1.5 w-5/6 bg-muted rounded" />
            <div className="mt-2 grid grid-cols-3 gap-1">
              <div className="h-8 bg-muted/60 rounded" />
              <div className="h-8 bg-muted/60 rounded" />
              <div className="h-8 bg-muted/60 rounded" />
            </div>
            <div className="mt-2 h-5 w-20 bg-foreground rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LighthouseMockup() {
  const scores = [
    { l: "perf", v: 98 },
    { l: "a11y", v: 100 },
    { l: "seo", v: 100 },
  ];
  return (
    <div className="h-full w-full p-5 flex flex-col justify-between">
      <div className="text-[10px] text-muted-foreground">// lighthouse.json</div>
      <div className="grid grid-cols-3 gap-3">
        {scores.map((s) => (
          <div key={s.l} className="flex flex-col items-center">
              <div className="relative h-14 w-14 rounded-full border-2 border-accent/70 flex items-center justify-center">
              <span className="text-base font-bold text-foreground">{s.v}</span>
            </div>
            <div className="mt-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="text-[10px] text-muted-foreground">measured on mobile · 4G throttle</div>
    </div>
  );
}

function BrandMockup() {
  return (
    <div className="h-full w-full p-5 flex flex-col justify-between">
      <div className="text-[10px] text-muted-foreground">// brand_tokens.ts</div>
      <div className="space-y-2">
        <div className="flex gap-1.5">
          {["bg-foreground", "bg-muted-foreground", "bg-muted", "bg-card", "bg-border"].map((c, i) => (
            <div key={i} className={`h-6 flex-1 rounded ${c}`} />
          ))}
        </div>
        <div className="rounded border border-border p-2">
          <div className="text-[10px] text-muted-foreground">display</div>
          <div className="text-sm font-bold text-foreground">Northwind Capital</div>
        </div>
        <div className="rounded border border-border p-2">
          <div className="text-[10px] text-muted-foreground">body</div>
          <div className="text-[11px] text-muted-foreground">Private credit for mid-market.</div>
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground">locked across 14 pages</div>
    </div>
  );
}

function ChatMockup() {
  return (
    <div className="h-full w-full p-5 flex flex-col gap-2">
      <div className="text-[10px] text-muted-foreground">// session_8af2.log</div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="ml-auto max-w-[75%] rounded-lg rounded-br-sm bg-card border border-border px-3 py-2 text-[11px] text-foreground">
          Make the hero darker, replace the headline with "Underwriting, accelerated."
        </div>
        <div className="max-w-[80%] rounded-lg rounded-bl-sm bg-background border border-border px-3 py-2 text-[11px] text-muted-foreground">
          Updated hero copy + dropped luminance 8%. Redeployed in 12s.
          <span className="ml-1 text-foreground">✓</span>
        </div>
        <div className="ml-auto max-w-[60%] rounded-lg rounded-br-sm bg-card border border-border px-3 py-2 text-[11px] text-foreground">
          Add a case study row above pricing.
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
        <span className="text-[11px] text-muted-foreground flex-1">describe a change…</span>
        <Send className="h-3 w-3 text-foreground" />
      </div>
    </div>
  );
}

/* ---------------- WORKFLOW ---------------- */
const steps = [
  { n: "01", t: "answer", d: "Tell us your business, sector and tone — through a 4-minute structured intake." },
  { n: "02", t: "generate", d: "We assemble copy, layout, sections and brand-locked styling for your industry." },
  { n: "03", t: "review", d: "Preview every page. Tweak any block through a single prompt." },
  { n: "04", t: "deploy", d: "Publish to a subdomain or your own. SSL, CDN, headers — handled." },
];

function WorkflowSection() {
  return (
    <section id="workflow" className="relative px-6 py-32 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <SectionHeader tag="// 02" title="how it works" subtitle="Four steps between you and a website your sales team would actually link to." />

        {/* Split: steps list + live preview mockup */}
        <div className="mt-16 grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card/40 backdrop-blur p-6">
            <div className="text-[10px] text-muted-foreground mb-4">// pipeline.steps</div>
            <ol className="space-y-1">
              {steps.map((s, i) => (
                <li key={s.n}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="group flex items-start gap-3 rounded-lg px-3 py-3 hover:bg-background/60 transition"
                  >
                    <span className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">{s.n}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-foreground">{s.t}()</div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.d}</div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition" />
                  </motion.div>
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-3 rounded-2xl border border-border bg-card/40 backdrop-blur overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              </div>
              <span className="text-[10px] text-muted-foreground">~ aatman/build.sh</span>
            </div>
            <pre className="px-5 py-5 text-[11px] leading-6 text-muted-foreground font-mono">
{`> intake.collect()
  ✓ business_name     "meridian financial"
  ✓ industry          "fintech · b2b"
  ✓ tone              "credible, restrained"
  ✓ pages             [home, product, pricing, about, contact]

> engine.generate()
  ✓ copy.draft        18 sections
  ✓ layout.assemble   responsive · 5 breakpoints
  ✓ images.fetch      licensed · webp · cdn
  ✓ seo.bake          schema · sitemap · og

`}<span className="text-foreground">✓ deployed → meridian.aatman.app   (47s)</span>
            </pre>
          </div>
        </div>

        {/* Stats panel */}
        <div className="mt-4 rounded-2xl border border-border bg-card/40 backdrop-blur overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Terminal className="h-3.5 w-3.5" />
              measured_improvements.json
            </div>
            <span className="text-[11px] text-muted-foreground">last 30 days</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
            {[
              { v: "47s", l: "avg. time to first deploy" },
              { v: "98", l: "median lighthouse score" },
              { v: "12k+", l: "businesses deployed" },
              { v: "94%", l: "skip the agency quote" },
            ].map((s) => (
              <div key={s.l} className="p-8">
                <div className="text-4xl font-bold tracking-tighter text-foreground">{s.v}</div>
                <div className="mt-2 text-xs text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- PRICING ---------------- */
const tiers = [
  {
    name: "starter",
    price: "$0",
    cadence: "/forever",
    desc: "For solo operators putting their first site online.",
    features: ["1 business site", "aatman.app subdomain", "Up to 5 pages", "Basic analytics"],
    cta: "start free",
    highlight: false,
  },
  {
    name: "studio",
    price: "$49",
    cadence: "/month",
    desc: "For growing B2B businesses with a real funnel.",
    features: ["3 sites", "Custom domain", "Unlimited pages", "Lead-capture forms", "Priority generation"],
    cta: "go studio",
    highlight: true,
  },
  {
    name: "scale",
    price: "$149",
    cadence: "/month",
    desc: "For agencies and multi-brand operators.",
    features: ["Unlimited sites", "Team workspaces", "White-label exports", "Advanced analytics", "Dedicated support"],
    cta: "talk to us",
    highlight: false,
  },
];

function Pricing() {
  const navigate = useNavigate();
  return (
    <section id="pricing" className="relative px-6 py-32 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <SectionHeader tag="// 03" title="pricing" subtitle="Pay for what you ship. Cancel any time." />
        <div className="mt-16 grid md:grid-cols-3 gap-4">
          {tiers.map((t) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className={`rounded-2xl border p-8 flex flex-col ${
                t.highlight ? "border-foreground bg-card" : "border-border bg-card/40"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold text-foreground">{t.name}</h3>
                {t.highlight && (
              <span className="text-[10px] uppercase tracking-widest text-accent-foreground bg-accent px-2 py-0.5 rounded">
                    popular
                  </span>
                )}
              </div>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tighter text-foreground">{t.price}</span>
                <span className="text-xs text-muted-foreground">{t.cadence}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{t.desc}</p>
              <ul className="mt-8 space-y-3 text-sm text-foreground/90 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 text-accent" strokeWidth={2} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate({ to: "/questionnaire" })}
                className={`mt-8 w-full rounded-md py-3 text-sm font-semibold transition ${
                  t.highlight
                    ? "border border-accent/70 bg-foreground text-background hover:bg-foreground/90"
                    : "border border-accent/40 bg-background text-foreground hover:bg-muted"
                }`}
              >
                {t.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- RESOURCES ---------------- */
const resources = [
  { cat: "guide", t: "what actually makes a B2B website convert", d: "Hierarchy, trust signals, the 5-second test — explained without jargon.", read: "8 min" },
  { cat: "glossary", t: "DNS, hosting, SSL — what each one actually does", d: "The technical stack of any website, broken down for non-developers.", read: "6 min" },
  { cat: "playbook", t: "writing copy that sounds human, not corporate", d: "How to brief aatman so the generated copy matches your real voice.", read: "5 min" },
  { cat: "guide", t: "SEO basics: ranking without hiring an agency", d: "Titles, metadata, sitemaps and the few things that move the needle.", read: "10 min" },
];

function Resources() {
  return (
    <section id="resources" className="relative px-6 py-32 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <SectionHeader tag="// 04" title="resources" subtitle="Get fluent in the technical side of running your own website." />
        <div className="mt-16 grid md:grid-cols-2 gap-4">
          {resources.map((r, i) => (
            <motion.a
              key={r.t}
              href="#"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group rounded-2xl border border-border bg-card/40 backdrop-blur p-8 hover:bg-card transition flex flex-col"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>// {r.cat}</span>
                <span>{r.read}</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground leading-snug">{r.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{r.d}</p>
              <div className="mt-6 inline-flex items-center gap-1 text-xs text-foreground">
                read article
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- TRADEOFFS ---------------- */
const pros = [
  "Live in minutes, not weeks",
  "No designer or developer in the loop",
  "Costs less than a single freelancer invoice",
  "Edit anything through plain-English prompts",
  "Built-in SEO, speed, accessibility",
];
const cons = [
  "Not built for highly custom web apps",
  "Less control than hand-written code",
  "Custom integrations may need our team",
  "Brand systems still benefit from a human designer",
];

function Tradeoffs() {
  const navigate = useNavigate();
  return (
    <section id="tradeoffs" className="relative px-6 py-32 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <SectionHeader tag="// 05" title="advantages & tradeoffs" subtitle="An honest look at when aatman is the right call — and when it isn't." />
        <div className="mt-16 grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card/40 backdrop-blur p-8">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5" /> advantages.log
            </div>
            <ul className="mt-6 space-y-4">
              {pros.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-foreground/90">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card/40 backdrop-blur p-8">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <X className="h-3.5 w-3.5" /> tradeoffs.log
            </div>
            <ul className="mt-6 space-y-4">
              {cons.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-gradient-to-br from-card/60 to-background p-10 text-center">
          <h3 className="text-3xl sm:text-4xl font-bold tracking-tighter text-foreground">ready to ship?</h3>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
            Walk away with a live B2B website your sales team would actually send to a customer.
          </p>
          <button
            onClick={() => navigate({ to: "/questionnaire" })}
            className="mt-8 inline-flex items-center gap-2 rounded-md border border-accent/70 bg-foreground text-background px-6 py-3 text-sm font-semibold hover:bg-foreground/90 transition"
          >
            $ aatman init
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- SHARED ---------------- */
function SectionHeader({ tag, title, subtitle }: { tag: string; title: string; subtitle: string }) {
  return (
    <div className="max-w-2xl">
      <span className="text-xs text-muted-foreground">{tag}</span>
      <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tighter text-foreground">{title}</h2>
      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12 pb-28 sm:pb-12">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-foreground" />
          <span className="text-foreground font-semibold">aatman</span>
          <span>— websites for businesses, engineered.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-foreground transition">privacy</a>
          <a href="#" className="hover:text-foreground transition">terms</a>
          <a href="#" className="hover:text-foreground transition">contact</a>
        </div>
      </div>
    </footer>
  );
}
