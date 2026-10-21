import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import {
  completeOrderDelivery,
  fetchMotoboyDeliveries,
  resolveUserRole,
  type MotoboyDelivery,
} from "@/integrations/supabase/admin";
import { MapPin, Phone, CheckCircle2 } from "lucide-react";

export default function MotoboyDeliveries() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "ok" | "denied">("loading");
  const [deliveries, setDeliveries] = useState<MotoboyDelivery[]>([]);
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [completingId, setCompletingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await fetchMotoboyDeliveries();
      setDeliveries(data);
    } catch (error) {
      console.error("Erro ao carregar entregas:", error);
      toast.error("Não foi possível carregar as entregas.");
    }
  };

  useEffect(() => {
    const init = async () => {
      const role = await resolveUserRole();
      if (role !== "motoboy" && role !== "admin") {
        setStatus("denied");
        return;
      }
      await load();
      setStatus("ok");
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleComplete = async (orderId: string) => {
    const token = (tokens[orderId] ?? "").trim();
    if (token.length < 4) {
      toast.error("Digite o código de entrega do cliente.");
      return;
    }
    try {
      setCompletingId(orderId);
      await completeOrderDelivery(orderId, token);
      setDeliveries((prev) =>
        prev.map((d) => (d.id === orderId ? { ...d, status: "delivered" } : d)),
      );
      setTokens((prev) => ({ ...prev, [orderId]: "" }));
      toast.success("Entrega concluída!");
    } catch (error) {
      const msg = (error as { message?: string }).message ?? "";
      if (msg.includes("codigo invalido")) toast.error("Código incorreto. Confira com o cliente.");
      else if (msg.includes("nao e sua")) toast.error("Esta entrega não é sua.");
      else toast.error("Não foi possível concluir a entrega.");
    } finally {
      setCompletingId(null);
    }
  };

  const pendentes = useMemo(
    () => deliveries.filter((d) => d.status === "shipped"),
    [deliveries],
  );
  const concluidas = useMemo(
    () => deliveries.filter((d) => d.status === "delivered"),
    [deliveries],
  );

  const addressOf = (d: MotoboyDelivery) =>
    [
      d.delivery_address,
      d.delivery_number,
      d.delivery_neighborhood,
      d.delivery_city,
      d.delivery_state,
      d.delivery_cep,
    ]
      .filter(Boolean)
      .join(", ");

  return (
    <AppLayout title="Minhas Entregas" showNav={false} showBack>
      <div className="container px-4 py-6">
        {status === "loading" ? (
          <p className="text-center py-12 text-muted-foreground">Carregando entregas...</p>
        ) : status === "denied" ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Esta área é exclusiva para entregadores.
            </p>
            <Button className="mt-4" onClick={() => navigate("/dashboard")}>
              Voltar
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">A entregar</h2>
              <p className="text-sm text-muted-foreground">
                Conclua cada entrega digitando o código que o cliente recebeu.
              </p>
            </div>

            {pendentes.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                Nenhuma entrega pendente no momento.
              </Card>
            ) : (
              <div className="space-y-3">
                {pendentes.map((d) => (
                  <Card key={d.id} className="p-4 space-y-3">
                    <div>
                      <p className="font-semibold text-foreground">{d.product_name ?? "Produto"}</p>
                      <p className="text-sm text-muted-foreground">
                        {d.customer_name ?? "Cliente"}
                      </p>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{addressOf(d) || "Endereço não informado"}</span>
                      </p>
                      {d.customer_phone && (
                        <a
                          href={`tel:${d.customer_phone.replace(/\D/g, "")}`}
                          className="flex items-center gap-2 text-primary"
                        >
                          <Phone className="h-4 w-4" />
                          {d.customer_phone}
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 border-t border-border/50 pt-3">
                      <Input
                        inputMode="numeric"
                        placeholder="Código do cliente"
                        value={tokens[d.id] ?? ""}
                        onChange={(e) =>
                          setTokens((prev) => ({ ...prev, [d.id]: e.target.value }))
                        }
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleComplete(d.id)}
                        disabled={completingId === d.id}
                      >
                        {completingId === d.id ? "..." : "Concluir"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {concluidas.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-display text-lg font-semibold text-foreground">Concluídas</h3>
                {concluidas.map((d) => (
                  <Card key={d.id} className="p-4 flex items-center justify-between opacity-80">
                    <div>
                      <p className="font-medium text-foreground">{d.product_name ?? "Produto"}</p>
                      <p className="text-xs text-muted-foreground">{d.customer_name ?? "Cliente"}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm text-success">
                      <CheckCircle2 className="h-4 w-4" /> Entregue
                    </span>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
