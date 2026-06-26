
DROP TABLE IF EXISTS public.questionnaire_responses CASCADE;
ALTER TABLE public.websites DROP CONSTRAINT IF EXISTS websites_submission_id_fkey;
ALTER TABLE public.websites DROP COLUMN IF EXISTS submission_id;
DROP TABLE IF EXISTS public.questionnaire_submissions CASCADE;

DO $$ BEGIN
  CREATE TYPE public.questionnaire_status AS ENUM ('draft','in_progress','completed','processing','generated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.questionnaires (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL UNIQUE,
  industry TEXT NOT NULL DEFAULT 'real-estate',
  status public.questionnaire_status NOT NULL DEFAULT 'draft',
  template_category TEXT,
  current_step_index INTEGER NOT NULL DEFAULT 0,
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  answers_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_json JSONB,
  template_selection JSONB,
  ai_generation_status JSONB NOT NULL DEFAULT '{"homepage_content":"pending","about_page":"pending","property_descriptions":"pending","seo_metadata":"pending","faqs":"pending","blog_content":"pending"}'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX questionnaires_user_id_idx ON public.questionnaires (user_id);
CREATE INDEX questionnaires_session_id_idx ON public.questionnaires (session_id);
CREATE INDEX questionnaires_status_idx ON public.questionnaires (status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questionnaires TO authenticated;
GRANT ALL ON public.questionnaires TO service_role;
ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own questionnaires" ON public.questionnaires FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own questionnaires" ON public.questionnaires FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own questionnaires" ON public.questionnaires FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own questionnaires" ON public.questionnaires FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.questionnaire_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  questionnaire_id UUID NOT NULL REFERENCES public.questionnaires(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  question_index INTEGER NOT NULL DEFAULT 0,
  section_key TEXT,
  answer_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (questionnaire_id, question_key)
);
CREATE INDEX questionnaire_answers_questionnaire_id_idx ON public.questionnaire_answers (questionnaire_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questionnaire_answers TO authenticated;
GRANT ALL ON public.questionnaire_answers TO service_role;
ALTER TABLE public.questionnaire_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own questionnaire answers" ON public.questionnaire_answers FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.questionnaires q WHERE q.id = questionnaire_id AND q.user_id = auth.uid()));
CREATE POLICY "Users can manage own questionnaire answers" ON public.questionnaire_answers FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.questionnaires q WHERE q.id = questionnaire_id AND q.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.questionnaires q WHERE q.id = questionnaire_id AND q.user_id = auth.uid()));

CREATE TABLE public.questionnaire_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  questionnaire_id UUID NOT NULL REFERENCES public.questionnaires(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  file_category TEXT,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX questionnaire_files_questionnaire_id_idx ON public.questionnaire_files (questionnaire_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questionnaire_files TO authenticated;
GRANT ALL ON public.questionnaire_files TO service_role;
ALTER TABLE public.questionnaire_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own questionnaire files" ON public.questionnaire_files FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.questionnaires q WHERE q.id = questionnaire_id AND q.user_id = auth.uid()));
CREATE POLICY "Users can manage own questionnaire files" ON public.questionnaire_files FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.questionnaires q WHERE q.id = questionnaire_id AND q.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.questionnaires q WHERE q.id = questionnaire_id AND q.user_id = auth.uid()));

ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS questionnaire_id UUID REFERENCES public.questionnaires(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS websites_questionnaire_id_idx ON public.websites (questionnaire_id);

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_questionnaires_updated_at BEFORE UPDATE ON public.questionnaires FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_questionnaire_answers_updated_at BEFORE UPDATE ON public.questionnaire_answers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
