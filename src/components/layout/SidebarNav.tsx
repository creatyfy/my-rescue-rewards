import { Link, useLocation } from "react-router-dom";
import {
  HelpCircle,
  History,
  Home,
  QrCode,
  Settings,
  ShoppingBag,
  User,
} from "lucide-react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Início", path: "/dashboard" },
  { icon: QrCode, label: "Escanear", path: "/scan" },
  { icon: ShoppingBag, label: "Loja", path: "/store" },
  { icon: History, label: "Histórico", path: "/history" },
  { icon: User, label: "Perfil", path: "/profile", matchPrefix: true },
  { icon: HelpCircle, label: "Ajuda", path: "/help" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

export function SidebarNav() {
  const location = useLocation();

  return (
    <SidebarContent>
      <SidebarGroup className="pt-4">
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
        <SidebarMenu className="gap-1">
          {navItems.map((item) => {
            const isActive = item.matchPrefix
              ? location.pathname.startsWith(item.path)
              : location.pathname === item.path;
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                >
                  <Link
                    to={item.path}
                    className={cn("flex items-center gap-2")}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
}
