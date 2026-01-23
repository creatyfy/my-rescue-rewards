import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import {
  AdminEstablishment,
  AdminProduct,
  AdminReceiptSummary,
  AdminRedemption,
  fetchAdminEstablishments,
  fetchAdminProducts,
  fetchAdminReceiptsSummary,
  fetchAdminRedemptions,
} from "@/integrations/supabase/admin";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function AdminReportsPanel() {
  const [receipts, setReceipts] = useState<AdminReceiptSummary[]>([]);
  const [redemptions, setRedemptions] = useState<AdminRedemption[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [establishments, setEstablishments] = useState<AdminEstablishment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [receiptData, redemptionData, productData, establishmentData] = await Promise.all([
        fetchAdminReceiptsSummary(),
        fetchAdminRedemptions(),
        fetchAdminProducts(),
        fetchAdminEstablishments(),
      ]);
      setReceipts(receiptData);
      setRedemptions(redemptionData);
      setProducts(productData);
      setEstablishments(establishmentData);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
      toast.error("Não foi possível carregar os relatórios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const summary = useMemo(() => {
    const receiptTotals = receipts.reduce(
      (acc, receipt) => {
        acc.total += 1;
        acc.purchaseValue += Number(receipt.purchase_value);
        if (receipt.status === "approved") {
          acc.approved += 1;
          acc.pointsEarned += receipt.points;
        } else if (receipt.status === "rejected") {
          acc.rejected += 1;
        } else {
          acc.pending += 1;
        }
        return acc;
      },
      { total: 0, approved: 0, rejected: 0, pending: 0, purchaseValue: 0, pointsEarned: 0 },
    );

    const redemptionTotals = redemptions.reduce(
      (acc, redemption) => {
        acc.total += 1;
        if (redemption.status === "completed") {
          acc.completed += 1;
          acc.pointsSpent += redemption.points_spent;
        } else if (redemption.status === "cancelled") {
          acc.cancelled += 1;
        } else {
          acc.pending += 1;
        }
        return acc;
      },
      { total: 0, completed: 0, cancelled: 0, pending: 0, pointsSpent: 0 },
    );

    const activeProducts = products.filter((product) => product.active).length;
    const activeEstablishments = establishments.filter((est) => est.active).length;

    return {
      receiptTotals,
      redemptionTotals,
      activeProducts,
      activeEstablishments,
    };
  }, [receipts, redemptions, products, establishments]);

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="text-lg font-semibold">Relatórios básicos</h2>
        <p className="text-sm text-muted-foreground">
          Indicadores gerais para acompanhar o desempenho do programa.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando relatórios...</p>
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Comprovantes recebidos</p>
              <p className="text-2xl font-semibold mt-2">{summary.receiptTotals.total}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.receiptTotals.pending} pendentes
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Valor em compras</p>
              <p className="text-2xl font-semibold mt-2">
                {formatCurrency(summary.receiptTotals.purchaseValue)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.receiptTotals.approved} aprovados
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Pontos concedidos</p>
              <p className="text-2xl font-semibold mt-2">
                {summary.receiptTotals.pointsEarned.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.receiptTotals.rejected} rejeitados
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Pontos resgatados</p>
              <p className="text-2xl font-semibold mt-2">
                {summary.redemptionTotals.pointsSpent.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.redemptionTotals.completed} resgates concluídos
              </p>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Catálogo ativo</p>
              <p className="text-2xl font-semibold mt-2">{summary.activeProducts}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {products.length} produtos cadastrados
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Estabelecimentos ativos</p>
              <p className="text-2xl font-semibold mt-2">{summary.activeEstablishments}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {establishments.length} parceiros cadastrados
              </p>
            </Card>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicador</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Comprovantes aprovados</TableCell>
                <TableCell>{summary.receiptTotals.approved}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Comprovantes rejeitados</TableCell>
                <TableCell>{summary.receiptTotals.rejected}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Comprovantes pendentes</TableCell>
                <TableCell>{summary.receiptTotals.pending}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Resgates pendentes</TableCell>
                <TableCell>{summary.redemptionTotals.pending}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Resgates cancelados</TableCell>
                <TableCell>{summary.redemptionTotals.cancelled}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
