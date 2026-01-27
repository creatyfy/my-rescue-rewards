import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Building2, 
  Receipt, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  Star, 
  Users,
  TrendingUp,
  ArrowLeft
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts";
import { cn } from "@/lib/utils";
import type { EstablishmentMetrics } from "@/hooks/useAdminReports";
import type { AdminEstablishment } from "@/integrations/supabase/admin";

type EstablishmentDetailViewProps = {
  establishment: AdminEstablishment;
  metrics: EstablishmentMetrics;
  onBack: () => void;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const chartConfig: ChartConfig = {
  receipts: {
    label: "Comprovantes",
    color: "hsl(var(--primary))",
  },
  points: {
    label: "Pontos",
    color: "hsl(var(--success))",
  },
  value: {
    label: "Valor (R$)",
    color: "hsl(var(--secondary))",
  },
};

export function EstablishmentDetailView({ 
  establishment, 
  metrics, 
  onBack 
}: EstablishmentDetailViewProps) {
  const formattedChartData = useMemo(() => {
    return metrics.dailyData.map((item) => ({
      ...item,
      dateLabel: format(new Date(item.date), "dd/MM", { locale: ptBR }),
    }));
  }, [metrics.dailyData]);

  const approvalRate = metrics.totalReceipts > 0
    ? ((metrics.approvedReceipts / metrics.totalReceipts) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="self-start"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar à visão geral
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {establishment.logo_url ? (
              <img 
                src={establishment.logo_url} 
                alt={establishment.name}
                className="h-12 w-12 rounded-lg object-cover border border-border"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                {establishment.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {establishment.address || "Endereço não informado"}
              </p>
            </div>
            <Badge 
              variant={establishment.active ? "default" : "secondary"}
              className={cn(
                "ml-auto",
                establishment.active ? "bg-success text-success-foreground" : ""
              )}
            >
              {establishment.active ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 bg-card border-border/60">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total de transações
              </p>
              <p className="font-display text-3xl font-bold text-foreground tabular-nums">
                {metrics.totalReceipts}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-success">{metrics.approvedReceipts}</p>
              <p className="text-xs text-muted-foreground">Aprovados</p>
            </div>
            <div>
              <p className="text-lg font-bold text-pending">{metrics.pendingReceipts}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
            <div>
              <p className="text-lg font-bold text-destructive">{metrics.rejectedReceipts}</p>
              <p className="text-xs text-muted-foreground">Rejeitados</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-card border-border/60">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Valor em compras
              </p>
              <p className="font-display text-3xl font-bold text-foreground tabular-nums">
                {formatCurrency(metrics.totalPurchaseValue)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-secondary/20 text-secondary-foreground">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">
              Ticket médio: {formatCurrency(metrics.totalReceipts > 0 ? metrics.totalPurchaseValue / metrics.totalReceipts : 0)}
            </span>
          </div>
        </Card>

        <Card className="p-5 bg-card border-border/60">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Pontos gerados
              </p>
              <p className="font-display text-3xl font-bold text-primary tabular-nums">
                {metrics.pointsGenerated.toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Star className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">
              Taxa de aprovação: {approvalRate}%
            </span>
          </div>
        </Card>

        <Card className="p-5 bg-card border-border/60">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Usuários ativos
              </p>
              <p className="font-display text-3xl font-bold text-foreground tabular-nums">
                {metrics.uniqueUsers}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-accent text-accent-foreground">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Média de transações: {metrics.uniqueUsers > 0 ? (metrics.totalReceipts / metrics.uniqueUsers).toFixed(1) : 0} por usuário
            </span>
          </div>
        </Card>
      </div>

      {/* Charts */}
      {formattedChartData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Receipts Over Time */}
          <Card className="p-5 border-border/60">
            <div className="mb-4">
              <h3 className="font-semibold text-foreground">Comprovantes por dia</h3>
              <p className="text-sm text-muted-foreground">
                Quantidade de comprovantes recebidos no período
              </p>
            </div>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={formattedChartData} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="dateLabel" 
                  tickLine={false} 
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  fontSize={12}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="receipts" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  name="Comprovantes"
                />
              </BarChart>
            </ChartContainer>
          </Card>

          {/* Points Over Time */}
          <Card className="p-5 border-border/60">
            <div className="mb-4">
              <h3 className="font-semibold text-foreground">Pontos gerados por dia</h3>
              <p className="text-sm text-muted-foreground">
                Evolução de pontos aprovados no período
              </p>
            </div>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <LineChart data={formattedChartData} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="dateLabel" 
                  tickLine={false} 
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  fontSize={12}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone"
                  dataKey="points" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--success))", strokeWidth: 2 }}
                  name="Pontos"
                />
              </LineChart>
            </ChartContainer>
          </Card>
        </div>
      )}

      {formattedChartData.length === 0 && (
        <Card className="p-8 text-center border-border/60">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Receipt className="h-10 w-10 opacity-50" />
            <p className="text-sm">
              Nenhuma transação encontrada no período selecionado.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
