import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import {
  AdminProfile,
  AdminEstablishment,
  AdminProduct,
  AdminReceiptSummary,
  AdminRedemption,
  AdminUser,
  fetchAdminEstablishments,
  fetchAdminProfiles,
  fetchAdminProducts,
  fetchAdminReceiptsSummary,
  fetchAdminRedemptions,
  fetchAdminUsers,
  updateAdminRedemptionStatus,
} from "@/integrations/supabase/admin";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

type AdminReportsPanelProps = {
  title?: string;
  description?: string;
  className?: string;
};

export function AdminReportsPanel({
  title = "Relatórios",
  description = "Acompanhe indicadores e resgates com filtros personalizados.",
  className,
}: AdminReportsPanelProps) {
  const [receipts, setReceipts] = useState<AdminReceiptSummary[]>([]);
  const [redemptions, setRedemptions] = useState<AdminRedemption[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [establishments, setEstablishments] = useState<AdminEstablishment[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingRedemptionId, setUpdatingRedemptionId] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState<"last7" | "last15" | "last30" | "custom">("last30");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [establishmentFilter, setEstablishmentFilter] = useState<string>("all");

  const loadReports = async () => {
    try {
      setLoading(true);
      const [receiptData, redemptionData, productData, establishmentData, userData, profileData] = await Promise.all([
        fetchAdminReceiptsSummary(),
        fetchAdminRedemptions(),
        fetchAdminProducts(),
        fetchAdminEstablishments(),
        fetchAdminUsers(),
        fetchAdminProfiles(),
      ]);
      setReceipts(receiptData);
      setRedemptions(redemptionData);
      setProducts(productData);
      setEstablishments(establishmentData);
      setUsers(userData);
      setProfiles(profileData);
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

  const dateRange = useMemo(() => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    if (periodFilter === "custom") {
      const startDate = customStart ? new Date(customStart) : null;
      const endDate = customEnd ? new Date(customEnd) : null;
      if (startDate) {
        startDate.setHours(0, 0, 0, 0);
      }
      if (endDate) {
        endDate.setHours(23, 59, 59, 999);
      }
      return { start: startDate, end: endDate };
    }

    const days = periodFilter === "last7" ? 7 : periodFilter === "last15" ? 15 : 30;
    const start = new Date(now);
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }, [periodFilter, customStart, customEnd]);

  const isWithinRange = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return false;
    }
    if (dateRange.start && date < dateRange.start) {
      return false;
    }
    if (dateRange.end && date > dateRange.end) {
      return false;
    }
    return true;
  };

  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      if (!isWithinRange(receipt.created_at)) {
        return false;
      }
      if (establishmentFilter !== "all" && receipt.establishment_id !== establishmentFilter) {
        return false;
      }
      return true;
    });
  }, [receipts, establishmentFilter, dateRange]);

  const userIdsForEstablishment = useMemo(() => {
    if (establishmentFilter === "all") {
      return null;
    }
    return new Set(filteredReceipts.map((receipt) => receipt.user_id));
  }, [filteredReceipts, establishmentFilter]);

  const filteredRedemptions = useMemo(() => {
    return redemptions.filter((redemption) => {
      if (!isWithinRange(redemption.created_at)) {
        return false;
      }
      if (userIdsForEstablishment && !userIdsForEstablishment.has(redemption.user_id)) {
        return false;
      }
      return true;
    });
  }, [redemptions, dateRange, userIdsForEstablishment]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => isWithinRange(product.created_at));
  }, [products, dateRange]);

  const filteredEstablishments = useMemo(() => {
    return establishments.filter((est) => {
      if (!isWithinRange(est.created_at)) {
        return false;
      }
      if (establishmentFilter !== "all" && est.id !== establishmentFilter) {
        return false;
      }
      return true;
    });
  }, [establishments, establishmentFilter, dateRange]);

  const userLookup = useMemo(() => {
    const map = new Map<string, { email: string | null; fullName: string | null; phone: string | null }>();
    users.forEach((user) => {
      map.set(user.user_id, {
        email: user.email ?? null,
        fullName: user.full_name ?? null,
        phone: null,
      });
    });
    profiles.forEach((profile) => {
      const current = map.get(profile.user_id) ?? { email: null, fullName: null, phone: null };
      map.set(profile.user_id, {
        email: current.email,
        fullName: profile.full_name ?? current.fullName,
        phone: profile.phone ?? null,
      });
    });
    return map;
  }, [users, profiles]);

  const establishmentLookup = useMemo(() => {
    return new Map(establishments.map((est) => [est.id, est.name]));
  }, [establishments]);

  const summary = useMemo(() => {
    const receiptTotals = filteredReceipts.reduce(
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

    const redemptionTotals = filteredRedemptions.reduce(
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

    const activeProducts = filteredProducts.filter((product) => product.active).length;
    const activeEstablishments = filteredEstablishments.filter((est) => est.active).length;

    return {
      receiptTotals,
      redemptionTotals,
      activeProducts,
      activeEstablishments,
    };
  }, [filteredReceipts, filteredRedemptions, filteredProducts, filteredEstablishments]);

  const handleMarkDelivered = async (redemptionId: string) => {
    try {
      setUpdatingRedemptionId(redemptionId);
      await updateAdminRedemptionStatus(redemptionId, "completed");
      setRedemptions((prev) =>
        prev.map((redemption) =>
          redemption.id === redemptionId ? { ...redemption, status: "completed" } : redemption,
        ),
      );
      toast.success("Resgate marcado como entregue.");
    } catch (error) {
      console.error("Erro ao atualizar resgate:", error);
      toast.error("Não foi possível atualizar o resgate.");
    } finally {
      setUpdatingRedemptionId(null);
    }
  };

  return (
    <Card className={cn("p-6 md:p-8", className)}>
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando relatórios...</p>
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="grid gap-2">
              <span className="text-sm font-medium">Período do relatório</span>
              <Select value={periodFilter} onValueChange={(value) => setPeriodFilter(value as typeof periodFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7">Últimos 7 dias</SelectItem>
                  <SelectItem value="last15">Últimos 15 dias</SelectItem>
                  <SelectItem value="last30">Últimos 30 dias</SelectItem>
                  <SelectItem value="custom">Intervalo personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <span className="text-sm font-medium">Estabelecimento</span>
              <Select value={establishmentFilter} onValueChange={setEstablishmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a loja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as lojas</SelectItem>
                  {establishments.map((establishment) => (
                    <SelectItem key={establishment.id} value={establishment.id}>
                      {establishment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {periodFilter === "custom" ? (
              <>
                <div className="grid gap-2">
                  <span className="text-sm font-medium">Data inicial</span>
                  <Input type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <span className="text-sm font-medium">Data final</span>
                  <Input type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} />
                </div>
              </>
            ) : null}
          </div>

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
                {filteredProducts.length} produtos cadastrados
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Estabelecimentos ativos</p>
              <p className="text-2xl font-semibold mt-2">{summary.activeEstablishments}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredEstablishments.length} parceiros cadastrados
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

          <div className="grid gap-2">
            <h3 className="text-base font-semibold">Resgates</h3>
            <p className="text-sm text-muted-foreground">
              Lista completa de resgates com status e dados do usuário.
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Prêmio</TableHead>
                <TableHead>Pontos</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Estabelecimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRedemptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-sm text-muted-foreground">
                    Nenhum resgate encontrado para os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRedemptions.map((redemption) => {
                  const userInfo = userLookup.get(redemption.user_id);
                  const statusLabel =
                    redemption.status === "completed"
                      ? "Entregue"
                      : redemption.status === "cancelled"
                        ? "Cancelado"
                        : "Pendente";
                  const establishmentLabel =
                    establishmentFilter === "all"
                      ? "—"
                      : establishmentLookup.get(establishmentFilter) ?? "—";
                  return (
                    <TableRow key={redemption.id}>
                      <TableCell>{userInfo?.fullName ?? "Usuário"}</TableCell>
                      <TableCell>{userInfo?.email ?? "Não informado"}</TableCell>
                      <TableCell>{userInfo?.phone ?? "Não informado"}</TableCell>
                      <TableCell>{redemption.product_name ?? "Prêmio resgatado"}</TableCell>
                      <TableCell>{redemption.points_spent.toLocaleString("pt-BR")}</TableCell>
                      <TableCell>
                        {new Date(redemption.created_at).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>{establishmentLabel}</TableCell>
                      <TableCell>{statusLabel}</TableCell>
                      <TableCell>
                        {redemption.status === "pending" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updatingRedemptionId === redemption.id}
                            onClick={() => handleMarkDelivered(redemption.id)}
                          >
                            Marcar como entregue
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sem ação</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
