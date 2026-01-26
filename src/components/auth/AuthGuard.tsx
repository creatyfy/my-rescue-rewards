import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

type AuthGuardProps = {
  children: ReactNode;
};

const AuthGuard = ({ children }: AuthGuardProps) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (isMounted) {
        setSession(data.session ?? null);
        setIsLoading(false);
      }
    };

    void loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (isMounted) {
          setSession(nextSession);
          setIsLoading(false);
        }
      },
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  const adminRestrictedPaths = [
    "/dashboard",
    "/scan",
    "/store",
    "/history",
    "/profile/notifications",
  ];
  const isAdmin = session.user?.role === "admin";
  const shouldRedirectAdmin =
    isAdmin &&
    !location.pathname.startsWith("/admin") &&
    adminRestrictedPaths.includes(location.pathname);

  if (shouldRedirectAdmin) {
    return <Navigate to="/admin/reports" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
