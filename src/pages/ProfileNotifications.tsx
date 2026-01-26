import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Calendar, ShoppingBag, Gift, TrendingUp } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import {
  fetchCurrentUserId,
  fetchCurrentUserBalance,
  fetchReceiptHistory,
  fetchRedemptionHistory,
} from "@/integrations/supabase/store";
import { fetchCurrentUserProfile } from "@/integrations/supabase/profile";

type AccountStats = {
  memberSince: string | null;
  totalReceipts: number;
  approvedReceipts: number;
  pendingReceipts: number;
  rejectedReceipts: number;
  totalRedemptions: number;
  completedRedemptions: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  currentBalance: number;
};

type RedemptionItem = {
  id: string;
  productName: string;
  pointsSpent: number;
  status: string;
  createdAt: string;
};

export default function ProfileNotifications() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AccountStats | null>(null);
  const [redemptions, setRedemptions] = useState<RedemptionItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadAccountData = async () => {
      setIsLoading(true);
      try {
        const userId = await fetchCurrentUserId();
        if (!userId) {
          throw new Error("Usuário não autenticado");
        }

        const [profile, balance, receipts, redemptionsData] = await Promise.all([
          fetchCurrentUserProfile(),
          fetchCurrentUserBalance(),
          fetchReceiptHistory(userId),
          fetchRedemptionHistory(userId),
        ]);

        if (!isMounted) return;

        const approvedReceipts = receipts.filter((r) => r.status === "approved");
        const pendingReceipts = receipts.filter((r) => r.status === "pending");
        const rejectedReceipts = receipts.filter((r) => r.status === "rejected");
        const completedRedemptions = redemptionsData.filter((r) => r.status === "concluído");

        const totalPointsEarned = approvedReceipts.reduce((sum, r) => sum + r.points, 0);
        const totalPointsSpent = completedRedemptions.reduce((sum, r) => sum + r.points_spent, 0);

        setStats({
          memberSince: profile?.createdAt ? formatDate(profile.createdAt) : null,
          totalReceipts: receipts.length,
          approvedReceipts: approvedReceipts.length,
          pendingReceipts: pendingReceipts.length,
          rejectedReceipts: rejectedReceipts.length,
          totalRedemptions: redemptionsData.length,
          completedRedemptions: completedRedemptions.length,
          totalPointsEarned,
          totalPointsSpent,
          currentBalance: balance,
        });

        setRedemptions(
          redemptionsData.map((r) => ({
            id: r.id,
            productName: r.products?.name ?? "Produto",
            pointsSpent: r.points_spent,
            status: r.status,
            createdAt: formatDate(r.created_at),
          }))
        );
      } catch (error) {
        console.error("Erro ao carregar dados da conta:", error);
        toast.error("Não foi possível carregar o relatório.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadAccountData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AppLayout title="Relatório da Conta" showBack>
      <div className="container px-4 py-6 space-y-6">
        {/* Data de cadastro */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-soft p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-display font-semibold text-lg text-foreground">
              Informações da Conta
            </h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Membro desde</span>
              <span className="text-sm font-medium text-foreground">
                {isLoading ? "Carregando..." : stats?.memberSince ?? "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Saldo atual</span>
              <span className="text-sm font-medium text-success">
                {isLoading ? "—" : `${stats?.currentBalance.toLocaleString("pt-BR")} pontos`}
              </span>
            </div>
          </div>
        </div>

        {/* Resumo de compras */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-soft p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent">
              <ShoppingBag className="w-5 h-5 text-accent-foreground" />
            </div>
            <h2 className="font-display font-semibold text-lg text-foreground">
              Resumo de Compras
            </h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total de comprovantes</span>
              <span className="text-sm font-medium text-foreground">
                {isLoading ? "—" : stats?.totalReceipts}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Aprovados</span>
              <span className="text-sm font-medium text-success">
                {isLoading ? "—" : stats?.approvedReceipts}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pendentes</span>
              <span className="text-sm font-medium text-pending">
                {isLoading ? "—" : stats?.pendingReceipts}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Rejeitados</span>
              <span className="text-sm font-medium text-destructive">
                {isLoading ? "—" : stats?.rejectedReceipts}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border/50">
              <span className="text-sm text-muted-foreground">Pontos ganhos</span>
              <span className="text-sm font-semibold text-success">
                {isLoading ? "—" : `+${stats?.totalPointsEarned.toLocaleString("pt-BR")}`}
              </span>
            </div>
          </div>
        </div>

        {/* Resumo de resgates */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-soft p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-secondary/20">
              <Gift className="w-5 h-5 text-secondary-foreground" />
            </div>
            <h2 className="font-display font-semibold text-lg text-foreground">
              Resumo de Resgates
            </h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total de resgates</span>
              <span className="text-sm font-medium text-foreground">
                {isLoading ? "—" : stats?.totalRedemptions}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Concluídos</span>
              <span className="text-sm font-medium text-success">
                {isLoading ? "—" : stats?.completedRedemptions}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border/50">
              <span className="text-sm text-muted-foreground">Pontos utilizados</span>
              <span className="text-sm font-semibold text-destructive">
                {isLoading ? "—" : `-${stats?.totalPointsSpent.toLocaleString("pt-BR")}`}
              </span>
            </div>
          </div>
        </div>

        {/* Histórico de resgates */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-soft p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <h2 className="font-display font-semibold text-lg text-foreground">
              Histórico de Resgates
            </h2>
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : redemptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum resgate realizado ainda.</p>
          ) : (
            <div className="space-y-3">
              {redemptions.map((redemption) => (
                <div
                  key={redemption.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{redemption.productName}</p>
                    <p className="text-xs text-muted-foreground">{redemption.createdAt}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-destructive">
                      -{redemption.pointsSpent.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-xs text-muted-foreground">pontos</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};
