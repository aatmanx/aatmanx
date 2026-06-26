import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  X,
  LayoutDashboard,
  Globe,
  Zap,
  Sparkles,
  TrendingUp,
  Clock,
  IndianRupee,
  Menu,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "aatman — Build your business website in minutes" },
      {
        name: "description",
        content:
          "aatman builds production-grade business websites in minutes. Answer a short intake, get a complete website — branded, SEO-ready, deployed.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <TopNav />
      <DashboardFab />
      <Hero />
      <HowItWorks />
      <Advantages />
      <Pricing />
      <Resources />
      <Footer />
    </div>
  );
}

/* ───────────────────── TOP NAV ───────────────────── */
function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = [
    { l: "Home", href: "#home" },
    { l: "How it works", href: "#how" },
    { l: "Pricing", href: "#pricing" },
    { l: "Resources", href: "#resources" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card/60">
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_14px_var(--color-accent)]" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground">aatman</span>
        </Link>

        {/* Center nav (desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          {items.map((i) => (
            <a
              key={i.l}
              href={i.href}
              className="px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground transition rounded-md"
            >
              {i.l}
            </a>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden sm:inline-flex text-[13px] text-muted-foreground hover:text-foreground transition"
          >
            Sign in
          </Link>
          <Link
            to="/dashboard"
            className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-accent/60 bg-foreground px-4 py-2 text-[13px] font-semibold text-background hover:bg-foreground/90 transition shadow-[0_0_24px_-10px_var(--color-accent)]"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Open dashboard
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card/40 text-foreground"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col gap-1">
            {items.map((i) => (
              <a
                key={i.l}
                href={i.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition rounded-md"
              >
                {i.l}
              </a>
            ))}
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full border border-accent/60 bg-foreground px-4 py-2.5 text-sm font-semibold text-background"
            >
              <LayoutDashboard className="h-4 w-4" />
              Open dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function DashboardFab() {
  return null;
}

/* ───────────────────── HERO ───────────────────── */
function Hero() {
  const navigate = useNavigate();
  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 pt-28 pb-20 text-center"
    >
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-[60rem] text-3xl sm:text-5xl md:text-6xl lg:text-[64px] font-bold tracking-tighter leading-[1.05] text-foreground whitespace-normal lg:whitespace-nowrap"
      >
        Build your business website in minutes.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="mt-7 max-w-2xl text-base text-muted-foreground leading-relaxed"
      >
        Tell us about your business and get your business website published in minutes.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-3"
      >
        <button
          onClick={() => navigate({ to: "/questionnaire" })}
          className="group inline-flex items-center gap-2 rounded-full border border-accent/70 bg-foreground text-background px-6 py-3 text-sm font-semibold hover:bg-foreground/90 transition shadow-[0_0_36px_-10px_var(--color-accent)]"
        >
          Build my website from scratch
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </button>
        <button
          disabled
          aria-disabled="true"
          title="Coming soon"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 backdrop-blur px-6 py-3 text-sm font-semibold text-muted-foreground/60 cursor-not-allowed"
        >
          Upgrade my website
          <span className="ml-1 text-[10px] uppercase tracking-widest text-muted-foreground/50">soon</span>
        </button>
      </motion.div>
    </section>
  );
}

/* ───────── HOW IT WORKS + PROBLEMS WE SOLVE ───────── */
function HowItWorks() {
  return (
    <section id="how" className="relative px-6 py-32 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          tag="// 01"
          title="how it works & problems we solve"
          subtitle="Four moves between an empty domain and a live site. Below, the numbers we move on behalf of our customers."
        />

        <div className="mt-16 grid lg:grid-cols-5 gap-4">
          {/* Steps */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card/40 p-6">
            <div className="text-[10px] text-muted-foreground mb-4">// pipeline.steps</div>
            <ol className="space-y-1">
              {[
                { n: "01", t: "answer", d: "Tell us your business, tone and audience through a short intake." },
                { n: "02", t: "generate", d: "We assemble copy, layout, sections and brand styling for your industry." },
                { n: "03", t: "review", d: "Preview every page. Tweak anything in plain English." },
                { n: "04", t: "deploy", d: "Publish to your domain. SSL, CDN, SEO — handled." },
              ].map((s, i) => (
                <motion.li
                  key={s.n}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 rounded-lg px-3 py-3 hover:bg-background/60 transition"
                >
                  <span className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">{s.n}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground">{s.t}()</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.d}</div>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>

          {/* Animated website preview */}
          <div className="lg:col-span-3 rounded-2xl border border-border bg-card/40 overflow-hidden">
            <SiteBuildPreview />
          </div>
        </div>

        {/* Analytics — problems we solve */}
        <div className="mt-4 rounded-2xl border border-border bg-card/40 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              problems_we_solve.json
            </div>
            <span className="text-[11px] text-muted-foreground">measured across customers</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
            {[
              { v: "47s", l: "avg. time to first deploy", icon: Clock },
              { v: "98", l: "median lighthouse score", icon: Zap },
              { v: "12k+", l: "businesses online", icon: Globe },
              { v: "94%", l: "skip the agency quote", icon: Sparkles },
            ].map((s) => (
              <div key={s.l} className="p-8">
                <s.icon className="h-3.5 w-3.5 text-accent mb-3" />
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

/* Looping fake "site being built" preview */
function SiteBuildPreview() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 4), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
        </div>
        <span className="text-[10px] text-muted-foreground">meridian.aatman.app</span>
      </div>
      <div className="p-5 h-[320px] flex flex-col gap-3">
        {/* Header skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: step >= 0 ? 1 : 0.2 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <div className="h-3 w-24 rounded bg-foreground/80" />
          <div className="flex gap-2">
            <div className="h-2 w-10 rounded bg-muted" />
            <div className="h-2 w-10 rounded bg-muted" />
            <div className="h-2 w-10 rounded bg-muted" />
          </div>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: step >= 1 ? 1 : 0.15, y: step >= 1 ? 0 : 8 }}
          transition={{ duration: 0.4 }}
          className="mt-2 space-y-2"
        >
          <div className="h-4 w-3/4 rounded bg-foreground/90" />
          <div className="h-3 w-1/2 rounded bg-foreground/70" />
          <div className="h-2 w-2/3 rounded bg-muted" />
          <div className="mt-3 flex gap-2">
            <div className="h-6 w-24 rounded bg-foreground" />
            <div className="h-6 w-20 rounded border border-border" />
          </div>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: step >= 2 ? 1 : 0.15 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-3 gap-2 mt-3"
        >
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded bg-card/80 border border-border p-2 space-y-1">
              <div className="h-2 w-2/3 rounded bg-foreground/70" />
              <div className="h-1.5 w-full rounded bg-muted" />
              <div className="h-1.5 w-5/6 rounded bg-muted" />
            </div>
          ))}
        </motion.div>

        {/* Deploy badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: step >= 3 ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          className="mt-auto inline-flex items-center gap-2 self-end rounded-full border border-accent/60 bg-accent/10 px-3 py-1 text-[10px] text-accent"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          deployed in 47s
        </motion.div>
      </div>
    </div>
  );
}

/* ───────────────────── ADVANTAGES / DISADVANTAGES ───────────────────── */
const advantages = [
  "Live website in minutes — not weeks",
  "No designers, no developers, no agency",
  "Cheaper than a single freelancer invoice",
  "Edit anything via plain-English prompts",
  "SEO, speed and accessibility built in",
  "Hosted, secured and updated for you",
];

const disadvantages = [
  "Custom backend logic needs a developer",
  "Pixel-perfect bespoke design needs a designer",
  "Slow iteration — weeks per revision",
  "Recurring agency retainers",
  "Manual SEO, hosting, SSL setup",
  "You own every bug and outage",
];

function Advantages() {
  return (
    <section id="advantages" className="relative px-6 py-32 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          tag="// 02"
          title="aatman vs. hiring coders"
          subtitle="The honest difference between shipping with aatman and going the traditional route."
        />

        <div className="mt-16 grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card/40 p-8">
            <div className="flex items-center gap-2 text-xs text-foreground/80">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              with aatman
            </div>
            <ul className="mt-6 space-y-3.5">
              {advantages.map((a) => (
                <li key={a} className="flex items-start gap-3 text-sm text-foreground/90">
                  <Check className="h-4 w-4 mt-0.5 shrink-0 text-emerald-400" strokeWidth={2.5} />
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card/40 p-8">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500/15 text-red-400">
                <X className="h-3 w-3" strokeWidth={3} />
              </span>
              hiring coders / agencies
            </div>
            <ul className="mt-6 space-y-3.5">
              {disadvantages.map((d) => (
                <li key={d} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <X className="h-4 w-4 mt-0.5 shrink-0 text-red-400" strokeWidth={2.5} />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── PRICING (INR) ───────────────────── */
const tiers = [
  {
    name: "Basic",
    price: "0",
    cadence: "free forever",
    desc: "Get your first business site online.",
    features: ["1 website", "aatman.app subdomain", "Up to 5 pages", "Basic analytics", "Community support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "1,499",
    cadence: "/month",
    desc: "Everything Basic, plus the stuff growing businesses need.",
    features: [
      "3 websites",
      "Custom .com / .in domain",
      "Unlimited pages",
      "Lead-capture forms",
      "Advanced analytics",
      "Priority generation",
    ],
    cta: "Get Pro",
    highlight: true,
  },
  {
    name: "Premium",
    price: "4,999",
    cadence: "/month",
    desc: "For agencies and multi-brand operators.",
    features: [
      "Unlimited websites",
      "Team workspaces",
      "White-label exports",
      "Dedicated AI hours",
      "Dedicated support",
      "SLA & onboarding",
    ],
    cta: "Get Premium",
    highlight: false,
  },
];

function Pricing() {
  const navigate = useNavigate();
  return (
    <section id="pricing" className="relative px-6 py-32 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h2 className="text-5xl sm:text-6xl font-bold tracking-tighter text-foreground">Pricing</h2>
          <p className="mt-4 text-sm text-muted-foreground">Pay for what you ship. Cancel any time.</p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-4">
          {tiers.map((t) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className={`rounded-2xl border p-8 flex flex-col ${
                t.highlight ? "border-foreground bg-card/60" : "border-border bg-card/30"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-semibold text-foreground">{t.name}</h3>
                {t.highlight && (
                  <span className="text-[10px] uppercase tracking-widest bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                    popular
                  </span>
                )}
              </div>
              <div className="mt-5 flex items-baseline gap-1">
                {t.price !== "0" && <IndianRupee className="h-6 w-6 text-foreground" strokeWidth={2.5} />}
                {t.price === "0" ? (
                  <span className="text-5xl font-bold tracking-tighter text-foreground">Free</span>
                ) : (
                  <span className="text-5xl font-bold tracking-tighter text-foreground">{t.price}</span>
                )}
                <span className="ml-1 text-xs text-muted-foreground">{t.cadence}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{t.desc}</p>
              <ul className="mt-7 space-y-3 text-sm text-foreground/90 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 text-emerald-400" strokeWidth={2.5} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate({ to: "/questionnaire" })}
                className={`mt-8 w-full rounded-full py-3 text-sm font-semibold transition ${
                  t.highlight
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "border border-border bg-background text-foreground hover:bg-card"
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

/* ───────────────────── RESOURCES ───────────────────── */
function Resources() {
  return (
    <section id="resources" className="relative px-6 py-32 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          tag="// 03"
          title="resources"
          subtitle="Get fluent in the technical side of running your own website."
        />
        <div className="mt-16 grid md:grid-cols-2 gap-4">
          {[
            { cat: "guide", t: "What actually makes a B2B website convert", read: "8 min" },
            { cat: "glossary", t: "DNS, hosting, SSL — what each does", read: "6 min" },
            { cat: "playbook", t: "Writing copy that sounds human, not corporate", read: "5 min" },
            { cat: "guide", t: "SEO basics — ranking without an agency", read: "10 min" },
          ].map((r) => (
            <a
              key={r.t}
              href="#"
              className="group rounded-2xl border border-border bg-card/30 p-7 hover:bg-card/60 transition flex flex-col"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>// {r.cat}</span>
                <span>{r.read}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground leading-snug">{r.t}</h3>
              <div className="mt-6 inline-flex items-center gap-1 text-xs text-foreground">
                read article
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── FOOTER ───────────────────── */
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      id="contact"
      className="relative border-t border-border bg-background overflow-hidden"
    >
      {/* Top grid lines decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--color-foreground) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/2 h-40 w-[80%] -translate-x-1/2 bg-accent/10 blur-[120px]"
      />

      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-12">
        {/* CTA strip */}
        <div className="rounded-2xl border border-border bg-card/40 backdrop-blur p-8 sm:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-accent mb-3">
              // build with aatman
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tighter text-foreground">
              Ready to ship your business online?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              From intake to a deployed, branded website — in minutes, not months.
            </p>
          </div>
          <Link
            to="/questionnaire"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-accent/70 bg-foreground px-6 py-3 text-sm font-semibold text-background hover:bg-foreground/90 transition shadow-[0_0_36px_-10px_var(--color-accent)] shrink-0"
          >
            Start your build
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Main grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-12 gap-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card/60">
                <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_14px_var(--color-accent)]" />
              </span>
              <span className="text-base font-semibold tracking-tight text-foreground">
                aatman
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm text-muted-foreground leading-relaxed">
              The AI website engine for B2B operators. Structured intake, brand-grade output,
              production deploys — without the agency overhead.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1.5 text-[11px] text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              All systems operational
            </div>
          </div>

          {/* Product */}
          <FooterCol
            title="Product"
            links={[
              { l: "How it works", href: "#how" },
              { l: "Pricing", href: "#pricing" },
              { l: "Resources", href: "#resources" },
              { l: "Dashboard", href: "/dashboard" },
            ]}
          />
          {/* Company */}
          <FooterCol
            title="Company"
            links={[
              { l: "About", href: "#" },
              { l: "Customers", href: "#" },
              { l: "Changelog", href: "#" },
              { l: "Status", href: "#" },
            ]}
          />
          {/* Legal */}
          <FooterCol
            title="Legal"
            links={[
              { l: "Privacy", href: "#" },
              { l: "Terms", href: "#" },
              { l: "Security", href: "#" },
              { l: "DPA", href: "#" },
            ]}
          />
        </div>

        {/* Contact strip */}
        <div className="mt-16 grid sm:grid-cols-3 gap-4">
          <a
            href="mailto:aatmanxcares@gmail.com"
            className="group rounded-xl border border-border bg-card/30 px-5 py-4 hover:border-accent/40 transition"
          >
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              <Mail className="h-3 w-3 text-accent" /> Email
            </div>
            <div className="mt-1.5 text-sm text-foreground group-hover:text-accent transition">
              aatmanxcares@gmail.com
            </div>
          </a>
          <a
            href="tel:+919880291310"
            className="group rounded-xl border border-border bg-card/30 px-5 py-4 hover:border-accent/40 transition"
          >
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              <Phone className="h-3 w-3 text-accent" /> Phone / WhatsApp
            </div>
            <div className="mt-1.5 text-sm text-foreground group-hover:text-accent transition">
              +91 98802 91310
            </div>
          </a>
          <div className="rounded-xl border border-border bg-card/30 px-5 py-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              <MapPin className="h-3 w-3 text-accent" /> Office
            </div>
            <div className="mt-1.5 text-sm text-foreground">Bangalore, Karnataka</div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-border pt-8 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>© {year} aatman — websites for businesses, engineered.</span>
          </div>
          <div className="flex items-center gap-4 font-mono tabular-nums">
            <span>v1.0.0</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>built in bangalore</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="text-accent">● live</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { l: string; href: string }[];
}) {
  return (
    <div className="col-span-1 md:col-span-2">
      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {title}
      </div>
      <ul className="mt-5 space-y-3">
        {links.map((i) => (
          <li key={i.l}>
            <a
              href={i.href}
              className="text-sm text-foreground/80 hover:text-accent transition"
            >
              {i.l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────────────────── SHARED ───────────────────── */
function SectionHeader({ tag, title, subtitle }: { tag: string; title: string; subtitle: string }) {
  return (
    <div className="max-w-2xl">
      <span className="text-xs text-muted-foreground">{tag}</span>
      <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tighter text-foreground">{title}</h2>
      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
    </div>
  );
}
