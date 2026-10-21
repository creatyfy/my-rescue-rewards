import { Link, useLocation } from "react-router-dom";
import { Package, User } from "lucide-react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { SidebarPreferences } from "./SidebarPreferences";

const motoboyItems = [
  { icon: Package, label: "Minhas Entregas", path: "/entregas" },
  { icon: User, label: "Perfil", path: "/profile", matchPrefix: true },
];

interface MotoboySidebarProps {
  isDarkMode: boolean;
  onThemeChange: (checked: boolean) => void;
  onLogout: () => void;
}

export function MotoboySidebar({ isDarkMode, onThemeChange, onLogout }: MotoboySidebarProps) {
  const location = useLocation();

  return (
    <SidebarContent>
      <nav aria-label="Menu principal">
        <SidebarGroup className="pt-4">
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {motoboyItems.map((item) => {
              const isActive = item.matchPrefix
                ? location.pathname.startsWith(item.path)
                : location.pathname === item.path;
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                    <Link
                      to={item.path}
                      aria-current={isActive ? "page" : undefined}
                      className={cn("flex items-center gap-2")}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
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
