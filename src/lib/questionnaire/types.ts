export type QuestionnaireStatus = "draft" | "in_progress" | "completed" | "processing" | "generated";

export type TemplateCategory = "agency" | "developer" | "luxury" | "commercial" | "management";

export type FileAsset = {
  id: string;
  category: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  storage_path?: string;
  local_key?: string;
  preview?: string;
};

export type TeamMember = {
  id: string;
  photo?: FileAsset | null;
  name: string;
  designation: string;
  phone: string;
  email: string;
};

export type QuestionnaireAnswers = Record<string, unknown>;

export type QuestionnaireState = {
  version: 2;
  sessionId: string;
  questionnaireId?: string;
  industry: "real-estate";
  stepIndex: number;
  answers: QuestionnaireAnswers;
  status: QuestionnaireStatus;
  templateCategory?: TemplateCategory;
  updatedAt: string;
};

export type QuestionType =
  | "text"
  | "textarea"
  | "single-select"
  | "multi-select"
  | "file-upload"
  | "repeatable";

export type ShowWhenCondition = {
  questionKey: string;
  equals?: string;
  includes?: string;
};

export type RepeatableFieldConfig = {
  key: string;
  label: string;
  type: "text" | "file";
  placeholder?: string;
  required?: boolean;
};

export type QuestionConfig = {
  key: string;
  section: string;
  sectionTitle: string;
  title: string;
  subtitle?: string;
  placeholder?: string;
  example?: string;
  type: QuestionType;
  options?: string[];
  uploadCategories?: string[];
  repeatableFields?: RepeatableFieldConfig[];
  required?: boolean;
  showWhen?: ShowWhenCondition;
  defaultValue?: unknown;
};

export type RealEstateWebsiteProfile = {
  industry: "real-estate";
  template_category: TemplateCategory;
  businessType: string;
  businessName: string;
  hasLogo: string;
  logo?: FileAsset[];
  primaryLocation: string;
  services: string[];
  websiteGoal: string;
  propertyDataMethod: string;
  propertyCount: string;
  propertyTypes: string[];
  sellRent: string;
  contactMethods: string[];
  bookSiteVisits: boolean;
  siteVisitAvailability?: string;
  showcaseTeam: string;
  teamMembers?: TeamMember[];
  trustCredentials: string[];
  completedTransactions: string;
  testimonials: string;
  features: string[];
  branding: {
    websiteStyle: string;
    colorStyle: string;
  };
  content: {
    businessDescription: string;
    differentiator: string;
  };
  media: Record<string, FileAsset[]>;
  automation: string[];
  properties: unknown[];
  contact: {
    methods: string[];
    bookSiteVisits: boolean;
    siteVisitAvailability?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  metadata: {
    sessionId: string;
    questionnaireId?: string;
    completedAt: string;
    status: QuestionnaireStatus;
  };
};
