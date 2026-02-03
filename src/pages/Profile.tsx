import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import {
  User,
  Mail,
  ChevronRight,
  HelpCircle,
  LogOut,
  Shield,
  FileText,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  deleteCurrentUserData,
  fetchCurrentUserProfile,
  logoutCurrentUser,
} from "@/integrations/supabase/profile";
import {
  fetchCurrentUserBalance,
  fetchCurrentUserId,
  fetchReceiptHistory,
  fetchRedemptionHistory,
} from "@/integrations/supabase/store";
import { fetchAdminStatus } from "@/integrations/supabase/admin";

export default function Profile() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    phone: string | null;
    memberSince: string | null;
    avatarUrl: string | null;
  } | null>(null);
  const [stats, setStats] = useState({
    points: 0,
    receipts: 0,
    redemptions: 0,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const userId = await fetchCurrentUserId();

        const [profile, adminStatus, balance, receipts, redemptions] = await Promise.all([
          fetchCurrentUserProfile(),
          fetchAdminStatus().catch(() => false),
          fetchCurrentUserBalance(),
          userId ? fetchReceiptHistory(userId) : Promise.resolve([]),
          userId ? fetchRedemptionHistory(userId) : Promise.resolve([]),
        ]);

        if (!isMounted) {
          return;
        }

        const memberSince = profile ? formatMemberSince(profile.createdAt) : null;

        setIsAdmin(adminStatus);

        if (profile) {
          setUser({
            name: profile.fullName,
            email: profile.email,
            phone: profile.phone,
            memberSince,
            avatarUrl: profile.avatarUrl,
          });
        }

        const approvedReceipts = receipts.filter((receipt) => receipt.status === "approved").length;
        const completedRedemptions = redemptions.filter(
          (redemption) => redemption.status === "concluido",
        ).length;

        setStats({
          points: balance,
          receipts: approvedReceipts,
          redemptions: completedRedemptions,
        });
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        toast.error("Não foi possível carregar seu perfil.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
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
    ...(isAdmin
      ? []
      : [
          {
            icon: FileText,
            label: "Relatório da conta",
            path: "/profile/notifications",
          },
        ]),
    {
      icon: Shield,
      label: "Segurança",
      path: "/profile/security",
    },
    {
      icon: HelpCircle,
      label: "Ajuda e suporte",
      path: "/help",
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

  const handleDeleteAccount = async () => {
    if (!deleteConfirmed) {
      return;
    }

    setIsDeletingAccount(true);

    try {
      await deleteCurrentUserData();
      toast.success("Seus dados pessoais foram apagados.");
      await logoutCurrentUser();
      navigate("/auth");
    } catch (error) {
      console.error("Erro ao apagar dados da conta:", error);
      toast.error("Não foi possível apagar seus dados pessoais. Tente novamente.");
    } finally {
      setIsDeletingAccount(false);
      setDeleteDialogOpen(false);
      setDeleteConfirmed(false);
    }
  };

  return (
    <AppLayout title="Perfil" showBack>
      <div className="container px-4 py-6">
        {/* User Info Card */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-xl">
              {user?.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                : "?"}
            </div>
            <div className="flex-1">
              <h2 className="font-display font-bold text-lg text-foreground">
                {user?.name ?? (isLoading ? "Carregando..." : "Usuário")}
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {user?.email ?? (isLoading ? "Carregando..." : "Sem email")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {user?.memberSince
                  ? `Membro desde ${user.memberSince}`
                  : isLoading
                    ? "Carregando..."
                    : "Membro desde -"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {!isAdmin && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
              <p className="font-display font-bold text-xl text-foreground">
                {isLoading ? "—" : stats.points.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-muted-foreground">Pontos</p>
            </div>
            <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
              <p className="font-display font-bold text-xl text-foreground">
                {isLoading ? "—" : stats.receipts}
              </p>
              <p className="text-xs text-muted-foreground">Compras</p>
            </div>
            <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
              <p className="font-display font-bold text-xl text-foreground">
                {isLoading ? "—" : stats.redemptions}
              </p>
              <p className="text-xs text-muted-foreground">Resgates</p>
            </div>
          </div>
        )}

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

        {!isAdmin && (
          <Button
            variant="outline"
            className="w-full mt-3 text-destructive border-destructive/40 hover:bg-destructive/10"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir minha conta
          </Button>
        )}

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Meu Resgate v1.0.0
        </p>
      </div>

      {!isAdmin && (
        <Dialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) {
              setDeleteConfirmed(false);
            }
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Excluir conta</DialogTitle>
              <DialogDescription>
                Com essa ação, todos os seus dados cadastrais e o progresso com o Meu
                Resgate serão apagados definitivamente.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/40 p-4">
              <Checkbox
                id="confirm-delete"
                checked={deleteConfirmed}
                onCheckedChange={(checked) => setDeleteConfirmed(Boolean(checked))}
              />
              <label
                htmlFor="confirm-delete"
                className="text-sm text-foreground leading-relaxed cursor-pointer"
              >
                Estou ciente de que meus dados cadastrais e o progresso com o Meu Resgate
                serão apagados definitivamente.
              </label>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeletingAccount}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={!deleteConfirmed || isDeletingAccount}
                className="w-full sm:w-auto"
              >
                {isDeletingAccount ? "Apagando..." : "Confirmar exclusão"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
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
