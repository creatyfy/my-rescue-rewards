import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminReportsPanel } from "@/components/admin/AdminReportsPanel";
import { PointsCard } from "@/components/points/PointsCard";
import { QuickActions } from "@/components/points/QuickActions";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { Card } from "@/components/ui/card";
import { fetchAdminStatus } from "@/integrations/supabase/admin";
import {
  fetchCurrentUserBalance,
  fetchCurrentUserId,
  fetchCurrentUserPendingPoints,
  fetchCurrentUserProfileName,
  fetchUserLedger,
} from "@/integrations/supabase/store";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

type TransactionStatus =
  | "approved"
  | "pending"
  | "pendente"
  | "rejected"
  | "solicitado"
  | "em andamento"
  | "enviado"
  | "concluído";

type Transaction = {
  id: string;
  type: "earn" | "redeem";
  title: string;
  subtitle: string;
  points: number;
  status: TransactionStatus;
  date: string;
};

export default function Dashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [pendingPoints, setPendingPoints] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadAdminStatus = async () => {
      try {
        const status = await fetchAdminStatus().catch(() => false);
        if (mounted) {
          setIsAdmin(status);
        }
      } catch (error) {
        console.error("Erro ao validar status de admin:", error);
      } finally {
        if (mounted) {
          setAdminLoading(false);
        }
      }
    };

    loadAdminStatus();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (adminLoading || isAdmin) {
      setLoading(false);
      return;
    }
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const userId = await fetchCurrentUserId();

        if (!userId) return;

        const [
          balanceResult,
          pendingResult,
          profileName,
          ledgerEntries,
        ] = await Promise.all([
          fetchCurrentUserBalance(),
          fetchCurrentUserPendingPoints(),
          fetchCurrentUserProfileName(),
          fetchUserLedger(userId, 5),
        ]);

        setBalance(balanceResult);
        setPendingPoints(pendingResult);

        setUserName(profileName);

        const mapped = ledgerEntries.map((entry) => {
          const createdAt = new Date(entry.created_at);
          const isEarn = entry.amount >= 0;
          const type = isEarn ? ("earn" as const) : ("redeem" as const);

          const title =
            entry.ledger_type === "earn"
              ? entry.store_name ?? "Loja parceira"
              : entry.ledger_type === "redeem"
                ? entry.product_name ?? "Produto resgatado"
                : entry.ledger_type === "expire"
                  ? "Pontos expirados"
                  : "Ajuste de pontos";

          const subtitle =
            entry.ledger_type === "earn"
              ? entry.protocol_number
                ? `Comprovante ${entry.protocol_number}`
                : "Comprovante aprovado"
              : entry.ledger_type === "redeem"
                ? "Produto resgatado"
                : entry.ledger_type === "expire"
                  ? "Expiração automática"
                  : "Ajuste manual";

          const status =
            entry.receipt_status ??
            (entry.redemption_status ?? ("approved" as const));

          return {
            id: entry.ledger_id,
            type,
            title,
            subtitle,
            points: Math.abs(entry.amount),
            status,
            date: createdAt.toLocaleString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        });

        setTransactions(mapped);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [adminLoading, isAdmin]);

  return (
    <AppLayout>
      {adminLoading ? (
        <div className="container px-4 py-6">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Carregando visão geral...</p>
          </Card>
        </div>
      ) : isAdmin ? (
        <div className="container px-4 py-6">
          <AdminReportsPanel
            title="Visão Geral"
            description="Relatório do sistema com indicadores gerais e acompanhamento de operações."
          />
        </div>
      ) : (
        <div className="gradient-hero min-h-[200px]">
          <div className="container px-4 py-6">
            {/* Greeting */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">Olá,</p>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {userName ? `${userName}!` : "Bem-vindo(a)!"}
              </h1>
            </div>

            {/* Points Card */}
            <div className="mb-6 animate-slide-up">
              <PointsCard balance={balance} pendingPoints={pendingPoints} />
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="font-display font-semibold text-base mb-3 text-foreground">
                Ações rápidas
              </h2>
              <QuickActions />
            </div>

            {/* Recent Transactions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-semibold text-base text-foreground">
                  Atividade recente
                </h2>
                <Link
                  to="/history"
                  className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
                >
                  Ver tudo
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {loading ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem atividade recente.</p>
                ) : (
                  transactions.map((transaction) => (
                    <TransactionItem key={transaction.id} {...transaction} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
