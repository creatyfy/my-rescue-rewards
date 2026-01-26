import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { Button } from "@/components/ui/button";
import { fetchCurrentUserId, fetchReceiptHistory, fetchRedemptionHistory } from "@/integrations/supabase/store";

type FilterType = "all" | "earn" | "redeem" | "rejected";
type TransactionStatus =
  | "approved"
  | "pending"
  | "pendente"
  | "rejected"
  | "solicitado"
  | "em andamento"
  | "enviado"
  | "cancelado"
  | "concluído";

type Transaction = {
  id: string;
  type: "earn" | "redeem";
  title: string;
  subtitle: string;
  points: number;
  status: TransactionStatus;
  sortTime: number;
  date: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export default function History() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const userId = await fetchCurrentUserId();

        if (!userId) {
          return;
        }

        const [receipts, redemptions] = await Promise.all([
          fetchReceiptHistory(userId),
          fetchRedemptionHistory(userId),
        ]);

        const receiptItems: Transaction[] = receipts.map((receipt) => ({
          id: receipt.id,
          type: "earn" as const,
          title: receipt.establishments?.name ?? "Loja parceira",
          subtitle: `Compra de ${formatCurrency(Number(receipt.purchase_value))}`,
          points: receipt.points,
          status: receipt.status as TransactionStatus,
          sortTime: new Date(receipt.created_at).getTime(),
          date: new Date(receipt.created_at).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        const redemptionItems: Transaction[] = redemptions.map((redemption) => ({
          id: redemption.id,
          type: "redeem" as const,
          title: redemption.products?.name ?? "Produto resgatado",
          subtitle: "Produto resgatado",
          points: redemption.points_spent,
          status: redemption.status,
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
        setTransactions(combined);
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "all") return true;
    if (filter === "earn") return t.type === "earn" && t.status !== "rejected";
    if (filter === "rejected") return t.type === "earn" && t.status === "rejected";
    return t.type === "redeem";
  });

  return (
    <AppLayout title="Histórico" showBack>
      <div className="container px-4 py-6 md:py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:gap-3 md:overflow-visible md:pb-0 scrollbar-hide">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            className="flex-shrink-0"
            onClick={() => setFilter("all")}
          >
            Todos
          </Button>
          <Button
            variant={filter === "earn" ? "default" : "outline"}
            size="sm"
            className="flex-shrink-0"
            onClick={() => setFilter("earn")}
          >
            Pontos ganhos
          </Button>
          <Button
            variant={filter === "rejected" ? "default" : "outline"}
            size="sm"
            className="flex-shrink-0"
            onClick={() => setFilter("rejected")}
          >
            Pontos recusados
          </Button>
          <Button
            variant={filter === "redeem" ? "default" : "outline"}
            size="sm"
            className="flex-shrink-0"
            onClick={() => setFilter("redeem")}
          >
            Resgates
          </Button>
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando histórico...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma transação encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map(({ sortTime, ...transaction }) => (
              <TransactionItem key={transaction.id} {...transaction} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
