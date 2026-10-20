import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import { formatCurrency } from "@/lib/points-config";
import {
  AdminOrder,
  AdminOrderStatus,
  AdminProfile,
  AdminUser,
  cancelAdminOrder,
  confirmOrderPayment,
  fetchAdminOrders,
  fetchAdminProfiles,
  fetchAdminUsers,
  markOrderDelivered,
  markOrderShipped,
} from "@/integrations/supabase/admin";
import { UserProfileModal } from "./UserProfileModal";

export function AdminOrdersPanel() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<AdminOrderStatus>("pending_payment");

  // User profile modal state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const userModalTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const [orderData, userData, profileData] = await Promise.all([
          fetchAdminOrders(),
          fetchAdminUsers(),
          fetchAdminProfiles(),
        ]);
        setOrders(orderData);
        setUsers(userData);
        setProfiles(profileData);
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
        toast.error("Não foi possível carregar os pedidos.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const userLookup = useMemo(() => {
    const map = new Map<string, { email: string | null; fullName: string | null; phone: string | null }>();
    users.forEach((user) => {
      map.set(user.user_id, {
        email: user.email ?? null,
        fullName: user.full_name ?? null,
        phone: null,
      });
    });
    profiles.forEach((profile) => {
      const current = map.get(profile.user_id) ?? { email: null, fullName: null, phone: null };
      map.set(profile.user_id, {
        email: current.email,
        fullName: profile.full_name ?? current.fullName,
        phone: profile.phone ?? null,
      });
    });
    return map;
  }, [users, profiles]);

  const handleOpenUserModal = (userId: string, trigger?: HTMLButtonElement | null) => {
    userModalTriggerRef.current = trigger ?? null;
    setSelectedUserId(userId);
    setUserModalOpen(true);
  };

  const applyLocalStatus = (orderId: string, status: AdminOrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              paid_at: status === "paid" ? new Date().toISOString() : order.paid_at,
            }
          : order,
      ),
    );
  };

  const handleConfirmPayment = async (orderId: string) => {
    try {
      setUpdatingOrderId(orderId);
      await confirmOrderPayment(orderId);
      applyLocalStatus(orderId, "paid");
      toast.success("Pagamento confirmado. Pontos e estoque atualizados.");
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
      const message = (error as { message?: string }).message ?? "Não foi possível confirmar o pagamento.";
      toast.error(message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleMarkShipped = async (orderId: string) => {
    try {
      setUpdatingOrderId(orderId);
      await markOrderShipped(orderId);
      applyLocalStatus(orderId, "shipped");
      toast.success("Pedido marcado como enviado. Cliente avisado.");
    } catch (error) {
      console.error("Erro ao marcar envio:", error);
      const message = (error as { message?: string }).message ?? "Não foi possível atualizar o pedido.";
      toast.error(message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      setUpdatingOrderId(orderId);
      await markOrderDelivered(orderId);
      applyLocalStatus(orderId, "delivered");
      toast.success("Pedido marcado como entregue.");
    } catch (error) {
      console.error("Erro ao marcar entrega:", error);
      const message = (error as { message?: string }).message ?? "Não foi possível atualizar o pedido.";
      toast.error(message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      setUpdatingOrderId(orderId);
      await cancelAdminOrder(orderId);
      applyLocalStatus(orderId, "cancelled");
      toast.success("Pedido cancelado.");
    } catch (error) {
      console.error("Erro ao cancelar pedido:", error);
      const message = (error as { message?: string }).message ?? "Não foi possível cancelar o pedido.";
      toast.error(message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusBadge = (status: AdminOrderStatus) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            Pago
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            Enviado
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
            Entregue
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            Cancelado
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            Expirado
          </span>
        );
      case "pending_payment":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pending/10 text-pending">
            Aguardando pagamento
          </span>
        );
    }
  };

  const getDeliverySummary = (order: AdminOrder) => {
    if (!order.delivery_address) {
      return "Não informado";
    }

    const parts = [
      order.delivery_address,
      order.delivery_number,
      order.delivery_neighborhood,
      order.delivery_city,
      order.delivery_state,
      order.delivery_cep,
    ].filter(Boolean);

    return parts.join(", ");
  };

  const filteredOrders = useMemo(
    () => orders.filter((order) => order.status === activeStatus),
    [activeStatus, orders],
  );

  const statusTabs: Array<{
    value: AdminOrderStatus;
    label: string;
    emptyMessage: string;
  }> = [
    {
      value: "pending_payment",
      label: "Aguardando pagamento",
      emptyMessage: "Nenhum pedido aguardando pagamento no momento.",
    },
    {
      value: "paid",
      label: "Pagos",
      emptyMessage: "Nenhum pedido pago aguardando envio.",
    },
    {
      value: "shipped",
      label: "Enviados",
      emptyMessage: "Nenhum pedido enviado aguardando entrega.",
    },
    {
      value: "delivered",
      label: "Entregues",
      emptyMessage: "Nenhum pedido entregue ainda.",
    },
    {
      value: "cancelled",
      label: "Cancelados",
      emptyMessage: "Nenhum pedido cancelado.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-bold text-foreground">Pedidos</h2>
        <p className="text-sm text-muted-foreground">
          Compras feitas na loja (dinheiro ou pontos + dinheiro). Confirme o pagamento
          quando receber o Pix e marque o pedido como entregue após a entrega.
        </p>
      </div>

      {loading ? (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground animate-pulse">Carregando pedidos...</p>
        </Card>
      ) : (
        <Card className="overflow-hidden border-border/60">
          <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-3">
            {statusTabs.map((tab) => {
              const count = orders.filter((order) => order.status === tab.value).length;
              return (
                <Button
                  key={tab.value}
                  type="button"
                  size="sm"
                  variant={activeStatus === tab.value ? "default" : "outline"}
                  onClick={() => setActiveStatus(tab.value)}
                  className="min-w-[150px]"
                >
                  {tab.label}
                  {count > 0 ? ` (${count})` : ""}
                </Button>
              );
            })}
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold text-foreground whitespace-nowrap">Usuário</TableHead>
                  <TableHead className="font-semibold text-foreground whitespace-nowrap">Produto</TableHead>
                  <TableHead className="font-semibold text-foreground whitespace-nowrap">Pontos usados</TableHead>
                  <TableHead className="font-semibold text-foreground whitespace-nowrap">Valor a pagar</TableHead>
                  <TableHead className="font-semibold text-foreground whitespace-nowrap">Entrega</TableHead>
                  <TableHead className="font-semibold text-foreground whitespace-nowrap">Status</TableHead>
                  <TableHead className="font-semibold text-foreground whitespace-nowrap">Data</TableHead>
                  <TableHead className="font-semibold text-foreground whitespace-nowrap">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-sm text-muted-foreground">
                      {statusTabs.find((tab) => tab.value === activeStatus)?.emptyMessage ??
                        "Nenhum pedido encontrado."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const userInfo = userLookup.get(order.user_id);
                    const isUpdating = updatingOrderId === order.id;
                    return (
                      <TableRow key={order.id} className="hover:bg-muted/20">
                        <TableCell>
                          <button
                            type="button"
                            className="text-left text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                            aria-label={`Ver dados do usuário ${userInfo?.fullName ?? order.user_id}`}
                            onClick={(event) => handleOpenUserModal(order.user_id, event.currentTarget)}
                          >
                            <div className="space-y-0.5">
                              <p className="font-medium">
                                {userInfo?.fullName ?? "Sem nome cadastrado"}
                              </p>
                              <p className="text-xs text-muted-foreground">{userInfo?.email ?? "Sem email"}</p>
                            </div>
                          </button>
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.product_name ?? "Produto"}
                        </TableCell>
                        <TableCell className="text-sm font-semibold tabular-nums">
                          {order.points_applied > 0
                            ? order.points_applied.toLocaleString("pt-BR")
                            : "—"}
                        </TableCell>
                        <TableCell className="text-sm font-semibold tabular-nums whitespace-nowrap">
                          {formatCurrency(order.amount_reais)}
                          {order.discount_reais > 0 ? (
                            <span className="block text-xs font-normal text-muted-foreground">
                              desc. {formatCurrency(order.discount_reais)}
                            </span>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-normal max-w-[220px]">
                          {getDeliverySummary(order)}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(order.created_at).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          {order.status === "pending_payment" ? (
                            <div className="flex flex-col gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleConfirmPayment(order.id)}
                                disabled={isUpdating}
                              >
                                {isUpdating ? "Confirmando..." : "Confirmar pagamento"}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={isUpdating}
                              >
                                Cancelar
                              </Button>
                            </div>
                          ) : order.status === "paid" ? (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleMarkShipped(order.id)}
                              disabled={isUpdating}
                            >
                              {isUpdating ? "Atualizando..." : "Marcar enviado"}
                            </Button>
                          ) : order.status === "shipped" ? (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleMarkDelivered(order.id)}
                              disabled={isUpdating}
                            >
                              {isUpdating ? "Atualizando..." : "Marcar entregue"}
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <UserProfileModal
        open={userModalOpen}
        onOpenChange={setUserModalOpen}
        userId={selectedUserId}
        triggerRef={userModalTriggerRef}
      />
    </div>
  );
}
