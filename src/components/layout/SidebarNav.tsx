import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  HelpCircle,
  History,
  Home,
  QrCode,
  Settings,
  ShieldCheck,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { fetchAdminStatus } from "@/integrations/supabase/admin";

const navItems = [
  { icon: Home, label: "Início", path: "/dashboard" },
  { icon: QrCode, label: "Escanear", path: "/scan" },
  { icon: ShoppingBag, label: "Loja", path: "/store" },
  { icon: History, label: "Histórico", path: "/history" },
  { icon: User, label: "Perfil", path: "/profile", matchPrefix: true },
  { icon: HelpCircle, label: "Ajuda", path: "/help" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

const adminNavItems = [
  { label: "Comprovantes", path: "/admin/receipts" },
  { label: "Estabelecimentos", path: "/admin/establishments" },
  { label: "Produtos", path: "/admin/products" },
  { label: "Usuários", path: "/admin/users" },
  { label: "Relatórios", path: "/admin/reports" },
];

export function SidebarNav() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const isAdminPath = location.pathname.startsWith("/admin");
  const adminSection = useMemo(() => {
    const section = location.pathname.split("/")[2];
    return adminNavItems.some((item) => item.path.endsWith(`/${section}`))
      ? section
      : "receipts";
  }, [location.pathname]);

  useEffect(() => {
    let mounted = true;

    const loadAdminStatus = async () => {
      try {
        const status = await fetchAdminStatus().catch(() => false);
        if (mounted) {
          setIsAdmin(status);
        }
      } catch (error) {
        console.error("Erro ao carregar status de admin:", error);
      }
    };

    loadAdminStatus();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (isAdminPath) {
      setAdminMenuOpen(true);
    }
  }, [isAdminPath]);

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
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setAdminMenuOpen((open) => !open)}
                isActive={isAdminPath}
                tooltip="Painel Administrativo"
                aria-expanded={adminMenuOpen}
              >
                <span className="flex flex-1 items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Painel Administrativo</span>
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    adminMenuOpen ? "rotate-180" : "rotate-0",
                  )}
                />
              </SidebarMenuButton>
              {adminMenuOpen && (
                <SidebarMenuSub>
                  {adminNavItems.map((item) => {
                    const itemSection = item.path.split("/")[2];
                    return (
                      <SidebarMenuSubItem key={item.path}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isAdminPath && adminSection === itemSection}
                        >
                          <Link to={item.path}>
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
}
