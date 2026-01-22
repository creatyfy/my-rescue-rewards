import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductCard } from "@/components/store/ProductCard";
import { Search, Filter, Coins } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { fetchCurrentUserBalance, fetchProducts, redeemProduct } from "@/integrations/supabase/store";

export default function Store() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<
    Array<{ id: string; name: string; description: string; imageUrl: string; pointsCost: number; stock: number }>
  >([]);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    const loadStoreData = async () => {
      setLoading(true);
      try {
        const [productsData, balance] = await Promise.all([
          fetchProducts(),
          fetchCurrentUserBalance(),
        ]);

        setProducts(productsData);
        setUserPoints(balance);
      } catch (error) {
        console.error("Erro ao carregar loja:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStoreData();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRedeem = async (productId: string) => {
    try {
      const redemption = await redeemProduct(productId);

      if (!redemption) {
        toast.error("Não foi possível realizar o resgate.");
        return;
      }

      setUserPoints(redemption.remaining_balance);
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === redemption.product_id
            ? { ...product, stock: redemption.stock_remaining }
            : product
        )
      );

      toast.success(`Resgate confirmado: ${redemption.product_name}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível realizar o resgate.";
      toast.error(message);
    }
  };

  return (
    <AppLayout title="Loja">
      <div className="container px-4 py-6">
        {/* Points Balance */}
        <div className="flex items-center justify-between p-4 mb-6 rounded-xl bg-accent border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-gold">
              <Coins className="w-5 h-5 text-points-gold-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Seu saldo</p>
              <p className="font-display font-bold text-lg text-foreground">
                {userPoints.toLocaleString('pt-BR')} pontos
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                userPoints={userPoints}
                onRedeem={handleRedeem}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
