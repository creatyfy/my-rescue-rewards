import { Store, ShoppingBag, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type TransactionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed"
  | "cancelled"
  | "solicitado"
  | "em andamento"
  | "enviado"
  | "concluído";
export type TransactionType = "earn" | "redeem";

interface TransactionItemProps {
  type: TransactionType;
  title: string;
  subtitle: string;
  points: number;
  status: TransactionStatus;
  date: string;
}

const statusConfig: Record<TransactionStatus, { icon: typeof Clock; label: string; className: string }> = {
  pending: {
    icon: Clock,
    label: "Em análise",
    className: "text-pending bg-pending/10",
  },
  approved: {
    icon: CheckCircle,
    label: "Aprovado",
    className: "text-success bg-success/10",
  },
  rejected: {
    icon: XCircle,
    label: "Rejeitado",
    className: "text-destructive bg-destructive/10",
  },
  completed: {
    icon: CheckCircle,
    label: "Concluído",
    className: "text-success bg-success/10",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelado",
    className: "text-destructive bg-destructive/10",
  },
  solicitado: {
    icon: Clock,
    label: "Solicitado",
    className: "text-muted-foreground bg-muted/60",
  },
  "em andamento": {
    icon: Clock,
    label: "Em andamento",
    className: "text-pending bg-pending/10",
  },
  enviado: {
    icon: ShoppingBag,
    label: "Enviado",
    className: "text-primary bg-primary/10",
  },
  concluído: {
    icon: CheckCircle,
    label: "Concluído",
    className: "text-success bg-success/10",
  },
};

export function TransactionItem({
  type,
  title,
  subtitle,
  points,
  status,
  date,
}: TransactionItemProps) {
  const StatusIcon = statusConfig[status].icon;
  const isEarn = type === "earn";
  const isRejectedEarn = isEarn && status === "rejected";
  const pointsText = isRejectedEarn ? "—" : `${isEarn ? "+" : "-"}${points.toLocaleString("pt-BR")}`;

  return (
    <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50 shadow-soft">
      <div
        className={cn(
          "p-3 rounded-xl",
          isEarn ? "bg-primary/10 text-primary" : "bg-secondary/20 text-secondary-foreground"
        )}
      >
        {isEarn ? <Store className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
              statusConfig[status].className
            )}
          >
            <StatusIcon className="w-3 h-3" />
            {statusConfig[status].label}
          </span>
          <span className="text-[10px] text-muted-foreground">{date}</span>
        </div>
      </div>

      <div className="text-right">
        <span
          className={cn(
            "font-bold text-sm",
            isRejectedEarn ? "text-muted-foreground" : isEarn ? "text-success" : "text-foreground"
          )}
        >
          {pointsText}
        </span>
        <p className="text-[10px] text-muted-foreground">pontos</p>
      </div>
    </div>
  );
}
