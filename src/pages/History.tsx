import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { Button } from "@/components/ui/button";
import { fetchCurrentUserId, fetchReceiptHistory, fetchRedemptionHistory } from "@/integrations/supabase/store";

type FilterType = "all" | "earn" | "redeem";

const mockTransactions = [
  {
    id: "1",
    type: "earn" as const,
    title: "Café Central",
    subtitle: "Comprovante #1234",
    points: 45,
    status: "approved" as const,
    sortTime: Date.now(),
    date: "Hoje, 14:30",
  },
  {
    id: "2",
    type: "earn" as const,
    title: "Restaurante Sabor",
    subtitle: "Comprovante #1235",
    points: 120,
    status: "pending" as const,
    sortTime: Date.now() - 86400000,
    date: "Ontem, 20:15",
  },
  {
    id: "3",
    type: "redeem" as const,
    title: "Caneca Premium",
    subtitle: "Produto resgatado",
    points: 500,
    status: "approved" as const,
    sortTime: Date.now() - 172800000,
    date: "15 Jan, 10:00",
  },
  {
    id: "4",
    type: "earn" as const,
    title: "Padaria Pão Quente",
    subtitle: "Comprovante #1230",
    points: 28,
    status: "approved" as const,
    sortTime: Date.now() - 259200000,
    date: "14 Jan, 08:45",
  },
  {
    id: "5",
    type: "earn" as const,
    title: "Supermercado Extra",
    subtitle: "Comprovante #1228",
    points: 156,
    status: "rejected" as const,
    sortTime: Date.now() - 345600000,
    date: "12 Jan, 19:20",
  },
  {
    id: "6",
    type: "redeem" as const,
    title: "Voucher R$20",
    subtitle: "Produto resgatado",
    points: 800,
    status: "approved" as const,
    sortTime: Date.now() - 432000000,
    date: "10 Jan, 15:00",
  },
];

export default function History() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [transactions, setTransactions] = useState(mockTransactions);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const userId = await fetchCurrentUserId();

        if (!userId) {
          return;
        }

        const [receipts, redemptions] = await Promise.all([
          fetchReceiptHistory(userId),
          fetchRedemptionHistory(userId),
        ]);

        const receiptItems = receipts.map((receipt) => ({
          id: receipt.id,
          type: "earn" as const,
          title: receipt.establishments?.name ?? "Estabelecimento",
          subtitle: `Comprovante ${receipt.protocol_number}`,
          points: receipt.points_earned,
          status: receipt.status,
          sortTime: new Date(receipt.created_at).getTime(),
          date: new Date(receipt.created_at).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        const redemptionItems = redemptions.map((redemption) => ({
          id: redemption.id,
          type: "redeem" as const,
          title: redemption.products?.name ?? "Produto resgatado",
          subtitle: "Produto resgatado",
          points: redemption.points_spent,
          status:
            redemption.status === "completed"
              ? ("approved" as const)
              : redemption.status === "cancelled"
                ? ("rejected" as const)
                : ("pending" as const),
          sortTime: new Date(redemption.created_at).getTime(),
          date: new Date(redemption.created_at).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        const combined = [...receiptItems, ...redemptionItems].sort(
          (a, b) => b.sortTime - a.sortTime
        );

        if (combined.length > 0) {
          setTransactions(combined);
        }
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      }
    };

    loadHistory();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "all") return true;
    return t.type === filter;
  });

  return (
    <AppLayout title="Histórico">
      <div className="container px-4 py-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Todos
          </Button>
          <Button
            variant={filter === "earn" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("earn")}
          >
            Pontos ganhos
          </Button>
          <Button
            variant={filter === "redeem" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("redeem")}
          >
            Resgates
          </Button>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.map(({ sortTime, ...transaction }) => (
            <TransactionItem key={transaction.id} {...transaction} />
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma transação encontrada</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
