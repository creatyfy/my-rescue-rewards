import { useEffect, useMemo, useState } from "react";
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
      { total: 0, completed: 0, pending: 0, cancelled: 0, pointsSpent: 0 },
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

  const handleUpdateStatus = async (redemptionId: string, status: AdminRedemption["status"]) => {
    try {
      setUpdatingRedemptionId(redemptionId);
      await updateAdminRedemptionStatus(redemptionId, status);
      setRedemptions((prev) =>
        prev.map((redemption) => (redemption.id === redemptionId ? { ...redemption, status } : redemption)),
      );
      toast.success("Status do resgate atualizado.");
    } catch (error) {
      console.error("Erro ao atualizar resgate:", error);
      toast.error("Não foi possível atualizar o resgate.");
    } finally {
      setUpdatingRedemptionId(null);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground animate-pulse">Carregando relatórios...</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Filters Section */}
          <Card className="p-5 bg-card border-border/60">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Período do relatório
                </label>
                <Select value={periodFilter} onValueChange={(value) => setPeriodFilter(value as typeof periodFilter)}>
                  <SelectTrigger className="bg-background border-input hover:border-ring transition-colors">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="last7">Últimos 7 dias</SelectItem>
                    <SelectItem value="last15">Últimos 15 dias</SelectItem>
                    <SelectItem value="last30">Últimos 30 dias</SelectItem>
                    <SelectItem value="custom">Intervalo personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Estabelecimento
                </label>
                <Select value={establishmentFilter} onValueChange={setEstablishmentFilter}>
                  <SelectTrigger className="bg-background border-input hover:border-ring transition-colors">
                    <SelectValue placeholder="Selecione a loja" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
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
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Data inicial
                    </label>
                    <Input 
                      type="date" 
                      value={customStart} 
                      onChange={(event) => setCustomStart(event.target.value)}
                      className="bg-background border-input hover:border-ring transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Data final
                    </label>
                    <Input 
                      type="date" 
                      value={customEnd} 
                      onChange={(event) => setCustomEnd(event.target.value)}
                      className="bg-background border-input hover:border-ring transition-colors"
                    />
                  </div>
                </>
              ) : null}
            </div>
          </Card>

          {/* Primary Metrics Grid */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="p-5 bg-card border-border/60 hover:shadow-soft transition-shadow">
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Comprovantes recebidos
                </p>
                <p className="font-display text-3xl font-bold text-foreground tabular-nums">
                  {summary.receiptTotals.total}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-pending font-medium">
                    {summary.receiptTotals.pending}
                  </span>{" "}
                  pendentes
                </p>
              </div>
            </Card>
            <Card className="p-5 bg-card border-border/60 hover:shadow-soft transition-shadow">
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Valor em compras
                </p>
                <p className="font-display text-3xl font-bold text-foreground tabular-nums">
                  {formatCurrency(summary.receiptTotals.purchaseValue)}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-success font-medium">
                    {summary.receiptTotals.approved}
                  </span>{" "}
                  aprovados
                </p>
              </div>
            </Card>
            <Card className="p-5 bg-card border-border/60 hover:shadow-soft transition-shadow">
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Pontos concedidos
                </p>
                <p className="font-display text-3xl font-bold text-primary tabular-nums">
                  {summary.receiptTotals.pointsEarned.toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-destructive font-medium">
                    {summary.receiptTotals.rejected}
                  </span>{" "}
                  rejeitados
                </p>
              </div>
            </Card>
            <Card className="p-5 bg-card border-border/60 hover:shadow-soft transition-shadow">
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Pontos resgatados
                </p>
                <p className="font-display text-3xl font-bold text-foreground tabular-nums">
                  {summary.redemptionTotals.pointsSpent.toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-success font-medium">
                    {summary.redemptionTotals.completed}
                  </span>{" "}
                  resgates concluídos
                </p>
              </div>
            </Card>
          </div>

          {/* Secondary Metrics Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5 bg-card border-border/60 hover:shadow-soft transition-shadow">
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Catálogo ativo
                </p>
                <p className="font-display text-3xl font-bold text-foreground tabular-nums">
                  {summary.activeProducts}
                </p>
                <p className="text-xs text-muted-foreground">
                  {filteredProducts.length} produtos cadastrados
                </p>
              </div>
            </Card>
            <Card className="p-5 bg-card border-border/60 hover:shadow-soft transition-shadow">
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Estabelecimentos ativos
                </p>
                <p className="font-display text-3xl font-bold text-foreground tabular-nums">
                  {summary.activeEstablishments}
                </p>
                <p className="text-xs text-muted-foreground">
                  {filteredEstablishments.length} parceiros cadastrados
                </p>
              </div>
            </Card>
          </div>

          {/* Summary Table */}
          <Card className="overflow-hidden border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold text-foreground">Indicador</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-muted/20">
                  <TableCell className="text-muted-foreground">Comprovantes aprovados</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{summary.receiptTotals.approved}</TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/20">
                  <TableCell className="text-muted-foreground">Comprovantes rejeitados</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{summary.receiptTotals.rejected}</TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/20">
                  <TableCell className="text-muted-foreground">Comprovantes pendentes</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{summary.receiptTotals.pending}</TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/20">
                  <TableCell className="text-muted-foreground">Resgates pendentes</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{summary.redemptionTotals.pending}</TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/20">
                  <TableCell className="text-muted-foreground">Resgates concluídos</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{summary.redemptionTotals.completed}</TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/20">
                  <TableCell className="text-muted-foreground">Resgates cancelados</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{summary.redemptionTotals.cancelled}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>

          {/* Redemptions Section */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-display text-lg font-semibold text-foreground">Resgates</h3>
              <p className="text-sm text-muted-foreground">
                Lista completa de resgates com status e dados do usuário.
              </p>
            </div>
            <Card className="overflow-hidden border-border/60">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold text-foreground whitespace-nowrap">Usuário</TableHead>
                      <TableHead className="font-semibold text-foreground whitespace-nowrap">Email</TableHead>
                      <TableHead className="font-semibold text-foreground whitespace-nowrap">Telefone</TableHead>
                      <TableHead className="font-semibold text-foreground whitespace-nowrap">Prêmio</TableHead>
                      <TableHead className="font-semibold text-foreground whitespace-nowrap text-right">Pontos</TableHead>
                      <TableHead className="font-semibold text-foreground whitespace-nowrap">Data</TableHead>
                      <TableHead className="font-semibold text-foreground whitespace-nowrap">Estabelecimento</TableHead>
                      <TableHead className="font-semibold text-foreground whitespace-nowrap">Entrega</TableHead>
                      <TableHead className="font-semibold text-foreground whitespace-nowrap">Status</TableHead>
                      <TableHead className="font-semibold text-foreground whitespace-nowrap">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRedemptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-sm text-muted-foreground">
                          Nenhum resgate encontrado para os filtros selecionados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRedemptions.map((redemption) => {
                        const userInfo = userLookup.get(redemption.user_id);
                        const statusLabel =
                          redemption.status === "completed"
                            ? "Concluído"
                            : redemption.status === "cancelled"
                              ? "Cancelado"
                              : "Pendente";
                        const statusClass =
                          redemption.status === "completed"
                            ? "text-success font-medium"
                            : redemption.status === "cancelled"
                              ? "text-destructive font-medium"
                              : "text-pending font-medium";
                        const establishmentLabel =
                          establishmentFilter === "all"
                            ? "—"
                            : establishmentLookup.get(establishmentFilter) ?? "—";
                        return (
                          <TableRow key={redemption.id} className="hover:bg-muted/20">
                            <TableCell className="font-medium">{userInfo?.fullName ?? "Usuário"}</TableCell>
                            <TableCell className="text-muted-foreground">{userInfo?.email ?? "Não informado"}</TableCell>
                            <TableCell className="text-muted-foreground">{userInfo?.phone ?? "Não informado"}</TableCell>
                            <TableCell>{redemption.product_name ?? "Prêmio resgatado"}</TableCell>
                            <TableCell className="text-right font-medium tabular-nums">
                              {redemption.points_spent.toLocaleString("pt-BR")}
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap">
                              {new Date(redemption.created_at).toLocaleString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{establishmentLabel}</TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-normal">
                              —
                            </TableCell>
                            <TableCell className={statusClass}>{statusLabel}</TableCell>
                            <TableCell>
                              <Select
                                value={redemption.status}
                                onValueChange={(value) =>
                                  handleUpdateStatus(redemption.id, value as AdminRedemption["status"])
                                }
                                disabled={updatingRedemptionId === redemption.id}
                              >
                                <SelectTrigger className="w-36">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border">
                                  <SelectItem value="pending">Pendente</SelectItem>
                                  <SelectItem value="pendente">Pendente (novo)</SelectItem>
                                  <SelectItem value="completed">Concluído</SelectItem>
                                  <SelectItem value="cancelled">Cancelado</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
