"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------- Pixel canvas -------------- */
type Pixel = {
  x: number;
  y: number;
  color: string;
  ctx: CanvasRenderingContext2D;
  speed: number;
  size: number;
  sizeStep: number;
  minSize: number;
  maxSizeInt: number;
  maxSize: number;
  delay: number;
  counter: number;
  counterStep: number;
  isIdle: boolean;
  isReverse: boolean;
  isShimmer: boolean;
  draw: () => void;
  appear: () => void;
  disappear: () => void;
  shimmer: () => void;
};

function createPixel(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  color: string,
  baseSpeed: number,
  delay: number,
): Pixel {
  const rand = (min: number, max: number) => Math.random() * (max - min) + min;
  const p: Pixel = {
    x, y, color, ctx,
    speed: rand(0.08, 0.4) * baseSpeed,
    size: 0,
    sizeStep: rand(0.12, 0.28),
    minSize: 0.5,
    maxSizeInt: 2,
    maxSize: rand(0.5, 2),
    delay,
    counter: 0,
    counterStep: rand(1.8, 3.2) + (canvas.width + canvas.height) * 0.008,
    isIdle: false,
    isReverse: false,
    isShimmer: false,
    draw() {
      const offset = p.maxSizeInt * 0.5 - p.size * 0.5;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x + offset, p.y + offset, p.size, p.size);
    },
    appear() {
      p.isIdle = false;
      if (p.counter <= p.delay) { p.counter += p.counterStep; return; }
      if (p.size >= p.maxSize) p.isShimmer = true;
      if (p.isShimmer) p.shimmer(); else p.size += p.sizeStep;
      p.draw();
    },
    disappear() {
      p.isShimmer = false; p.counter = 0;
      if (p.size <= 0) { p.isIdle = true; return; }
      p.size -= 0.1; p.draw();
    },
    shimmer() {
      if (p.size >= p.maxSize) p.isReverse = true;
      else if (p.size <= p.minSize) p.isReverse = false;
      if (p.isReverse) p.size -= p.speed; else p.size += p.speed;
    },
  };
  return p;
}

function PixelCanvas({ colors, gap = 6, speed = 35 }: { colors: string[]; gap?: number; speed?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef(0);
  const lastFrameRef = useRef(typeof performance !== "undefined" ? performance.now() : 0);
  const reducedMotionRef = useRef(false);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || colors.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = wrap.getBoundingClientRect();
    const w = Math.floor(width); const h = Math.floor(height);
    canvas.width = w; canvas.height = h;
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    const effectiveSpeed = reducedMotionRef.current ? 0 : Math.min(speed, 100) * 0.001;
    const pixels: Pixel[] = [];
    for (let x = 0; x < w; x += gap) {
      for (let y = 0; y < h; y += gap) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const dx = x - w / 2; const dy = y - h / 2;
        const delay = reducedMotionRef.current ? 0 : Math.sqrt(dx * dx + dy * dy) * 0.65;
        pixels.push(createPixel(ctx, canvas, x, y, color, effectiveSpeed, delay));
      }
    }
    pixelsRef.current = pixels;
  }, [colors, gap, speed]);

  const animate = useCallback((mode: "appear" | "disappear") => {
    cancelAnimationFrame(animationRef.current);
    const frameInterval = 1000 / 60;
    const loop = () => {
      animationRef.current = requestAnimationFrame(loop);
      const now = performance.now();
      const elapsed = now - lastFrameRef.current;
      if (elapsed < frameInterval) return;
      lastFrameRef.current = now - (elapsed % frameInterval);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pixels = pixelsRef.current;
      for (const pixel of pixels) pixel[mode]();
      if (pixels.every((p) => p.isIdle)) cancelAnimationFrame(animationRef.current);
    };
    animationRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    init();
    const ro = new ResizeObserver(() => init());
    if (wrapRef.current) ro.observe(wrapRef.current);
    animate("appear");
    return () => { ro.disconnect(); cancelAnimationFrame(animationRef.current); };
  }, [init, animate]);

  return (
    <div ref={wrapRef} className="absolute inset-0 h-full w-full">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

/* -------------- Hero -------------- */
interface PixelHeroProps {
  eyebrow?: string;
  word1?: string;
  word2?: string;
  description?: string;
  primaryCta?: string;
  secondaryCta?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  clients?: string[];
}

export function PixelHero({
  eyebrow = "// for businesses, not hobbyists",
  word1 = "websites",
  word2 = "engineered.",
  description = "aatman generates production-grade websites for businesses from a structured intake. SEO, performance and conversion — wired up by default.",
  primaryCta = "start a build",
  secondaryCta = "see how it works",
  onPrimaryClick,
  onSecondaryClick,
  clients = ["NORTHWIND", "ACME LABS", "MERIDIAN", "ATLAS CO.", "FOUNDRY", "HELIOS", "QUANTA", "VOLTAGE"],
}: PixelHeroProps) {
  const [themeColors, setThemeColors] = useState<string[]>([]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const div = document.createElement("div");
    document.body.appendChild(div);
    div.className = "text-muted-foreground";
    const muted = getComputedStyle(div).color;
    div.className = "text-foreground";
    const fg = getComputedStyle(div).color;
    document.body.removeChild(div);
    setThemeColors([muted, muted, muted, "oklch(0.55 0.24 279)", fg]);
  }, []);

  const marquee = [...clients, ...clients];

  return (
    <section id="home" className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center px-6 pt-28 pb-16">
      <style>{`
        @keyframes aatmanMarquee { 0% { transform: translateX(0%);} 100% { transform: translateX(-50%);} }
        .aatman-marquee { animation: aatmanMarquee 35s linear infinite; }
        @keyframes aatmanShimmer { 0% { background-position: 200% center;} 100% { background-position: 0% center;} }
        .aatman-glass-text {
          color: transparent;
          background: linear-gradient(135deg, oklch(0.98 0 0) 0%, oklch(0.6 0 0) 25%, oklch(0.4 0 0) 45%, oklch(0.98 0 0) 55%, oklch(0.5 0 0) 75%, oklch(0.98 0 0) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-stroke: 1px color-mix(in oklab, var(--foreground) 25%, transparent);
          filter: drop-shadow(0 15px 35px rgba(0,0,0,0.5));
          animation: aatmanShimmer 9s linear infinite;
        }
      `}</style>

      {/* Pixel canvas background */}
      <div className="absolute inset-0 pointer-events-none">
        {themeColors.length > 0 && <PixelCanvas colors={themeColors} gap={7} speed={28} />}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--background)_80%)]" />
      </div>

      {/* Eyebrow */}
      <div className="relative z-10 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-4 py-1.5 text-[11px] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_18px_var(--color-accent)]" />
        {eyebrow}
      </div>

      {/* Headline */}
      <h1 className="relative z-10 mt-8 text-center text-6xl sm:text-7xl md:text-8xl lg:text-[9rem] font-bold tracking-tighter leading-[0.9]">
        <span className="aatman-glass-text block">{word1}</span>
        <span className="aatman-glass-text block">{word2}</span>
      </h1>

      {/* Description */}
      <p className="relative z-10 mt-8 max-w-xl text-center text-sm sm:text-base text-muted-foreground leading-relaxed">
        {description}
      </p>

      {/* CTAs */}
      <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onPrimaryClick}
          className={cn(
            "group inline-flex items-center gap-2 rounded-md border border-accent/70 bg-foreground text-background px-6 py-3 text-sm font-semibold",
            "hover:bg-foreground/90 transition shadow-[0_0_40px_-16px_var(--color-accent)]",
          )}
        >
          $ {primaryCta}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </button>
        <button
          onClick={onSecondaryClick}
          className="inline-flex items-center gap-2 rounded-md border border-accent/40 bg-card/40 backdrop-blur px-6 py-3 text-sm font-semibold text-foreground hover:bg-card transition"
        >
          <Terminal className="h-4 w-4" />
          {secondaryCta}
        </button>
      </div>

      {/* Trust marquee */}
      <div className="relative z-10 mt-16 w-full max-w-5xl">
        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70 mb-5">
          trusted by operators at
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="flex w-max aatman-marquee gap-12">
            {marquee.map((c, i) => (
              <span key={i} className="text-xs tracking-[0.25em] text-muted-foreground/80 whitespace-nowrap">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
