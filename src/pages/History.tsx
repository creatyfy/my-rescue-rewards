import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { Button } from "@/components/ui/button";

type FilterType = "all" | "earn" | "redeem";

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
  {
    id: "4",
    type: "earn" as const,
    title: "Padaria Pão Quente",
    subtitle: "Comprovante #1230",
    points: 28,
    status: "approved" as const,
    date: "14 Jan, 08:45",
  },
  {
    id: "5",
    type: "earn" as const,
    title: "Supermercado Extra",
    subtitle: "Comprovante #1228",
    points: 156,
    status: "rejected" as const,
    date: "12 Jan, 19:20",
  },
  {
    id: "6",
    type: "redeem" as const,
    title: "Voucher R$20",
    subtitle: "Produto resgatado",
    points: 800,
    status: "approved" as const,
    date: "10 Jan, 15:00",
  },
];

export default function History() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredTransactions = mockTransactions.filter((t) => {
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
          {filteredTransactions.map((transaction) => (
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
