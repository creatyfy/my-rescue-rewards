import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductCard } from "@/components/store/ProductCard";
import { Search, Filter, Coins } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import {
  DeliveryData,
  UserContact,
  fetchCurrentUserBalance,
  fetchCurrentUserContact,
  fetchProducts,
  redeemProduct,
} from "@/integrations/supabase/store";

export default function Store() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<
    Array<{ id: string; name: string; description: string; imageUrl: string; pointsCost: number; stock: number }>
  >([]);
  const [userPoints, setUserPoints] = useState(0);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryData>({
    cep: "",
    address: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
  });
  const [userContact, setUserContact] = useState<UserContact | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    const loadStoreData = async () => {
      setLoading(true);
      try {
        const [productsData, balance, contact] = await Promise.all([
          fetchProducts(),
          fetchCurrentUserBalance(),
          fetchCurrentUserContact(),
        ]);

        setProducts(productsData);
        setUserPoints(balance);
        setUserContact(contact);
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

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId],
  );

  const isContactMissing =
    !userContact?.fullName || !userContact?.email || !userContact?.phone;

  const trimmedDelivery = useMemo(
    () => ({
      cep: deliveryData.cep.trim(),
      address: deliveryData.address.trim(),
      number: deliveryData.number.trim(),
      neighborhood: deliveryData.neighborhood.trim(),
      city: deliveryData.city.trim(),
      state: deliveryData.state.trim(),
    }),
    [deliveryData],
  );
  const isDeliveryComplete = Object.values(trimmedDelivery).every((value) => value.length > 0);
  const cepDigits = trimmedDelivery.cep.replace(/\D/g, "");
  const isCepValid = cepDigits.length === 8;
  const isStateValid = trimmedDelivery.state.length === 2;
  const isDeliveryValid = isDeliveryComplete && isCepValid && isStateValid;

  const handleRedeem = (productId: string) => {
    setSelectedProductId(productId);
    setRedeemDialogOpen(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedProductId) {
      return;
    }

    if (isContactMissing) {
      toast.error("Atualize seu perfil com nome, email e telefone antes de resgatar.");
      return;
    }

    if (!isDeliveryComplete) {
      toast.error("Preencha todos os dados de entrega para concluir o resgate.");
      return;
    }

    if (!isCepValid) {
      toast.error("Informe um CEP válido para concluir o resgate.");
      return;
    }

    if (!isStateValid) {
      toast.error("Informe o estado com a sigla de 2 letras.");
      return;
    }

    try {
      setRedeeming(true);
      const redemption = await redeemProduct(selectedProductId, deliveryData);

      if (!redemption) {
        console.error("Resposta inesperada ao resgatar produto:", {
          productId: selectedProductId,
          deliveryData,
        });
        toast.error("Não foi possível realizar o resgate.");
        return;
      }

      setUserPoints(redemption.remaining_balance);
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === redemption.product_id
            ? { ...product, stock: redemption.stock_remaining }
            : product,
        ),
      );

      toast.success(`Resgate confirmado: ${redemption.product_name}.`);
      setRedeemDialogOpen(false);
      setSelectedProductId(null);
      setDeliveryData({
        cep: "",
        address: "",
        number: "",
        neighborhood: "",
        city: "",
        state: "",
      });
    } catch (error) {
      console.error("Falha ao confirmar resgate:", {
        productId: selectedProductId,
        deliveryData,
        error,
      });
      toast.error("Não foi possível realizar o resgate.");
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <AppLayout title="Loja" showBack>
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

      <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Dados de entrega</DialogTitle>
            <DialogDescription>
              Confirme os dados do destinatário e informe o endereço para envio do prêmio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
              <p className="font-medium text-foreground">{selectedProduct?.name ?? "Produto"}</p>
              <p className="text-xs text-muted-foreground">
                {selectedProduct?.pointsCost.toLocaleString("pt-BR")} pontos
              </p>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Destinatário</p>
              <p className="font-medium text-foreground">{userContact?.fullName ?? "Nome não informado"}</p>
              <p className="text-xs text-muted-foreground">{userContact?.email ?? "Email não informado"}</p>
              <p className="text-xs text-muted-foreground">{userContact?.phone ?? "Telefone não informado"}</p>
              {isContactMissing ? (
                <p className="text-xs text-destructive">
                  Atualize seu perfil com nome, email e telefone para concluir o resgate.
                </p>
              ) : null}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Endereço de entrega <span className="text-destructive">*</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Todos os campos são obrigatórios para realizar o resgate.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  CEP <span className="text-destructive">*</span>
                </label>
                <Input
                  value={deliveryData.cep}
                  onChange={(event) => setDeliveryData((prev) => ({ ...prev, cep: event.target.value }))}
                  placeholder="00000-000"
                  required
                  className={!isCepValid && deliveryData.cep.length > 0 ? "border-destructive" : ""}
                />
                {!isCepValid && deliveryData.cep.length > 0 && (
                  <p className="text-xs text-destructive">CEP deve ter 8 dígitos</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Estado <span className="text-destructive">*</span>
                </label>
                <Input
                  value={deliveryData.state}
                  onChange={(event) => setDeliveryData((prev) => ({ ...prev, state: event.target.value.toUpperCase() }))}
                  placeholder="UF"
                  maxLength={2}
                  required
                  className={!isStateValid && deliveryData.state.length > 0 ? "border-destructive" : ""}
                />
                {!isStateValid && deliveryData.state.length > 0 && (
                  <p className="text-xs text-destructive">Use a sigla do estado (2 letras)</p>
                )}
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Endereço <span className="text-destructive">*</span>
                </label>
                <Input
                  value={deliveryData.address}
                  onChange={(event) => setDeliveryData((prev) => ({ ...prev, address: event.target.value }))}
                  placeholder="Rua, avenida, etc."
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Número <span className="text-destructive">*</span>
                </label>
                <Input
                  value={deliveryData.number}
                  onChange={(event) => setDeliveryData((prev) => ({ ...prev, number: event.target.value }))}
                  placeholder="Número"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Bairro <span className="text-destructive">*</span>
                </label>
                <Input
                  value={deliveryData.neighborhood}
                  onChange={(event) => setDeliveryData((prev) => ({ ...prev, neighborhood: event.target.value }))}
                  placeholder="Bairro"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Cidade <span className="text-destructive">*</span>
                </label>
                <Input
                  value={deliveryData.city}
                  onChange={(event) => setDeliveryData((prev) => ({ ...prev, city: event.target.value }))}
                  placeholder="Cidade"
                  required
                />
              </div>
            </div>
            {!isDeliveryComplete && (
              <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-md">
                Preencha todos os campos de endereço para habilitar o resgate.
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRedeemDialogOpen(false)} disabled={redeeming}>
              Voltar
            </Button>
            <Button onClick={handleConfirmRedeem} disabled={redeeming || isContactMissing || !isDeliveryValid}>
              {redeeming ? "Confirmando..." : "Confirmar resgate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
