
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  business_name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  domain_preference TEXT,
  social_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT ALL ON public.businesses TO service_role;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners_manage_businesses" ON public.businesses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_businesses_updated BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.questionnaire_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  business_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  answers_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'saved',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questionnaire_submissions TO authenticated;
GRANT ALL ON public.questionnaire_submissions TO service_role;
ALTER TABLE public.questionnaire_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners_manage_submissions" ON public.questionnaire_submissions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_submissions_updated BEFORE UPDATE ON public.questionnaire_submissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES public.questionnaire_submissions(id) ON DELETE SET NULL,
  slug TEXT,
  website_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'generating',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.websites TO authenticated;
GRANT ALL ON public.websites TO service_role;
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners_manage_websites" ON public.websites FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_websites_updated BEFORE UPDATE ON public.websites FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
