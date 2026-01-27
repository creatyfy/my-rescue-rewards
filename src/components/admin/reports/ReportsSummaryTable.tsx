import { 
  CheckCircle, 
  XCircle, 
  Clock,
  Receipt,
  Gift
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ReportsSummaryTableProps = {
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
  };
};

export function ReportsSummaryTable({ summary }: ReportsSummaryTableProps) {
  const rows = [
    {
      category: "Comprovantes",
      icon: <Receipt className="h-4 w-4 text-muted-foreground" />,
      items: [
        { label: "Aprovados", value: summary.receiptTotals.approved, icon: <CheckCircle className="h-3.5 w-3.5 text-success" /> },
        { label: "Rejeitados", value: summary.receiptTotals.rejected, icon: <XCircle className="h-3.5 w-3.5 text-destructive" /> },
        { label: "Pendentes", value: summary.receiptTotals.pending, icon: <Clock className="h-3.5 w-3.5 text-pending" /> },
      ],
    },
    {
      category: "Resgates",
      icon: <Gift className="h-4 w-4 text-muted-foreground" />,
      items: [
        { label: "Concluídos", value: summary.redemptionTotals.completed, icon: <CheckCircle className="h-3.5 w-3.5 text-success" /> },
        { label: "Cancelados", value: summary.redemptionTotals.cancelled, icon: <XCircle className="h-3.5 w-3.5 text-destructive" /> },
        { label: "Pendentes", value: summary.redemptionTotals.pending, icon: <Clock className="h-3.5 w-3.5 text-pending" /> },
      ],
    },
  ];

  return (
    <Card className="overflow-hidden border-border/60">
      <div className="p-4 border-b border-border/50 bg-muted/30">
        <h3 className="font-semibold text-foreground">Resumo detalhado</h3>
        <p className="text-sm text-muted-foreground">
          Visão consolidada dos indicadores do período
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/20 hover:bg-muted/20">
            <TableHead className="font-semibold text-foreground">Categoria</TableHead>
            <TableHead className="font-semibold text-foreground">Indicador</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Quantidade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((category) => (
            category.items.map((item, itemIdx) => (
              <TableRow key={`${category.category}-${item.label}`} className="hover:bg-muted/20">
                {itemIdx === 0 && (
                  <TableCell 
                    rowSpan={category.items.length} 
                    className="font-medium border-r border-border/30"
                  >
                    <div className="flex items-center gap-2">
                      {category.icon}
                      {category.category}
                    </div>
                  </TableCell>
                )}
                <TableCell className="text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {item.value}
                </TableCell>
              </TableRow>
            ))
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
