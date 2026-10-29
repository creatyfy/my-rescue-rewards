import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { fetchMyOrders, type Order, type OrderStatus } from "@/integrations/supabase/store";
import { formatCurrency } from "@/lib/points-config";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Aguardando pagamento",
  paid: "Pago",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  expired: "Expirado",
};

const statusBadge = (status: OrderStatus) => {
  const base =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  switch (status) {
    case "paid":
    case "shipped":
      return `${base} bg-primary/10 text-primary`;
    case "delivered":
      return `${base} bg-success/10 text-success`;
    case "cancelled":
      return `${base} bg-destructive/10 text-destructive`;
    case "expired":
      return `${base} bg-muted text-muted-foreground`;
    case "pending_payment":
    default:
      return `${base} bg-pending/10 text-pending`;
  }
};

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const data = await fetchMyOrders();
      setOrders(data);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    load(true);
  }, [load]);

  // Mostra o resultado do pagamento (vindo do retorno do Mercado Pago)
  useEffect(() => {
    const pg = new URLSearchParams(window.location.search).get("pagamento");
    if (pg === "sucesso") {
      toast.success("Pagamento recebido! Em instantes seu pedido aparece como Pago.");
    } else if (pg === "falha") {
      toast.error("O pagamento não foi concluído. Você pode tentar novamente.");
    } else if (pg === "pendente") {
      toast.info("Pagamento pendente. Avisaremos assim que for confirmado.");
    }
  }, []);

  // Atualiza a lista automaticamente quando o cliente volta pro app/aba
  // (ex.: depois de pagar no navegador do Mercado Pago).
  useEffect(() => {
    const refresh = () => {
      void load();
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    const handles: Array<{ remove: () => void }> = [];
    (async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          const appH = await CapApp.addListener("appStateChange", ({ isActive }) => {
            if (isActive) refresh();
          });
          handles.push(appH);
          const brH = await Browser.addListener("browserFinished", () => refresh());
          handles.push(brH);
        }
      } catch {
        /* sem listeners nativos: o visibilitychange ainda cobre */
      }
    })();

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      handles.forEach((h) => {
        try {
          h.remove();
        } catch {
          /* ignore */
        }
      });
    };
  }, [load]);

  return (
    <AppLayout title="Meus Pedidos" showBack>
      <div className="container px-4 py-6 md:py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando seus pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-muted-foreground">Você ainda não fez nenhuma compra.</p>
            <Button asChild size="sm">
              <Link to="/store">Ir para a loja</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">
                      {order.productName ?? "Produto"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className={statusBadge(order.status)}>
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>

                <div className="mt-3 space-y-1 border-t border-border/50 pt-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preço</span>
                    <span>{formatCurrency(order.priceReais)}</span>
                  </div>
                  {order.pointsApplied > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>
                        Desconto ({order.pointsApplied.toLocaleString("pt-BR")} pts)
                      </span>
                      <span>- {formatCurrency(order.discountReais)}</span>
                    </div>
                  )}
                  {order.deliveryFeeReais > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entrega</span>
                      <span>{formatCurrency(order.deliveryFeeReais)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border/50 pt-1 font-bold">
                    <span>{order.status === "pending_payment" ? "A pagar" : "Pago"}</span>
                    <span>{formatCurrency(order.amountReais)}</span>
                  </div>
                </div>

                {order.status === "pending_payment" && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Aguardando confirmação do pagamento. Assim que confirmarmos, você recebe um aviso.
                  </p>
                )}

                {(order.status === "paid" || order.status === "shipped") && order.deliveryToken && (
                  <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Código de entrega</p>
                    <p className="font-mono text-2xl font-bold tracking-widest text-primary">
                      {order.deliveryToken}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Informe este código ao entregador para confirmar o recebimento.
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
