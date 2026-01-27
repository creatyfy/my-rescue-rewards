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
                    return (
                      <SidebarMenuSubItem key={item.path}>
                        <SidebarMenuSubButton asChild isActive={isActive}>
                          <Link
                            to={item.path}
                            aria-current={isActive ? "page" : undefined}
                          >
                            <span>{item.label}</span>
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
