import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import {
  AdminProfile,
  AdminRedemption,
  AdminReceiptUser,
  AdminUser,
  fetchAdminProfiles,
  fetchAdminRedemptions,
  fetchAdminUsers,
  fetchAdminUserDetails,
  updateAdminRedemptionStatus,
} from "@/integrations/supabase/admin";

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizePhoneForWhatsapp = (phone?: string | null) => {
  if (!phone) {
    return null;
  }
  const digits = phone.replace(/\D/g, "");
  if (!digits) {
    return null;
  }
  return digits.startsWith("55") ? digits : `55${digits}`;
};

export function AdminRedemptionsPanel() {
  const [redemptions, setRedemptions] = useState<AdminRedemption[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingRedemptionId, setUpdatingRedemptionId] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<AdminRedemption["status"]>("pending");

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userModalLoading, setUserModalLoading] = useState(false);
  const [userModalError, setUserModalError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminReceiptUser | null>(null);
  const userModalTriggerRef = useRef<HTMLButtonElement | null>(null);
  const userModalFocusRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const loadRedemptions = async () => {
      try {
        setLoading(true);
        const [redemptionData, userData, profileData] = await Promise.all([
          fetchAdminRedemptions(),
          fetchAdminUsers(),
          fetchAdminProfiles(),
        ]);
        setRedemptions(redemptionData);
        setUsers(userData);
        setProfiles(profileData);
      } catch (error) {
        console.error("Erro ao carregar resgates:", error);
        toast.error("Não foi possível carregar os resgates.");
      } finally {
        setLoading(false);
      }
    };

    loadRedemptions();
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

  const resetUserModal = () => {
    setSelectedUser(null);
    setUserModalError(null);
    setUserModalLoading(false);
  };

  const handleOpenUserModal = async (userId: string, trigger?: HTMLButtonElement | null) => {
    userModalTriggerRef.current = trigger ?? null;
    setUserModalOpen(true);
    setUserModalLoading(true);
    setUserModalError(null);
    setSelectedUser(null);

    try {
      const user = await fetchAdminUserDetails(userId);
      if (!user) {
        setUserModalError("Não foi possível carregar os dados do usuário.");
        return;
      }
      setSelectedUser(user);
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      setUserModalError("Não foi possível carregar os dados do usuário.");
    } finally {
      setUserModalLoading(false);
    }
  };

  const handleUpdateStatus = async (redemptionId: string, status: AdminRedemption["status"]) => {
    try {
      setUpdatingRedemptionId(redemptionId);
      await updateAdminRedemptionStatus(redemptionId, status);
      setRedemptions((prev) =>
        prev.map((redemption) => (redemption.id === redemptionId ? { ...redemption, status } : redemption)),
      );
      toast.success("Status do resgate atualizado.");
    } catch (error) {
      console.error("Erro ao atualizar resgate:", error);
      toast.error("Não foi possível atualizar o resgate.");
    } finally {
      setUpdatingRedemptionId(null);
    }
  };

  const getStatusBadge = (status: AdminRedemption["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
            Concluído
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            Cancelado
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pending/10 text-pending">
            Em análise
          </span>
        );
    }
  };

  const getDeliverySummary = (redemption: AdminRedemption) => {
    if (!redemption.delivery_address) {
      return "Não informado";
    }

    const parts = [
      redemption.delivery_address,
      redemption.delivery_number,
      redemption.delivery_neighborhood,
      redemption.delivery_city,
      redemption.delivery_state,
      redemption.delivery_cep,
    ].filter(Boolean);

    return parts.join(", ");
  };

  const filteredRedemptions = useMemo(
    () => redemptions.filter((redemption) => redemption.status === activeStatus),
    [activeStatus, redemptions],
  );

  const statusTabs: Array<{
    value: AdminRedemption["status"];
    label: string;
    emptyMessage: string;
  }> = [
    {
      value: "pending",
      label: "Em análise",
      emptyMessage: "Nenhum resgate em análise no momento.",
    },
    {
      value: "completed",
      label: "Concluído",
      emptyMessage: "Nenhum resgate concluído no momento.",
    },
    {
      value: "cancelled",
      label: "Cancelado",
      emptyMessage: "Nenhum resgate cancelado no momento.",
    },
  ];

  useEffect(() => {
    if (userModalOpen) {
      const handle = window.setTimeout(() => {
        userModalFocusRef.current?.focus();
      }, 0);
      return () => window.clearTimeout(handle);
    }

    if (userModalTriggerRef.current) {
      userModalTriggerRef.current.focus();
    }
    return;
  }, [userModalOpen]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-bold text-foreground">Resgates</h2>
        <p className="text-sm text-muted-foreground">
          Central de controle de todos os resgates. Atualize o status conforme o andamento da entrega.
        </p>
      </div>

      {loading ? (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground animate-pulse">Carregando resgates...</p>
        </Card>
      ) : (
        <Card className="overflow-hidden border-border/60">
          <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-3">
            {statusTabs.map((tab) => (
              <Button
                key={tab.value}
                type="button"
                size="sm"
                variant={activeStatus === tab.value ? "default" : "outline"}
                onClick={() => setActiveStatus(tab.value)}
                className="min-w-[120px]"
              >
                {tab.label}
              </Button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold text-foreground whitespace-nowrap">Usuário</TableHead>
                  <TableHead className="font-semibold text-foreground whitespace-nowrap">Prêmio</TableHead>
                  <TableHead className="font-semibold text-foreground whitespace-nowrap">Pontos</TableHead>
                  <TableHead className="font-semibold text-foreground whitespace-nowrap">Entrega</TableHead>
                  <TableHead className="font-semibold text-foreground whitespace-nowrap">Status</TableHead>
                  <TableHead className="font-semibold text-foreground whitespace-nowrap">Data</TableHead>
                  <TableHead className="font-semibold text-foreground whitespace-nowrap">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRedemptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                      {statusTabs.find((tab) => tab.value === activeStatus)?.emptyMessage ??
                        "Nenhum resgate encontrado."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRedemptions.map((redemption) => {
                    const userInfo = userLookup.get(redemption.user_id);
                    return (
                      <TableRow key={redemption.id} className="hover:bg-muted/20">
                        <TableCell>
                          <button
                            type="button"
                            className="text-left text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                            aria-label={`Ver dados do usuário ${userInfo?.fullName ?? redemption.user_id}`}
                            onClick={(event) => handleOpenUserModal(redemption.user_id, event.currentTarget)}
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
                          {redemption.product_name ?? "Prêmio resgatado"}
                        </TableCell>
                        <TableCell className="text-sm font-semibold tabular-nums">
                          {redemption.points_spent.toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-normal">
                          {getDeliverySummary(redemption)}
                        </TableCell>
                        <TableCell>{getStatusBadge(redemption.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(redemption.created_at).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={redemption.status}
                            onValueChange={(value) =>
                              handleUpdateStatus(redemption.id, value as AdminRedemption["status"])
                            }
                            disabled={updatingRedemptionId === redemption.id}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                              <SelectItem value="pending">Em análise</SelectItem>
                              <SelectItem value="completed">Concluído</SelectItem>
                              <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
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

      <Dialog
        open={userModalOpen}
        onOpenChange={(open) => {
          setUserModalOpen(open);
          if (!open) {
            resetUserModal();
          }
        }}
      >
        <DialogContent className="max-w-xl" role="dialog" aria-modal="true">
          <DialogHeader>
            <DialogTitle>Dados do usuário</DialogTitle>
          </DialogHeader>

          {userModalLoading ? (
            <p className="text-sm text-muted-foreground">Carregando dados do usuário...</p>
          ) : userModalError ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              {userModalError}
            </div>
          ) : selectedUser ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Nome completo</p>
                <p className="text-sm font-medium">{selectedUser.full_name ?? "Não informado"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">CPF</p>
                <p className="text-sm font-medium">{selectedUser.cpf ?? "Não informado"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <p className="text-sm font-medium">{selectedUser.email ?? "Não informado"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Telefone</p>
                <p className="text-sm font-medium">{selectedUser.phone ?? "Não informado"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Data de cadastro</p>
                <p className="text-sm font-medium">
                  {selectedUser.created_at ? formatDateTime(selectedUser.created_at) : "Não informado"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status da conta</p>
                <p className="text-sm font-medium">
                  {selectedUser.role ? `Perfil: ${selectedUser.role}` : "Usuário"}
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {selectedUser ? (
              <Button
                variant="outline"
                size="sm"
                asChild
                disabled={!normalizePhoneForWhatsapp(selectedUser.phone)}
              >
                <a
                  href={
                    normalizePhoneForWhatsapp(selectedUser.phone)
                      ? `https://wa.me/${normalizePhoneForWhatsapp(selectedUser.phone)}?text=${encodeURIComponent(
                          `Olá ${selectedUser.full_name ?? ""}, tudo bem?`,
                        )}`
                      : "#"
                  }
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Abrir conversa no WhatsApp"
                >
                  Abrir conversa no WhatsApp
                </a>
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              ref={userModalFocusRef}
              onClick={() => setUserModalOpen(false)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
