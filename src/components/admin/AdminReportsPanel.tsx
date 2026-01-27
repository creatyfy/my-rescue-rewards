import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import {
  AdminEstablishment,
  fetchAdminEstablishments,
  fetchAdminReportsSummary,
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
  const [establishments, setEstablishments] = useState<AdminEstablishment[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [establishmentsLoading, setEstablishmentsLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<"last7" | "last15" | "last30" | "custom">("last30");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [establishmentFilter, setEstablishmentFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [summary, setSummary] = useState<{
    receipts_total: number;
    receipts_approved: number;
    receipts_rejected: number;
    receipts_pending: number;
    receipts_purchase_value: number;
    receipts_points_earned: number;
    redemptions_total: number;
    redemptions_completed: number;
    redemptions_pending: number;
    redemptions_cancelled: number;
    redemptions_points_spent: number;
    active_products: number;
    active_establishments: number;
    distinct_users: number;
    total_transactions: number;
  } | null>(null);
  const loading = summaryLoading || establishmentsLoading;

  const loadEstablishments = async () => {
    try {
      const establishmentData = await fetchAdminEstablishments();
      setEstablishments(establishmentData);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
      toast.error("Não foi possível carregar os relatórios.");
    } finally {
      setEstablishmentsLoading(false);
    }
  };

  useEffect(() => {
    loadEstablishments();
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

  const dateValidationError = useMemo(() => {
    if (periodFilter !== "custom") {
      return null;
    }
    if (!customStart || !customEnd) {
      return "Informe a data inicial e final para o período personalizado.";
    }
    const startDate = new Date(customStart);
    const endDate = new Date(customEnd);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return "Datas inválidas. Verifique o intervalo selecionado.";
    }
    if (startDate > endDate) {
      return "A data inicial deve ser menor ou igual à data final.";
    }
    return null;
  }, [customStart, customEnd, periodFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const formattedStartDate = useMemo(() => {
    if (!dateRange.start) {
      return null;
    }
    return dateRange.start.toISOString().slice(0, 10);
  }, [dateRange.start]);

  const formattedEndDate = useMemo(() => {
    if (!dateRange.end) {
      return null;
    }
    return dateRange.end.toISOString().slice(0, 10);
  }, [dateRange.end]);

  useEffect(() => {
    if (dateValidationError) {
      setSummaryLoading(false);
      setSummary(null);
      return;
    }
    const loadSummary = async () => {
      try {
        setSummaryLoading(true);
        const data = await fetchAdminReportsSummary({
          establishmentId: establishmentFilter === "all" ? null : establishmentFilter,
          search: debouncedSearch || null,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        });
        setSummary(data);
      } catch (error) {
        console.error("Erro ao carregar relatórios:", error);
        toast.error("Não foi possível carregar os relatórios.");
      } finally {
        setSummaryLoading(false);
      }
    };
    loadSummary();
  }, [establishmentFilter, debouncedSearch, formattedStartDate, formattedEndDate, dateValidationError]);

  const filteredEstablishments = useMemo(() => {
    if (establishmentFilter === "all") {
      return establishments;
    }
    return establishments.filter((est) => est.id === establishmentFilter);
  }, [establishments, establishmentFilter]);

  const establishmentName = useMemo(() => {
    if (establishmentFilter === "all") {
      return null;
    }
    return establishments.find((est) => est.id === establishmentFilter)?.name ?? null;
  }, [establishments, establishmentFilter]);

  const receiptTotals = useMemo(() => {
    return {
      total: summary?.receipts_total ?? 0,
      approved: summary?.receipts_approved ?? 0,
      rejected: summary?.receipts_rejected ?? 0,
      pending: summary?.receipts_pending ?? 0,
      purchaseValue: summary?.receipts_purchase_value ?? 0,
      pointsEarned: summary?.receipts_points_earned ?? 0,
    };
  }, [summary]);

  const redemptionTotals = useMemo(() => {
    return {
      total: summary?.redemptions_total ?? 0,
      completed: summary?.redemptions_completed ?? 0,
      pending: summary?.redemptions_pending ?? 0,
      cancelled: summary?.redemptions_cancelled ?? 0,
      pointsSpent: summary?.redemptions_points_spent ?? 0,
    };
  }, [summary]);

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
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide" htmlFor="admin-report-search">
                  Buscar usuário
                </label>
                <Input
                  id="admin-report-search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Nome, e-mail, CPF ou telefone"
                  className="bg-background border-input hover:border-ring transition-colors"
                />
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
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide" htmlFor="admin-report-start-date">
                      Data inicial
                    </label>
                    <Input 
                      id="admin-report-start-date"
                      type="date" 
                      value={customStart} 
                      onChange={(event) => setCustomStart(event.target.value)}
                      className="bg-background border-input hover:border-ring transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide" htmlFor="admin-report-end-date">
                      Data final
                    </label>
                    <Input 
                      id="admin-report-end-date"
                      type="date" 
                      value={customEnd} 
                      onChange={(event) => setCustomEnd(event.target.value)}
                      className="bg-background border-input hover:border-ring transition-colors"
                    />
                  </div>
                </>
              ) : null}
            </div>
            {dateValidationError ? (
              <p className="mt-3 text-xs text-destructive" role="alert">
                {dateValidationError}
              </p>
            ) : null}
          </Card>

          {!summary || (receiptTotals.total === 0 && redemptionTotals.total === 0) ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-muted-foreground" role="status">
                Nenhum resultado encontrado para os filtros selecionados.
              </p>
            </Card>
          ) : null}

          {/* Primary Metrics Grid */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="p-5 bg-card border-border/60 hover:shadow-soft transition-shadow">
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Comprovantes recebidos
                </p>
                <p className="font-display text-3xl font-bold text-foreground tabular-nums">
                  {receiptTotals.total}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-pending font-medium">
                    {receiptTotals.pending}
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
                  {formatCurrency(receiptTotals.purchaseValue)}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-success font-medium">
                    {receiptTotals.approved}
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
                  {receiptTotals.pointsEarned.toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-destructive font-medium">
                    {receiptTotals.rejected}
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
                  {redemptionTotals.pointsSpent.toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-success font-medium">
                    {redemptionTotals.completed}
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
                  {summary?.active_products ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Produtos ativos no catálogo
                </p>
              </div>
            </Card>
            <Card className="p-5 bg-card border-border/60 hover:shadow-soft transition-shadow">
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Estabelecimentos ativos
                </p>
                <p className="font-display text-3xl font-bold text-foreground tabular-nums">
                  {summary?.active_establishments ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  {filteredEstablishments.length} parceiros filtrados
                </p>
              </div>
            </Card>
          </div>

          {establishmentFilter !== "all" ? (
            <Card className="p-5 bg-card border-border/60">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Visão dedicada do estabelecimento
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {establishmentName ?? "Estabelecimento selecionado"}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total de transações</p>
                    <p className="text-2xl font-bold text-foreground tabular-nums">{summary?.total_transactions ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pontos gerados</p>
                    <p className="text-2xl font-bold text-primary tabular-nums">
                      {summary?.receipts_points_earned?.toLocaleString("pt-BR") ?? "0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Usuários distintos</p>
                    <p className="text-2xl font-bold text-foreground tabular-nums">{summary?.distinct_users ?? 0}</p>
                  </div>
                </div>
              </div>
            </Card>
          ) : null}

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
                  <TableCell className="text-right font-medium tabular-nums">{receiptTotals.approved}</TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/20">
                  <TableCell className="text-muted-foreground">Comprovantes rejeitados</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{receiptTotals.rejected}</TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/20">
                  <TableCell className="text-muted-foreground">Comprovantes pendentes</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{receiptTotals.pending}</TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/20">
                  <TableCell className="text-muted-foreground">Resgates pendentes</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{redemptionTotals.pending}</TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/20">
                  <TableCell className="text-muted-foreground">Resgates concluídos</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{redemptionTotals.completed}</TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/20">
                  <TableCell className="text-muted-foreground">Resgates cancelados</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{redemptionTotals.cancelled}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>

        </div>
      )}
    </div>
  );
}
