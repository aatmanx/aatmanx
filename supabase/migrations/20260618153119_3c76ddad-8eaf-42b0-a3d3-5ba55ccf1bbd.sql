CREATE TABLE public.questionnaire_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  session_id TEXT NOT NULL,
  question_index INTEGER NOT NULL CHECK (question_index >= 0),
  question_key TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, session_id, question_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.questionnaire_responses TO authenticated;
GRANT ALL ON public.questionnaire_responses TO service_role;

ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own questionnaire responses"
ON public.questionnaire_responses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Customers can create their own questionnaire responses"
ON public.questionnaire_responses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Customers can update their own questionnaire responses"
ON public.questionnaire_responses
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Customers can delete their own questionnaire responses"
ON public.questionnaire_responses
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_questionnaire_responses_updated_at
BEFORE UPDATE ON public.questionnaire_responses
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX questionnaire_responses_user_session_idx
ON public.questionnaire_responses (user_id, session_id, question_index);