import { BarChart3, RefreshCw, FileText, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAdminReports } from "@/hooks/useAdminReports";
import { ReportsFilterBar } from "./reports/ReportsFilterBar";
import { ReportsMetricsGrid } from "./reports/ReportsMetricsGrid";
import { ReportsSummaryTable } from "./reports/ReportsSummaryTable";
import { ReportsReceiptsTable } from "./reports/ReportsReceiptsTable";
import { EstablishmentDetailView } from "./reports/EstablishmentDetailView";

type AdminReportsPanelProps = {
  title?: string;
  description?: string;
  className?: string;
};

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Filter Skeleton */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>

      {/* Metrics Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card className="p-4">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="p-8 text-center border-destructive/30">
      <div className="flex flex-col items-center gap-4">
        <div className="p-3 rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Erro ao carregar dados</h3>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="p-8 text-center border-border/60">
      <div className="flex flex-col items-center gap-4">
        <div className="p-3 rounded-full bg-muted">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Nenhum dado encontrado</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Não há registros para os filtros selecionados. Tente ajustar o período ou remover filtros.
          </p>
        </div>
      </div>
    </Card>
  );
}

export function AdminReportsPanel({
  title = "Relatórios",
  description = "Acompanhe indicadores de desempenho com filtros avançados e visualizações detalhadas.",
  className,
}: AdminReportsPanelProps) {
  const {
    // Data
    receipts,
    establishments,
    summary,
    establishmentMetrics,
    userLookup,
    userSearchResults,

    // State
    loading,
    error,
    isSearching,

    // Filter values
    periodFilter,
    customStartDate,
    customEndDate,
    establishmentFilter,
    userFilter,
    userSearchQuery,
    hasActiveFilters,

    // Filter setters
    setPeriodFilter,
    setCustomStartDate,
    setCustomEndDate,
    setEstablishmentFilter,
    setUserFilter,
    setUserSearchQuery,

    // Actions
    clearFilters,
    refresh,
  } = useAdminReports();

  const selectedEstablishment = establishmentFilter !== "all"
    ? establishments.find((e) => e.id === establishmentFilter)
    : null;

  const hasData = receipts.length > 0 || summary.redemptionTotals.total > 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refresh}
          disabled={loading}
          className="self-start sm:self-center"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      {/* Loading State */}
      {loading && <LoadingSkeleton />}

      {/* Error State */}
      {!loading && error && <ErrorState message={error} onRetry={refresh} />}

      {/* Main Content */}
      {!loading && !error && (
        <>
          {/* Filters */}
          <ReportsFilterBar
            periodFilter={periodFilter}
            setPeriodFilter={setPeriodFilter}
            customStartDate={customStartDate}
            setCustomStartDate={setCustomStartDate}
            customEndDate={customEndDate}
            setCustomEndDate={setCustomEndDate}
            establishmentFilter={establishmentFilter}
            setEstablishmentFilter={setEstablishmentFilter}
            establishments={establishments}
            userFilter={userFilter}
            setUserFilter={setUserFilter}
            userSearchQuery={userSearchQuery}
            setUserSearchQuery={setUserSearchQuery}
            userSearchResults={userSearchResults}
            isSearching={isSearching}
            userLookup={userLookup}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
          />

          {/* Establishment Detail View */}
          {selectedEstablishment && establishmentMetrics ? (
            <>
              <EstablishmentDetailView
                establishment={selectedEstablishment}
                metrics={establishmentMetrics}
                onBack={() => setEstablishmentFilter("all")}
              />
              
              {/* Receipts Table for selected establishment */}
              <ReportsReceiptsTable
                receipts={receipts}
                establishments={establishments}
                userLookup={userLookup}
              />
            </>
          ) : (
            <>
              {/* General View */}
              {hasData ? (
                <>
                  {/* Metrics Grid */}
                  <ReportsMetricsGrid summary={summary} />

                  {/* Summary Table */}
                  <ReportsSummaryTable summary={summary} />

                  {/* Receipts Table */}
                  <ReportsReceiptsTable
                    receipts={receipts}
                    establishments={establishments}
                    userLookup={userLookup}
                  />
                </>
              ) : (
                <EmptyState />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
