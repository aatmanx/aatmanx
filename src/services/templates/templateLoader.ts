import type { RealEstateWebsiteProfile } from "@/lib/questionnaire/types";
import { hydrateSiteContent } from "@/lib/templates/hydrateSiteContent";
import type { TemplateManifest } from "./templateMetadata";
import { getTemplateById } from "./templateRegistry";

export type TemplateLoadResult = {
  manifest: TemplateManifest;
  pages: Record<string, string>;
  components: Record<string, string>;
  assets: Record<string, string>;
  sampleData: Record<string, unknown> | null;
  hasImportedCode: boolean;
  isConverted: boolean;
  contentSlots: string[];
};

const DEVELOPER_V1_PAGES = [
  "index",
  "about",
  "projects",
  "projects.$slug",
  "construction-updates",
  "site-visit",
  "contact",
];

const DEVELOPER_V1_COMPONENTS = [
  "Hero",
  "FeaturedProjects",
  "WhyChooseUs",
  "Amenities",
  "ConstructionProgress",
  "LocationAdvantages",
  "Testimonials",
  "SiteVisitCTA",
  "ContactSection",
  "Header",
  "Footer",
  "SiteShell",
  "PageHeader",
  "ProjectCard",
  "SiteVisitForm",
  "WhatsAppButton",
  "Section",
];

const DEVELOPER_V1_ASSETS = [
  "hero-building.jpg",
  "project-1.jpg",
  "project-2.jpg",
  "project-3.jpg",
  "interior-1.jpg",
  "construction.jpg",
  "styles.css",
];

const DEVELOPER_V1_SLOTS = [
  "hero",
  "about",
  "projects",
  "amenities",
  "gallery",
  "testimonials",
  "contact",
  "footer",
  "seo",
  "faq",
  "cta",
  "construction",
  "siteVisit",
];

function buildPageMap(rootPath: string, pageNames: string[]): Record<string, string> {
  return Object.fromEntries(pageNames.map((p) => [p, `${rootPath}/pages/${p}.tsx`]));
}

function buildComponentMap(rootPath: string, names: string[]): Record<string, string> {
  return Object.fromEntries(names.map((c) => [c, `${rootPath}/components/site/${c}.tsx`]));
}

function buildAssetMap(rootPath: string, names: string[]): Record<string, string> {
  return Object.fromEntries(names.map((a) => [a, `${rootPath}/assets/${a}`]));
}

/**
 * Loads a template from the registry with filesystem path references.
 */
export async function loadTemplate(templateId: string): Promise<TemplateLoadResult | null> {
  const manifest = getTemplateById(templateId);
  if (!manifest) return null;

  const isConverted = manifest.status === "converted" || manifest.status === "production";
  const rootPath = manifest.rootPath;

  if (manifest.id === "real-estate/developer-v1" && isConverted) {
    return {
      manifest,
      pages: buildPageMap(rootPath, DEVELOPER_V1_PAGES),
      components: buildComponentMap(rootPath, DEVELOPER_V1_COMPONENTS),
      assets: buildAssetMap(rootPath, DEVELOPER_V1_ASSETS),
      sampleData: null,
      hasImportedCode: true,
      isConverted: true,
      contentSlots: DEVELOPER_V1_SLOTS,
    };
  }

  return {
    manifest,
    pages: {},
    components: {},
    assets: {},
    sampleData: null,
    hasImportedCode: false,
    isConverted,
    contentSlots: [],
  };
}

export async function loadTemplateManifestFromPath(rootPath: string): Promise<TemplateManifest | null> {
  void rootPath;
  return null;
}

/**
 * Hydrates template metadata with questionnaire profile + AI-generated content.
 */
export async function hydrateTemplate(
  templateId: string,
  profile: Record<string, unknown>,
  generatedContent: Record<string, unknown>,
): Promise<(TemplateLoadResult & { siteContent?: ReturnType<typeof hydrateSiteContent> }) | null> {
  const loaded = await loadTemplate(templateId);
  if (!loaded) return null;

  const siteContent = hydrateSiteContent(
    profile as RealEstateWebsiteProfile,
    generatedContent,
  );

  return {
    ...loaded,
    siteContent,
    sampleData: {
      profile,
      aiContent: generatedContent,
      siteContent,
      hydratedAt: new Date().toISOString(),
    },
  };
}
