import { AppLayout } from "@/components/layout/AppLayout";
import { PointsCard } from "@/components/points/PointsCard";
import { QuickActions } from "@/components/points/QuickActions";
import { TransactionItem } from "@/components/transactions/TransactionItem";
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
  const userName = "Maria"; // Mock - virá do auth

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
            <PointsCard balance={1250} pendingPoints={120} />
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
              {mockTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} {...transaction} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
