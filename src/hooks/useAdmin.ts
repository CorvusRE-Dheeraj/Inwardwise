import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchAdminContext, type AdminContext } from "@/lib/admin-db";
import type { PermissionKey } from "@/lib/admin-portal";

export function useAdminSession() {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setUserId(data.session?.user.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { userId, loading: userId === undefined };
}

export function useAdmin() {
  const { userId, loading: sessionLoading } = useAdminSession();

  const ctxQuery = useQuery<AdminContext>({
    queryKey: ["admin-portal", "context", userId],
    queryFn: fetchAdminContext,
    enabled: !!userId,
    staleTime: 60_000,
  });

  const context = ctxQuery.data ?? null;

  const can = useCallback(
    (permission?: PermissionKey | string) => {
      if (!context) return false;
      if (context.is_super_admin) return true;
      if (!permission) return true;
      return context.permissions?.includes(permission) ?? false;
    },
    [context],
  );

  return {
    userId,
    context,
    can,
    isStaff: !!context,
    loading: sessionLoading || (!!userId && ctxQuery.isLoading),
    refetch: ctxQuery.refetch,
  };
}
