import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import {
  User,
  Mail,
  Phone,
  ChevronRight,
  Settings,
  HelpCircle,
  LogOut,
  Shield,
  Bell,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchCurrentUserProfile, logoutCurrentUser } from "@/integrations/supabase/profile";
import { fetchAdminStatus } from "@/integrations/supabase/admin";

export default function Profile() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  // Mock user data
  const [user, setUser] = useState({
    name: "Maria Silva",
    email: "maria.silva@email.com",
    phone: "(11) 99999-9999",
    memberSince: "Janeiro 2024",
    avatarUrl: null,
  });

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const [profile, adminStatus] = await Promise.all([
          fetchCurrentUserProfile(),
          fetchAdminStatus().catch(() => false),
        ]);

        if (!profile || !isMounted) {
          return;
        }

        const memberSince = formatMemberSince(profile.createdAt);

        setIsAdmin(adminStatus);
        setUser((prev) => ({
          ...prev,
          name: profile.fullName || prev.name,
          email: profile.email || prev.email,
          phone: profile.phone || prev.phone,
          memberSince: memberSince ?? prev.memberSince,
          avatarUrl: profile.avatarUrl ?? prev.avatarUrl,
        }));
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        toast.error("Não foi possível carregar seu perfil.");
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const menuItems = [
    {
      icon: User,
      label: "Dados pessoais",
      path: "/profile/edit",
    },
    {
      icon: Bell,
      label: "Notificações",
      path: "/profile/notifications",
    },
    {
      icon: Shield,
      label: "Segurança",
      path: "/profile/security",
    },
    {
      icon: CreditCard,
      label: "Métodos de pagamento",
      path: "/profile/payments",
    },
    ...(isAdmin
      ? [
          {
            icon: ShieldCheck,
            label: "Painel administrativo",
            path: "/admin",
          },
        ]
      : []),
    {
      icon: HelpCircle,
      label: "Ajuda e suporte",
      path: "/help",
    },
    {
      icon: Settings,
      label: "Configurações",
      path: "/settings",
    },
  ];

  const handleLogout = async () => {
    try {
      await logoutCurrentUser();
      navigate("/auth");
    } catch (error) {
      console.error("Erro ao sair:", error);
      toast.error("Não foi possível sair da conta.");
    }
  };

  return (
    <AppLayout title="Perfil" showBack>
      <div className="container px-4 py-6">
        {/* User Info Card */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-xl">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="flex-1">
              <h2 className="font-display font-bold text-lg text-foreground">
                {user.name}
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Membro desde {user.memberSince}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
            <p className="font-display font-bold text-xl text-foreground">1.250</p>
            <p className="text-xs text-muted-foreground">Pontos</p>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
            <p className="font-display font-bold text-xl text-foreground">15</p>
            <p className="text-xs text-muted-foreground">Compras</p>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
            <p className="font-display font-bold text-xl text-foreground">3</p>
            <p className="text-xs text-muted-foreground">Resgates</p>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden mb-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors ${
                  index !== menuItems.length - 1 ? "border-b border-border/50" : ""
                }`}
              >
                <div className="p-2 rounded-lg bg-accent">
                  <Icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <span className="flex-1 font-medium text-sm text-foreground">
                  {item.label}
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair da conta
        </Button>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Meu Resgate v1.0.0
        </p>
      </div>
    </AppLayout>
  );
}

const formatMemberSince = (dateString: string) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const formatted = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);

  const normalized = formatted.replace(" de ", " ");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};
