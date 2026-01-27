import { 
  Receipt, 
  DollarSign, 
  Star, 
  Gift, 
  Users, 
  Building2,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  subtitleValue?: string | number;
  subtitleColor?: "success" | "pending" | "destructive" | "muted";
  icon: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
};

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  subtitleValue, 
  subtitleColor = "muted",
  icon,
  trend,
  className 
}: MetricCardProps) {
  const colorClasses = {
    success: "text-success",
    pending: "text-pending",
    destructive: "text-destructive",
    muted: "text-muted-foreground",
  };

  return (
    <Card className={cn(
      "p-5 bg-card border-border/60 hover:shadow-md transition-all duration-200",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
          <p className="font-display text-3xl font-bold text-foreground tabular-nums">
            {value}
          </p>
          {(subtitle || subtitleValue !== undefined) && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {subtitleValue !== undefined && (
                <span className={cn("font-medium", colorClasses[subtitleColor])}>
                  {subtitleValue}
                </span>
              )}
              {subtitle}
            </p>
          )}
        </div>
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      {trend && (
        <div className={cn(
          "mt-3 pt-3 border-t border-border/50 flex items-center gap-1 text-xs font-medium",
          trend.positive ? "text-success" : "text-destructive"
        )}>
          <TrendingUp className={cn("h-3.5 w-3.5", !trend.positive && "rotate-180")} />
          {trend.positive ? "+" : "-"}{Math.abs(trend.value)}% vs período anterior
        </div>
      )}
    </Card>
  );
}

type ReportsMetricsGridProps = {
  summary: {
    receiptTotals: {
      total: number;
      approved: number;
      rejected: number;
      pending: number;
      purchaseValue: number;
      pointsEarned: number;
    };
    redemptionTotals: {
      total: number;
      completed: number;
      pending: number;
      cancelled: number;
      pointsSpent: number;
    };
    uniqueUsers: number;
    activeEstablishments: number;
  };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function ReportsMetricsGrid({ summary }: ReportsMetricsGridProps) {
  return (
    <div className="space-y-4">
      {/* Primary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Comprovantes recebidos"
          value={summary.receiptTotals.total}
          subtitle="pendentes"
          subtitleValue={summary.receiptTotals.pending}
          subtitleColor="pending"
          icon={<Receipt className="h-5 w-5" />}
        />
        <MetricCard
          title="Valor em compras"
          value={formatCurrency(summary.receiptTotals.purchaseValue)}
          subtitle="aprovados"
          subtitleValue={summary.receiptTotals.approved}
          subtitleColor="success"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <MetricCard
          title="Pontos gerados"
          value={summary.receiptTotals.pointsEarned.toLocaleString("pt-BR")}
          subtitle="rejeitados"
          subtitleValue={summary.receiptTotals.rejected}
          subtitleColor="destructive"
          icon={<Star className="h-5 w-5" />}
        />
        <MetricCard
          title="Pontos resgatados"
          value={summary.redemptionTotals.pointsSpent.toLocaleString("pt-BR")}
          subtitle="resgates concluídos"
          subtitleValue={summary.redemptionTotals.completed}
          subtitleColor="success"
          icon={<Gift className="h-5 w-5" />}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Usuários ativos"
          value={summary.uniqueUsers}
          subtitle="no período selecionado"
          icon={<Users className="h-5 w-5" />}
          className="bg-muted/30"
        />
        <MetricCard
          title="Estabelecimentos ativos"
          value={summary.activeEstablishments}
          subtitle="parceiros cadastrados"
          icon={<Building2 className="h-5 w-5" />}
          className="bg-muted/30"
        />
        <MetricCard
          title="Resgates pendentes"
          value={summary.redemptionTotals.pending}
          subtitle="aguardando processamento"
          subtitleColor="pending"
          icon={<Clock className="h-5 w-5" />}
          className="bg-muted/30"
        />
        <MetricCard
          title="Resgates cancelados"
          value={summary.redemptionTotals.cancelled}
          subtitle="no período"
          subtitleColor="destructive"
          icon={<XCircle className="h-5 w-5" />}
          className="bg-muted/30"
        />
      </div>
    </div>
  );
}
