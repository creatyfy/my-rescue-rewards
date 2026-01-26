import { useEffect, useMemo, useState } from "react";
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

export function AdminRedemptionsPanel() {
  const [redemptions, setRedemptions] = useState<AdminRedemption[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingRedemptionId, setUpdatingRedemptionId] = useState<string | null>(null);

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
      case "concluído":
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
            Concluído
          </span>
        );
      case "cancelled":
      case "cancelado":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            Cancelado
          </span>
        );
      case "em andamento":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pending/10 text-pending">
            Em andamento
          </span>
        );
      case "enviado":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pending/10 text-pending">
            Enviado
          </span>
        );
      case "solicitado":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pending/10 text-pending">
            Solicitado
          </span>
        );
      case "pendente":
      case "pending":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pending/10 text-pending">
            Pendente
          </span>
        );
    }
  };

  const getDeliverySummary = (redemption: AdminRedemption) => {
    const parts = [
      [redemption.delivery_address, redemption.delivery_number].filter(Boolean).join(", "),
      redemption.delivery_neighborhood,
      [redemption.delivery_city, redemption.delivery_state].filter(Boolean).join("/"),
      redemption.delivery_cep,
    ].filter((value) => value && value.trim().length > 0);

    if (parts.length === 0) {
      return "Não informado";
    }

    return parts.join(" • ");
  };

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
                {redemptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                      Nenhum resgate encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  redemptions.map((redemption) => {
                    const userInfo = userLookup.get(redemption.user_id);
                    return (
                      <TableRow key={redemption.id} className="hover:bg-muted/20">
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="font-medium text-foreground">
                              {userInfo?.fullName ?? "Usuário"}
                            </p>
                            <p className="text-xs text-muted-foreground">{userInfo?.email ?? "Sem email"}</p>
                            {userInfo?.phone && (
                              <p className="text-xs text-muted-foreground">{userInfo.phone}</p>
                            )}
                          </div>
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
                              <SelectItem value="pendente">Pendente</SelectItem>
                              <SelectItem value="solicitado">Solicitado</SelectItem>
                              <SelectItem value="em andamento">Em andamento</SelectItem>
                              <SelectItem value="enviado">Enviado</SelectItem>
                              <SelectItem value="cancelado">Cancelado</SelectItem>
                              <SelectItem value="concluído">Concluído</SelectItem>
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
    </div>
  );
}
