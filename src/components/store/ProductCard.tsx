import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateProductValue, formatCurrency } from "@/lib/points-config";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  pointsCost: number;
  stock: number;
  userPoints: number;
  isAdmin?: boolean;
  onRedeem?: (id: string) => void;
  onPreviewImage?: (id: string, trigger: HTMLButtonElement) => void;
}

export function ProductCard({
  id,
  name,
  description,
  imageUrl,
  pointsCost,
  stock,
  userPoints,
  isAdmin = false,
  onRedeem,
  onPreviewImage,
}: ProductCardProps) {
  const canAfford = userPoints >= pointsCost;
  const isAvailable = stock > 0;
  const canRedeem = canAfford && isAvailable;
  const equivalentValue = calculateProductValue(pointsCost);

  return (
    <div className="group bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <button
          type="button"
          onClick={(event) => onPreviewImage?.(id, event.currentTarget)}
          className="h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={`Ampliar imagem do produto ${name}`}
        >
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </button>
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

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <div className="p-1 sm:p-1.5 rounded-lg gradient-gold flex-shrink-0">
                <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-points-gold-foreground" />
              </div>
              <span className="font-bold text-base sm:text-lg text-foreground">
                {pointsCost.toLocaleString('pt-BR')}
              </span>
            </div>
            {isAdmin && (
              <span className="text-[10px] sm:text-xs text-muted-foreground ml-0.5">
                Equivale a {formatCurrency(equivalentValue)}
              </span>
            )}
          </div>

          <Button
            variant={canRedeem ? "default" : "outline"}
            size="sm"
            disabled={!canRedeem}
            onClick={() => onRedeem?.(id)}
            className="text-[10px] sm:text-xs w-full sm:w-auto"
          >
            {!isAvailable ? "Esgotado" : !canAfford ? "Pontos insuf." : "Resgatar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
