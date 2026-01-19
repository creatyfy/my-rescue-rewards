import { QrCode, ShoppingBag, History, Gift } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  {
    icon: QrCode,
    label: "Escanear QR",
    description: "Acumule pontos",
    path: "/scan",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: ShoppingBag,
    label: "Loja",
    description: "Resgatar prêmios",
    path: "/store",
    color: "bg-secondary/20 text-secondary-foreground",
  },
  {
    icon: History,
    label: "Histórico",
    description: "Suas transações",
    path: "/history",
    color: "bg-accent text-accent-foreground",
  },
  {
    icon: Gift,
    label: "Promoções",
    description: "Ofertas especiais",
    path: "/promotions",
    color: "bg-success/10 text-success",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.path}
            to={action.path}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border/50 shadow-soft hover:shadow-medium transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className={`p-3 rounded-xl ${action.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-foreground">{action.label}</p>
              <p className="text-[10px] text-muted-foreground hidden sm:block">{action.description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
