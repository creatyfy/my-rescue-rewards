import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import {
  AdminProfile,
  AdminRedemption,
  AdminUser,
  fetchAdminProfiles,
  fetchAdminRedemptions,
  fetchAdminUsers,
  updateAdminRedemptionStatus,
} from "@/integrations/supabase/admin";
import { UserProfileModal } from "./UserProfileModal";

export function AdminRedemptionsPanel() {
  const [redemptions, setRedemptions] = useState<AdminRedemption[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingRedemptionId, setUpdatingRedemptionId] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<AdminRedemption["status"]>("em_analise");

  // User profile modal state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const userModalTriggerRef = useRef<HTMLButtonElement>(null);

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

  const handleOpenUserModal = (userId: string, trigger?: HTMLButtonElement | null) => {
    userModalTriggerRef.current = trigger ?? null;
    setSelectedUserId(userId);
    setUserModalOpen(true);
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
      const message = (error as { message?: string }).message ?? "Não foi possível atualizar o resgate.";
      toast.error(message);
    } finally {
      setUpdatingRedemptionId(null);
    }
  };

  const getStatusBadge = (status: AdminRedemption["status"]) => {
    switch (status) {
      case "concluido":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
            Concluído
          </span>
        );
      case "cancelado":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            Cancelado
          </span>
        );
      case "em_analise":
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
      value: "em_analise",
      label: "Em análise",
      emptyMessage: "Nenhum resgate em análise no momento.",
    },
    {
      value: "concluido",
      label: "Concluído",
      emptyMessage: "Nenhum resgate concluído no momento.",
    },
    {
      value: "cancelado",
      label: "Cancelado",
      emptyMessage: "Nenhum resgate cancelado no momento.",
    },
  ];


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
                    const isFinalStatus = redemption.status !== "em_analise";
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
                            disabled={updatingRedemptionId === redemption.id || isFinalStatus}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                              <SelectItem value="em_analise">Em análise</SelectItem>
                              <SelectItem value="concluido">Concluído</SelectItem>
                              <SelectItem value="cancelado">Cancelado</SelectItem>
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

      <UserProfileModal
        open={userModalOpen}
        onOpenChange={setUserModalOpen}
        userId={selectedUserId}
        triggerRef={userModalTriggerRef}
      />
    </div>
  );
}
