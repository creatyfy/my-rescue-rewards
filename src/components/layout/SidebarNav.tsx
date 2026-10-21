import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { resolveUserRole, type AppUserRole } from "@/integrations/supabase/admin";
import { logoutCurrentUser } from "@/integrations/supabase/profile";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "./AdminSidebar";
import { MotoboySidebar } from "./MotoboySidebar";
import { SidebarSkeleton } from "./SidebarSkeleton";
import { UserSidebar } from "./UserSidebar";

export function SidebarNav() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [role, setRole] = useState<AppUserRole>("user");
  const [authLoading, setAuthLoading] = useState(true);
  const isDarkMode = theme === "dark";

  useEffect(() => {
    let mounted = true;

    const loadRole = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          if (mounted) setRole("user");
          return;
        }

        const resolved = await resolveUserRole().catch<AppUserRole>(() => "user");
        if (mounted) setRole(resolved);
      } catch (error) {
        console.error("Erro ao carregar papel do usuário:", error);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    loadRole();
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

  const onThemeChange = (checked: boolean) => setTheme(checked ? "dark" : "light");

  if (role === "admin") {
    return (
      <AdminSidebar isDarkMode={isDarkMode} onThemeChange={onThemeChange} onLogout={handleLogout} />
    );
  }

  if (role === "motoboy") {
    return (
      <MotoboySidebar
        isDarkMode={isDarkMode}
        onThemeChange={onThemeChange}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <UserSidebar isDarkMode={isDarkMode} onThemeChange={onThemeChange} onLogout={handleLogout} />
  );
}
