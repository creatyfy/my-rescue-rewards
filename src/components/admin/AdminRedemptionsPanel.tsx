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

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-bold text-foreground">Resgates</h2>
        <p className="text-sm text-muted-foreground">
          Controle os resgates realizados pelos usuários e atualize o status de envio.
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
                  <TableHead className="font-semibold text-foreground whitespace-nowrap">Status</TableHead>
                  <TableHead className="font-semibold text-foreground whitespace-nowrap">Data</TableHead>
                  <TableHead className="font-semibold text-foreground whitespace-nowrap">Entrega</TableHead>
                  <TableHead className="font-semibold text-foreground whitespace-nowrap">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redemptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                      Nenhum resgate encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  redemptions.map((redemption) => {
                    const userInfo = userLookup.get(redemption.user_id);
                    const statusLabel =
                      redemption.status === "completed"
                        ? "Concluído"
                        : redemption.status === "cancelled"
                          ? "Cancelado"
                          : "Pendente";
                    return (
                      <TableRow key={redemption.id} className="hover:bg-muted/20">
                        <TableCell className="font-medium">
                          {userInfo?.fullName ?? "Usuário"}
                          <div className="text-xs text-muted-foreground">{userInfo?.email ?? "Sem email"}</div>
                        </TableCell>
                        <TableCell>{redemption.product_name ?? "Prêmio resgatado"}</TableCell>
                        <TableCell className="text-sm font-medium text-muted-foreground">{statusLabel}</TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(redemption.created_at).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-normal">
                          —
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
                              <SelectItem value="pending">Pendente</SelectItem>
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
    </div>
  );
}
