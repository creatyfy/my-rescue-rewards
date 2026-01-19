import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PointsCard } from "@/components/points/PointsCard";
import { QuickActions } from "@/components/points/QuickActions";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import {
  fetchCurrentUserBalance,
  fetchCurrentUserId,
  fetchCurrentUserPendingPoints,
  fetchCurrentUserProfileName,
  fetchUserLedger,
} from "@/integrations/supabase/store";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data - será substituído por dados reais do backend
const mockTransactions = [
  {
    id: "1",
    type: "earn" as const,
    title: "Café Central",
    subtitle: "Comprovante #1234",
    points: 45,
    status: "approved" as const,
    date: "Hoje, 14:30",
  },
  {
    id: "2",
    type: "earn" as const,
    title: "Restaurante Sabor",
    subtitle: "Comprovante #1235",
    points: 120,
    status: "pending" as const,
    date: "Ontem, 20:15",
  },
  {
    id: "3",
    type: "redeem" as const,
    title: "Caneca Premium",
    subtitle: "Produto resgatado",
    points: 500,
    status: "approved" as const,
    date: "15 Jan, 10:00",
  },
];

export default function Dashboard() {
  const [userName, setUserName] = useState("Maria");
  const [balance, setBalance] = useState(1250);
  const [pendingPoints, setPendingPoints] = useState(120);
  const [transactions, setTransactions] = useState(mockTransactions);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const userId = await fetchCurrentUserId();

        if (!userId) {
          return;
        }

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

        if (profileName) {
          setUserName(profileName);
        }

        if (ledgerEntries.length > 0) {
          const mapped = ledgerEntries.map((entry) => {
            const createdAt = new Date(entry.created_at);
            const isEarn = entry.amount >= 0;
            const type = isEarn ? ("earn" as const) : ("redeem" as const);

            const title =
              entry.ledger_type === "earn"
                ? entry.establishment_name ?? "Estabelecimento"
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
              (entry.redemption_status === "completed"
                ? ("approved" as const)
                : entry.redemption_status === "cancelled"
                  ? ("rejected" as const)
                  : entry.redemption_status === "pending"
                    ? ("pending" as const)
                    : ("approved" as const));

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
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      }
    };

    loadDashboard();
  }, []);

  return (
    <AppLayout>
      <div className="gradient-hero min-h-[200px]">
        <div className="container px-4 py-6">
          {/* Greeting */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">Olá,</p>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {userName}! 👋
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
              {transactions.map((transaction) => (
                <TransactionItem key={transaction.id} {...transaction} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
