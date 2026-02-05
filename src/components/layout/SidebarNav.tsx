import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { resolveAdminAccess } from "@/integrations/supabase/admin";
import { logoutCurrentUser } from "@/integrations/supabase/profile";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "./AdminSidebar";
import { SidebarSkeleton } from "./SidebarSkeleton";
import { UserSidebar } from "./UserSidebar";

export function SidebarNav() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const isDarkMode = theme === "dark";

  useEffect(() => {
    let mounted = true;

    const loadAdminStatus = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          if (mounted) {
            setIsAdmin(false);
          }
          return;
        }

        const status = await resolveAdminAccess().catch(() => false);
        if (mounted) {
          setIsAdmin(status);
        }
      } catch (error) {
        console.error("Erro ao carregar status de admin:", error);
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    loadAdminStatus();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutCurrentUser();
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Erro ao sair da conta:", error);
    }
  };

  if (authLoading) {
    return <SidebarSkeleton />;
  }

  return isAdmin ? (
    <AdminSidebar
      isDarkMode={isDarkMode}
      onThemeChange={(checked) => setTheme(checked ? "dark" : "light")}
      onLogout={handleLogout}
    />
  ) : (
    <UserSidebar
      isDarkMode={isDarkMode}
      onThemeChange={(checked) => setTheme(checked ? "dark" : "light")}
      onLogout={handleLogout}
    />
  );
}
