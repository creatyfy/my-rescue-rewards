import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  HelpCircle,
  History,
  Home,
  LogOut,
  Moon,
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { fetchAdminStatus } from "@/integrations/supabase/admin";
import { logoutCurrentUser } from "@/integrations/supabase/profile";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";

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
  { label: "Resgates", path: "/admin/redemptions" },
];

export function SidebarNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const isAdminPath = location.pathname.startsWith("/admin");
  const isDarkMode = theme === "dark";
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

  const handleLogout = async () => {
    try {
      await logoutCurrentUser();
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Erro ao sair da conta:", error);
    }
  };

  return (
    <SidebarContent>
      {/* A11y: a navegação principal recebe label e estrutura semântica para leitores de tela. */}
      <nav aria-label="Menu principal">
        <SidebarGroup className="pt-4">
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {navItems.map((item) => {
              if (
                isAdmin &&
                item.label !== "Início" &&
                item.label !== "Perfil"
              ) {
                return null;
              }
              const isActive = item.matchPrefix
                ? location.pathname.startsWith(item.path)
                : location.pathname === item.path;
              const Icon = item.icon;
              const label =
                isAdmin && item.label === "Início" ? "Visão Geral" : item.label;

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
            {isAdmin && (
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
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActive}
                          >
                            <Link to={item.path} aria-current={isActive ? "page" : undefined}>
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
        <SidebarGroup>
          <SidebarGroupLabel>Preferências</SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <div className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground">
                <span className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span>Modo escuro</span>
                </span>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                  aria-label="Alternar modo escuro"
                />
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Sair da conta">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Sair da conta</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </nav>
    </SidebarContent>
  );
}
