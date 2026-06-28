import { supabase } from "@/integrations/supabase/client";
import { getLatestQuestionnaireForUser } from "@/lib/questionnaire/persistence";
import { isQuestionnaireFinished } from "@/lib/questionnaire/profile-adapter";

export type DashboardData = {
  questionnaire: Awaited<ReturnType<typeof getLatestQuestionnaireForUser>>;
  website: Awaited<ReturnType<typeof getPrimaryWebsite>> | null;
  business: { business_name?: string; category?: string; description?: string; address?: string } | null;
};

export async function getPrimaryWebsite(userId: string) {
  const { data, error } = await supabase
    .from("websites")
    .select("*, businesses(business_name, category, description, address)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const questionnaire = await getLatestQuestionnaireForUser(userId);
  const website = await getPrimaryWebsite(userId);
  const business = website?.businesses as DashboardData["business"];

  return { questionnaire, website, business };
}

export function isDashboardQuestionnaireComplete(data: DashboardData): boolean {
  return isQuestionnaireFinished(data.questionnaire?.status ?? null);
}

export function shouldPollDashboard(data: DashboardData | undefined): boolean {
  if (!data) return false;
  const websiteStatus = data.website?.status;
  const questionnaireStatus = data.questionnaire?.status;
  if (websiteStatus === "generating") return true;
  if (questionnaireStatus === "processing") return true;
  if (questionnaireStatus === "completed" && websiteStatus === "draft") return true;
  return false;
}
