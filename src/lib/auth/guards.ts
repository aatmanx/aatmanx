import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

type AuthGuardOptions = {
  redirectTo?: string;
  requireVerified?: boolean;
};

export function useRequireAuth(options: AuthGuardOptions = {}) {
  const { redirectTo = "/login", requireVerified = false } = options;
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const applySession = (session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]) => {
      if (!mounted) return;

      if (!session) {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        navigate({ href: `${redirectTo}?next=${next}`, replace: true });
        return;
      }

      const verified = Boolean(session.user.email_confirmed_at);
      if (requireVerified && !verified) {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        navigate({ href: `/verify-email?next=${next}`, replace: true });
        return;
      }

      setUserId(session.user.id);
      setEmail(session.user.email ?? null);
      setEmailVerified(verified);
      setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        applySession(session);
      } else if (event === "SIGNED_OUT") {
        if (!mounted) return;
        navigate({ href: redirectTo, replace: true });
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session) {
        applySession(data.session);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate, redirectTo, requireVerified]);

  return { userId, email, emailVerified, loading };
}

export function getSafeNextPath(defaultPath = "/dashboard"): string {
  if (typeof window === "undefined") return defaultPath;
  const next = new URLSearchParams(window.location.search).get("next") || defaultPath;
  return next.startsWith("/") && !next.startsWith("//") ? next : defaultPath;
}

export async function isEmailVerified(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session?.user.email_confirmed_at);
}

export async function waitForAuthSession(timeoutMs = 5000): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  if (data.session) return true;

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      sub.subscription.unsubscribe();
      resolve(false);
    }, timeoutMs);

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        clearTimeout(timer);
        sub.subscription.unsubscribe();
        resolve(true);
      }
    });
  });
}
