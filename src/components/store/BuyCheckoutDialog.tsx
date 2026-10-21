import { useEffect, useMemo, useState } from "react";
import { Loader2, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useCepLookup } from "@/hooks/useCepLookup";
import {
  createAsaasPayment,
  createOrder,
  fetchLastDeliveryAddress,
  type DeliveryData,
  type StoreSettings,
  type UserContact,
} from "@/integrations/supabase/store";
import { formatCurrency } from "@/lib/points-config";

type BuyProduct = {
  id: string;
  name: string;
  pointsCost: number;
  priceReais: number;
};

interface BuyCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: BuyProduct | null;
  userPoints: number;
  userContact: UserContact | null;
  settings: StoreSettings | null;
  onOrderCreated?: () => void;
}

const emptyDelivery: DeliveryData = {
  cep: "",
  address: "",
  number: "",
  neighborhood: "",
  city: "",
  state: "",
};

export function BuyCheckoutDialog({
  open,
  onOpenChange,
  product,
  userPoints,
  userContact,
  settings,
  onOrderCreated,
}: BuyCheckoutDialogProps) {
  const [pointsToUse, setPointsToUse] = useState(0);
  const [delivery, setDelivery] = useState<DeliveryData>(emptyDelivery);
  const [placing, setPlacing] = useState(false);
  const [step, setStep] = useState<"form" | "payment">("form");
  const [amountDue, setAmountDue] = useState(0);
  const [copied, setCopied] = useState(false);
  const [pixQr, setPixQr] = useState<string | null>(null);
  const [pixCopiaCola, setPixCopiaCola] = useState<string | null>(null);
  const [paidByPoints, setPaidByPoints] = useState(false);
  const { loading: cepLoading, error: cepError, lookup: lookupCep, reset: resetCep } = useCepLookup();

  const deliveryFee = settings?.deliveryFeeReais ?? 0;

  // Reset quando abre/fecha ou troca de produto
  useEffect(() => {
    if (open) {
      setPointsToUse(0);
      setDelivery(emptyDelivery);
      setStep("form");
      setAmountDue(0);
      setCopied(false);
      setPixQr(null);
      setPixCopiaCola(null);
      setPaidByPoints(false);
      resetCep();
      // pré-preenche com o último endereço usado, se houver
      let active = true;
      fetchLastDeliveryAddress()
        .then((last) => {
          if (active && last) setDelivery(last);
        })
        .catch(() => {
          /* sem endereço salvo: mantém vazio */
        });
      return () => {
        active = false;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id]);

  const maxPoints = useMemo(() => {
    if (!product) return 0;
    const pct = settings?.maxPointsDiscountPct ?? 100;
    const capByPct = Math.floor((product.pointsCost * pct) / 100);
    return Math.max(0, Math.min(product.pointsCost, userPoints, capByPct));
  }, [product, userPoints, settings]);

  const discount = useMemo(() => {
    if (!product || product.pointsCost <= 0) return 0;
    const d = (product.priceReais * pointsToUse) / product.pointsCost;
    return Math.min(product.priceReais, Math.round(d * 100) / 100);
  }, [product, pointsToUse]);

  const amount = useMemo(() => {
    if (!product) return 0;
    const v = product.priceReais - discount + deliveryFee;
    return Math.max(0, Math.round(v * 100) / 100);
  }, [product, discount, deliveryFee]);

  const isContactMissing = !userContact?.fullName || !userContact?.email || !userContact?.phone;

  const t = {
    cep: delivery.cep.trim(),
    address: delivery.address.trim(),
    number: delivery.number.trim(),
    neighborhood: delivery.neighborhood.trim(),
    city: delivery.city.trim(),
    state: delivery.state.trim(),
  };
  const isCepValid = t.cep.replace(/\D/g, "").length === 8;
  const isStateValid = t.state.length === 2;
  const isDeliveryValid =
    Object.values(t).every((v) => v.length > 0) && isCepValid && isStateValid;

  const handleCepChange = async (value: string) => {
    const digits = value.replace(/\D/g, "");
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5, 8)}` : digits;
    setDelivery((p) => ({ ...p, cep: formatted }));
    if (digits.length === 8) {
      const r = await lookupCep(digits);
      if (r) {
        setDelivery((p) => ({
          ...p,
          address: r.logradouro || p.address,
          neighborhood: r.bairro || p.neighborhood,
          city: r.localidade || p.city,
          state: r.uf || p.state,
        }));
        toast.success("Endereço preenchido automaticamente!");
      }
    } else {
      resetCep();
    }
  };

  const handleConfirm = async () => {
    if (!product) return;
    if (isContactMissing) {
      toast.error("Atualize seu perfil com nome, email e telefone antes de comprar.");
      return;
    }
    if (!isDeliveryValid) {
      toast.error("Preencha todos os dados de entrega (CEP e UF válidos).");
      return;
    }
    try {
      setPlacing(true);
      const orderId = await createOrder(product.id, pointsToUse, t);
      onOrderCreated?.();
      setAmountDue(amount);

      if (!orderId) {
        // pedido criado, mas sem id de retorno: cai no Pix manual (settings)
        setStep("payment");
        return;
      }

      // Gera a cobrança Pix automática no Asaas
      try {
        const pix = await createAsaasPayment(orderId);
        if (pix.paid) {
          setPaidByPoints(true);
        } else {
          setPixQr(pix.qrCode);
          setPixCopiaCola(pix.copiaCola);
        }
      } catch (payErr) {
        // Pedido já foi criado; se a cobrança falhar, mostramos a tela de
        // pagamento assim mesmo (admin pode confirmar manual / cliente tenta depois)
        console.error("Falha ao gerar Pix Asaas:", payErr);
        const pm = payErr instanceof Error ? payErr.message : "";
        if (pm.includes("cpf")) {
          toast.error("Complete seu CPF no perfil para gerar o Pix.");
        } else {
          toast.error("Pedido criado, mas não foi possível gerar o Pix agora. Fale com a loja.");
        }
      }

      setStep("payment");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("insufficient points")) toast.error("Você não tem pontos suficientes.");
      else if (msg.includes("out of stock")) toast.error("Produto esgotado.");
      else if (msg.includes("not for sale")) toast.error("Este produto não está à venda.");
      else toast.error("Não foi possível criar o pedido.");
    } finally {
      setPlacing(false);
    }
  };

  const copyPix = async () => {
    const key = pixCopiaCola ?? settings?.pixKey;
    if (!key) return;
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      toast.success("Código Pix copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar. Copie manualmente.");
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>Comprar {product.name}</DialogTitle>
              <DialogDescription>
                Use seus pontos como desconto (opcional) e pague o restante.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Resumo de valores */}
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preço</span>
                  <span className="font-medium">{formatCurrency(product.priceReais)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entrega</span>
                    <span className="font-medium">{formatCurrency(deliveryFee)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Desconto ({pointsToUse.toLocaleString("pt-BR")} pts)</span>
                    <span>- {formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border/60 pt-1 text-base font-bold">
                  <span>Total a pagar</span>
                  <span>{formatCurrency(amount)}</span>
                </div>
              </div>

              {/* Usar pontos */}
              {maxPoints > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Usar pontos (até {maxPoints.toLocaleString("pt-BR")})
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={maxPoints}
                    step={1}
                    value={pointsToUse}
                    onChange={(e) => setPointsToUse(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <Input
                      type="number"
                      min={0}
                      max={maxPoints}
                      value={pointsToUse}
                      onChange={(e) =>
                        setPointsToUse(Math.max(0, Math.min(maxPoints, Number(e.target.value) || 0)))
                      }
                      className="h-7 w-24 text-center"
                    />
                    <span>{maxPoints.toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              )}

              {/* Endereço */}
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">CEP *</label>
                  <div className="relative">
                    <Input
                      value={delivery.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                    {cepLoading && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {cepError && <p className="text-xs text-destructive">{cepError}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Estado *</label>
                  <Input
                    value={delivery.state}
                    onChange={(e) => setDelivery((p) => ({ ...p, state: e.target.value.toUpperCase() }))}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Endereço *</label>
                  <Input
                    value={delivery.address}
                    onChange={(e) => setDelivery((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Rua, avenida, etc."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Número *</label>
                  <Input
                    value={delivery.number}
                    onChange={(e) => setDelivery((p) => ({ ...p, number: e.target.value }))}
                    placeholder="Número"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Bairro *</label>
                  <Input
                    value={delivery.neighborhood}
                    onChange={(e) => setDelivery((p) => ({ ...p, neighborhood: e.target.value }))}
                    placeholder="Bairro"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Cidade *</label>
                  <Input
                    value={delivery.city}
                    onChange={(e) => setDelivery((p) => ({ ...p, city: e.target.value }))}
                    placeholder="Cidade"
                  />
                </div>
              </div>

              {isContactMissing && (
                <p className="text-xs text-destructive">
                  Atualize seu perfil (nome, email e telefone) para concluir a compra.
                </p>
              )}
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={placing} className="w-full sm:w-auto">
                Voltar
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={placing || isContactMissing || !isDeliveryValid}
                className="w-full sm:w-auto"
              >
                {placing ? "Criando pedido..." : `Confirmar pedido (${formatCurrency(amount)})`}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {paidByPoints ? "Pedido confirmado! 🎉" : "Pedido registrado! 🎉"}
              </DialogTitle>
              <DialogDescription>
                {paidByPoints
                  ? "Seus pontos cobriram o valor total. Já estamos preparando seu pedido."
                  : "Pague o Pix abaixo. A confirmação é automática assim que o pagamento cair."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {paidByPoints ? (
                <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-center">
                  <p className="text-sm font-medium text-success">Pagamento concluído com pontos.</p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-center">
                    <p className="text-xs text-muted-foreground">Valor a pagar</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(amountDue)}</p>
                  </div>

                  {pixCopiaCola ? (
                    <div className="space-y-3">
                      {pixQr && (
                        <div className="flex justify-center">
                          <img
                            src={`data:image/png;base64,${pixQr}`}
                            alt="QR Code Pix"
                            className="h-48 w-48 rounded-lg border border-border/60 bg-white p-2"
                          />
                        </div>
                      )}
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Pix copia e cola
                      </p>
                      <div className="flex items-center gap-2">
                        <Input readOnly value={pixCopiaCola} className="text-xs" />
                        <Button variant="outline" size="icon" onClick={copyPix} aria-label="Copiar código Pix">
                          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Escaneie o QR Code ou copie o código no app do seu banco. A confirmação é automática.
                      </p>
                    </div>
                  ) : settings?.pixKey ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Pague via Pix
                      </p>
                      <div className="flex items-center gap-2">
                        <Input readOnly value={settings.pixKey} className="text-sm" />
                        <Button variant="outline" size="icon" onClick={copyPix} aria-label="Copiar chave Pix">
                          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      {settings.pixOwnerName && (
                        <p className="text-xs text-muted-foreground">Favorecido: {settings.pixOwnerName}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Não foi possível gerar o Pix agora. Fale com a loja para concluir o pagamento.
                    </p>
                  )}

                  {settings?.paymentInstructions && (
                    <p className="text-sm text-foreground whitespace-pre-line">{settings.paymentInstructions}</p>
                  )}
                </>
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => onOpenChange(false)} className="w-full">
                Concluir
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
