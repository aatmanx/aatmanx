import type { RealEstateWebsiteProfile } from "./types";

/** Normalizes questionnaire profile fields for AI prompts and template hydration. */
export function toPromptProfile(profile: RealEstateWebsiteProfile) {
  return {
    ...profile,
    description: profile.content?.businessDescription ?? "",
    location: {
      primary: profile.primaryLocation,
      city: profile.primaryLocation,
    },
    contact: {
      phone: profile.contact?.phone,
      email: profile.contact?.email,
      address: profile.contact?.address ?? profile.primaryLocation,
      whatsapp: profile.contact?.phone,
    },
    propertyInfo: {
      types: profile.propertyTypes,
      count: profile.propertyCount,
      sellRent: profile.sellRent,
    },
  };
}

export function profileFromAnswers(
  profile: RealEstateWebsiteProfile,
  answers?: Record<string, unknown>,
): RealEstateWebsiteProfile & { contactPhone?: string; contactEmail?: string } {
  const enriched = { ...profile } as RealEstateWebsiteProfile & {
    contactPhone?: string;
    contactEmail?: string;
  };
  if (answers) {
    enriched.contactPhone =
      typeof answers.contact_phone === "string" ? answers.contact_phone : enriched.contactPhone;
    enriched.contactEmail =
      typeof answers.contact_email === "string" ? answers.contact_email : enriched.contactEmail;
  }
  return enriched;
}

export function isQuestionnaireFinished(status: string | null | undefined): boolean {
  return status === "completed" || status === "processing" || status === "generated";
}
