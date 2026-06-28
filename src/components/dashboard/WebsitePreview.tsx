import type { SiteContent } from "@/lib/templates/hydrateSiteContent";

type PreviewProps = {
  content: SiteContent;
  className?: string;
};

export function WebsitePreview({ content, className = "" }: PreviewProps) {
  const { hero, whyChooseUs, about, projects, testimonials, faqs, contact, seo } = content;

  return (
    <div className={`bg-[#faf9f7] text-[#1a1a1a] font-sans antialiased ${className}`}>
      <header className="border-b border-black/10 bg-white/90 px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase">{content.logoText}</span>
          <nav className="hidden gap-6 text-[11px] uppercase tracking-wider text-black/60 sm:flex">
            <span>Projects</span>
            <span>About</span>
            <span>Contact</span>
          </nav>
        </div>
      </header>

      <section className="relative min-h-[420px] overflow-hidden">
        <img src={hero.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />
        <div className="relative z-10 flex min-h-[420px] items-end px-6 pb-12 pt-24">
          <div className="max-w-xl text-white">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-amber-300/90">{hero.eyebrow}</p>
            <h1 className="mt-3 font-serif text-3xl leading-tight md:text-5xl">{hero.title}</h1>
            <p className="mt-4 text-sm text-white/80 md:text-base">{hero.subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex bg-amber-400 px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-black">
                {hero.primaryCta.label}
              </span>
              <span className="inline-flex border border-white/40 px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-white">
                {hero.secondaryCta.label}
              </span>
            </div>
          </div>
        </div>
      </section>

      {hero.stats?.length > 0 && (
        <section className="grid grid-cols-2 border-b border-black/10 bg-white md:grid-cols-4">
          {hero.stats.slice(0, 4).map((stat) => (
            <div key={stat.label} className="px-6 py-8 text-center md:text-left">
              <div className="font-serif text-2xl md:text-3xl">{stat.value}</div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-black/50">{stat.label}</div>
            </div>
          ))}
        </section>
      )}

      <section className="px-6 py-14">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-serif text-2xl md:text-3xl">{whyChooseUs.title}</h2>
          <p className="mt-3 text-sm text-black/60">{whyChooseUs.subtitle}</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {whyChooseUs.items.slice(0, 6).map((item) => (
              <div key={item.title} className="rounded-xl border border-black/8 bg-white p-5 text-left">
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-black/60">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white px-6 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-2xl">{about.title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-black/70">{about.intro}</p>
        </div>
      </section>

      {projects?.length > 0 && (
        <section className="px-6 py-14">
          <h2 className="text-center font-serif text-2xl">Featured Projects</h2>
          <div className="mx-auto mt-8 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 3).map((project) => (
              <article key={project.slug} className="overflow-hidden rounded-xl border border-black/8 bg-white">
                <img src={project.heroImage} alt={project.name} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <h3 className="text-sm font-semibold">{project.name}</h3>
                  <p className="mt-1 text-xs text-black/50">{project.location}</p>
                  <p className="mt-2 text-xs text-black/60 line-clamp-2">{project.overview}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {testimonials?.length > 0 && (
        <section className="border-t border-black/10 bg-[#f3f1ed] px-6 py-14">
          <h2 className="text-center font-serif text-2xl">Testimonials</h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <blockquote key={t.name} className="rounded-xl bg-white p-5 text-left">
                <p className="text-xs leading-relaxed text-black/70">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-4 text-[11px] font-medium">{t.name}</footer>
                <div className="text-[10px] text-black/50">{t.role}</div>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {faqs?.length > 0 && (
        <section className="px-6 py-14">
          <h2 className="text-center font-serif text-2xl">FAQs</h2>
          <div className="mx-auto mt-8 max-w-2xl space-y-3">
            {faqs.slice(0, 5).map((faq) => (
              <details key={faq.question} className="rounded-xl border border-black/8 bg-white px-4 py-3">
                <summary className="cursor-pointer text-sm font-medium">{faq.question}</summary>
                <p className="mt-2 text-xs leading-relaxed text-black/60">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-black/10 bg-[#111] px-6 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="text-xs font-semibold tracking-wider uppercase">{content.businessName}</div>
          <p className="mt-2 text-xs text-white/60">{seo?.description ?? content.tagline}</p>
          <div className="mt-6 grid gap-2 text-xs text-white/70 sm:grid-cols-3">
            <span>{contact.address}</span>
            <span>{contact.phone}</span>
            <span>{contact.email}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function WebsitePreviewPlaceholder({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[480px] flex-col items-center justify-center bg-[#111] px-8 text-center">
      <div className="mb-4 h-12 w-12 rounded-full border border-[#4DA3FF]/30 bg-[#4DA3FF]/10" />
      <p className="max-w-sm text-sm text-white/50">{message}</p>
    </div>
  );
}
