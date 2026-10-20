import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ShieldCheck } from "lucide-react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { adminNavItems, navItems } from "./sidebarMenuConfig";
import { SidebarPreferences } from "./SidebarPreferences";
import { useEffect, useMemo, useState } from "react";
import {
  AdminPendingCounts,
  fetchAdminPendingCounts,
} from "@/integrations/supabase/admin";

// Mapeia cada item do menu admin ao contador de pendências correspondente.
const COUNT_KEY_BY_PATH: Record<string, keyof AdminPendingCounts> = {
  "/admin/receipts": "receipts",
  "/admin/redemptions": "redemptions",
  "/admin/orders": "orders",
};

interface AdminSidebarProps {
  isDarkMode: boolean;
  onThemeChange: (checked: boolean) => void;
  onLogout: () => void;
}

export function AdminSidebar({
  isDarkMode,
  onThemeChange,
  onLogout,
}: AdminSidebarProps) {
  const location = useLocation();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const isAdminPath = location.pathname.startsWith("/admin");
  const adminSection = useMemo(() => {
    const section = location.pathname.split("/")[2];
    return adminNavItems.some((item) => item.path.endsWith(`/${section}`))
      ? section
      : "receipts";
  }, [location.pathname]);

  useEffect(() => {
    if (isAdminPath) {
      setAdminMenuOpen(true);
    }
  }, [isAdminPath]);

  // Contadores de pendências (comprovantes / resgates / pedidos) para os badges.
  const [pendingCounts, setPendingCounts] = useState<AdminPendingCounts>({
    receipts: 0,
    redemptions: 0,
    orders: 0,
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const counts = await fetchAdminPendingCounts();
        if (active) setPendingCounts(counts);
      } catch {
        // silencioso: badge é só um indicador, não bloqueia o menu
      }
    };
    load();
    // atualiza ao navegar entre seções do admin
    return () => {
      active = false;
    };
  }, [location.pathname]);

  const adminBaseItems = navItems.filter(
    (item) => item.label === "Início" || item.label === "Perfil",
  );

  return (
    <SidebarContent>
      <nav aria-label="Menu principal">
        <SidebarGroup className="pt-4">
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {adminBaseItems.map((item) => {
              const isActive = item.matchPrefix
                ? location.pathname.startsWith(item.path)
                : location.pathname === item.path;
              const Icon = item.icon;
              const label = item.label === "Início" ? "Visão Geral" : item.label;

              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={label}
                  >
                    <Link
                      to={item.path}
                      aria-current={isActive ? "page" : undefined}
                      className={cn("flex items-center gap-2")}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setAdminMenuOpen((open) => !open)}
                isActive={isAdminPath}
                tooltip="Painel Administrativo"
                aria-expanded={adminMenuOpen}
                aria-controls="admin-menu"
                aria-haspopup="true"
              >
                <span className="flex flex-1 items-center gap-2">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  <span>Painel Administrativo</span>
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    adminMenuOpen ? "rotate-180" : "rotate-0",
                  )}
                  aria-hidden="true"
                />
              </SidebarMenuButton>
              {adminMenuOpen && (
                <SidebarMenuSub id="admin-menu">
                  {adminNavItems.map((item) => {
                    const itemSection = item.path.split("/")[2];
                    const isActive = isAdminPath && adminSection === itemSection;
                    const countKey = COUNT_KEY_BY_PATH[item.path];
                    const count = countKey ? pendingCounts[countKey] : 0;
                    return (
                      <SidebarMenuSubItem key={item.path}>
                        <SidebarMenuSubButton asChild isActive={isActive}>
                          <Link
                            to={item.path}
                            aria-current={isActive ? "page" : undefined}
                            className="flex items-center justify-between gap-2"
                          >
                            <span>{item.label}</span>
                            {count > 0 && (
                              <span
                                className="ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-[0.65rem] font-semibold leading-none text-destructive-foreground"
                                aria-label={`${count} pendente(s)`}
                              >
                                {count > 99 ? "99+" : count}
                              </span>
                            )}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarPreferences
          isDarkMode={isDarkMode}
          onThemeChange={onThemeChange}
          onLogout={onLogout}
        />
      </nav>
    </SidebarContent>
  );
}
