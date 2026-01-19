import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductCard } from "@/components/store/ProductCard";
import { Search, Filter, Coins } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { fetchCurrentUserBalance, fetchProducts, redeemProduct } from "@/integrations/supabase/store";

// Mock data
const mockProducts = [
  {
    id: "1",
    name: "Caneca Premium",
    description: "Caneca de porcelana com design exclusivo Meu Resgate",
    imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop",
    pointsCost: 500,
    stock: 15,
  },
  {
    id: "2",
    name: "Camiseta Exclusiva",
    description: "Camiseta 100% algodão com estampa especial",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    pointsCost: 1200,
    stock: 8,
  },
  {
    id: "3",
    name: "Voucher R$50",
    description: "Vale-compras para usar em estabelecimentos parceiros",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop",
    pointsCost: 2000,
    stock: 50,
  },
  {
    id: "4",
    name: "Fone Bluetooth",
    description: "Fone de ouvido wireless com cancelamento de ruído",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    pointsCost: 3500,
    stock: 3,
  },
  {
    id: "5",
    name: "Power Bank",
    description: "Carregador portátil 10.000mAh com carga rápida",
    imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop",
    pointsCost: 1800,
    stock: 0,
  },
  {
    id: "6",
    name: "Mochila Tech",
    description: "Mochila com compartimento para notebook até 15 polegadas",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    pointsCost: 4500,
    stock: 12,
  },
];

export default function Store() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState(mockProducts);
  const [userPoints, setUserPoints] = useState(1250);

  useEffect(() => {
    const loadStoreData = async () => {
      try {
        const [productsData, balance] = await Promise.all([
          fetchProducts(),
          fetchCurrentUserBalance(),
        ]);

        if (productsData.length > 0) {
          setProducts(productsData);
        }
        setUserPoints(balance);
      } catch (error) {
        console.error("Erro ao carregar loja:", error);
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
