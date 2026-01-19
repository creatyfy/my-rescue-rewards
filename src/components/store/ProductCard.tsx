import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  pointsCost: number;
  stock: number;
  userPoints: number;
  onRedeem?: (id: string) => void;
}

export function ProductCard({
  id,
  name,
  description,
  imageUrl,
  pointsCost,
  stock,
  userPoints,
  onRedeem,
}: ProductCardProps) {
  const canAfford = userPoints >= pointsCost;
  const isAvailable = stock > 0;
  const canRedeem = canAfford && isAvailable;

  return (
    <div className="group bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <span className="font-semibold text-muted-foreground">Esgotado</span>
          </div>
        )}
        {isAvailable && stock <= 5 && (
          <span className="absolute top-3 right-3 px-2 py-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded-full">
            Últimas {stock} unidades
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display font-semibold text-base text-foreground mb-1 line-clamp-1">
          {name}
        </h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 rounded-lg gradient-gold">
              <Coins className="w-4 h-4 text-points-gold-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">
              {pointsCost.toLocaleString('pt-BR')}
            </span>
          </div>

          <Button
            variant={canRedeem ? "default" : "outline"}
            size="sm"
            disabled={!canRedeem}
            onClick={() => onRedeem?.(id)}
            className="text-xs"
          >
            {!isAvailable ? "Esgotado" : !canAfford ? "Pontos insuf." : "Resgatar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
