import { Coins, TrendingUp } from "lucide-react";

interface PointsCardProps {
  balance: number;
  pendingPoints?: number;
}

export function PointsCard({ balance, pendingPoints = 0 }: PointsCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 text-primary-foreground shadow-primary">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Coins className="w-5 h-5" />
          </div>
          <span className="font-medium text-sm text-white/90">Seu saldo</span>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display font-bold">
              {balance.toLocaleString('pt-BR')}
            </span>
            <span className="text-lg text-white/80">pontos</span>
          </div>
          
          {pendingPoints > 0 && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-white/70">
              <TrendingUp className="w-4 h-4" />
              <span>+{pendingPoints} pontos pendentes</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-white/70">Válidos por 365 dias</span>
          <span className="font-semibold">≈ R$ {(balance / 10).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
}
