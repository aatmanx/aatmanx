import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/lib/auth/guards";
import { getDashboardData, shouldPollDashboard } from "@/lib/dashboard/queries";
import { prepareAuthenticatedSession } from "@/lib/questionnaire/auth-sync";
import { DashboardWorkspace } from "@/components/dashboard/DashboardWorkspace";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — aatman" },
      { name: "description", content: "Manage your real estate website project in the aatman dashboard." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userId, email, loading: authLoading } = useRequireAuth({ redirectTo: "/login" });

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", userId],
    queryFn: async () => {
      await prepareAuthenticatedSession(userId!);
      return getDashboardData(userId!);
    },
    enabled: Boolean(userId),
    refetchInterval: (query) => (shouldPollDashboard(query.state.data) ? 3000 : false),
    staleTime: 0,
  });

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  };

  if (authLoading || isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090909]">
        <Loader2 className="h-5 w-5 animate-spin text-[#4DA3FF]" />
      </div>
    );
  }

  return <DashboardWorkspace email={email} data={data} onSignOut={handleSignOut} />;
}
