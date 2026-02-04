import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import {
  fetchAdminUsers,
  promoteUserToAdmin,
  demoteAdminToUser,
  adminDeleteUser,
  type AdminUser,
} from "@/integrations/supabase/admin";
import { supabase } from "@/integrations/supabase/client";
import { Search, ShieldCheck, ShieldOff, User, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { UserProfileModal } from "./UserProfileModal";

export function AdminUsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Confirmation dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"promote" | "demote" | "delete" | null>(null);
  const [targetUser, setTargetUser] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // User profile modal state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const userModalTriggerRef = useRef<HTMLButtonElement>(null);
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      toast.error("Não foi possível carregar a lista de usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentUserId(data.user.id);
      }
    };

    loadCurrentUser();
    loadUsers();
  }, []);

  const handleOpenPromote = (user: AdminUser) => {
    setTargetUser(user);
    setDialogAction("promote");
    setDialogOpen(true);
  };

  const handleOpenDemote = (user: AdminUser) => {
    setTargetUser(user);
    setDialogAction("demote");
    setDialogOpen(true);
  };

  const handleOpenDelete = (user: AdminUser) => {
    setTargetUser(user);
    setDialogAction("delete");
    setDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!targetUser || !dialogAction) return;

    setActionLoading(true);
    try {
      if (dialogAction === "promote") {
        const result = await promoteUserToAdmin(targetUser.user_id);
        if (result) {
          toast.success(`${targetUser.full_name || targetUser.email} foi promovido a administrador.`);
        } else {
          toast.info("Usuário já é administrador.");
        }
      } else if (dialogAction === "demote") {
        const result = await demoteAdminToUser(targetUser.user_id);
        if (result) {
          toast.success(`${targetUser.full_name || targetUser.email} foi rebaixado a usuário comum.`);
        } else {
          toast.info("Usuário já é usuário comum.");
        }
      } else if (dialogAction === "delete") {
        await adminDeleteUser(targetUser.user_id);
        toast.success(`Conta de ${targetUser.full_name || targetUser.email} foi excluída.`);
      }

      await loadUsers();
    } catch (err) {
      console.error("Erro na ação:", err);
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Não foi possível executar a ação: ${message}`);
    } finally {
      setActionLoading(false);
      setDialogOpen(false);
      setTargetUser(null);
      setDialogAction(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.full_name ?? "").toLowerCase().includes(q)
    );
  });

  const handleOpenUserModal = (userId: string, trigger?: HTMLButtonElement | null) => {
    userModalTriggerRef.current = trigger ?? null;
    setSelectedUserId(userId);
    setUserModalOpen(true);
  };
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-semibold text-lg text-foreground">
            Gerenciamento de usuários
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize e gerencie permissões de acesso.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {search ? "Nenhum usuário encontrado." : "Não há usuários cadastrados."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Usuário</TableHead>
                <TableHead className="whitespace-nowrap hidden sm:table-cell">Email</TableHead>
                <TableHead className="whitespace-nowrap">Função</TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">Cadastro</TableHead>
                <TableHead className="text-right whitespace-nowrap">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const isCurrentUser = user.user_id === currentUserId;
                const isAdmin = user.role === "admin";

                return (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">
                      <button
                        type="button"
                        className="flex items-center gap-2 text-left text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                        aria-label={`Ver dados do usuário ${user.full_name ?? user.email}`}
                        onClick={(event) => handleOpenUserModal(user.user_id, event.currentTarget)}
                      >
                        {isAdmin ? (
                          <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <span className="block truncate">{user.full_name || "—"}</span>
                          <span className="block text-xs text-muted-foreground truncate sm:hidden">
                            {user.email}
                          </span>
                        </div>
                      </button>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isAdmin ? "default" : "secondary"}>
                        {isAdmin ? "Admin" : "Usuário"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm hidden md:table-cell">
                      {format(new Date(user.created_at), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      {isCurrentUser ? (
                        <span className="text-xs text-muted-foreground">Você</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {isAdmin ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDemote(user)}
                            >
                              <ShieldOff className="h-4 w-4 sm:mr-1" />
                              <span className="hidden sm:inline">Rebaixar</span>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleOpenPromote(user)}
                            >
                              <ShieldCheck className="h-4 w-4 sm:mr-1" />
                              <span className="hidden sm:inline">Promover</span>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleOpenDelete(user)}
                          >
                            <Trash2 className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Deletar</span>
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === "promote"
                ? "Promover a Administrador"
                : dialogAction === "demote"
                ? "Rebaixar a Usuário"
                : "Deletar conta permanentemente?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === "promote" ? (
                <>
                  Tem certeza que deseja promover{" "}
                  <strong>{targetUser?.full_name || targetUser?.email}</strong> a
                  administrador? Essa pessoa terá acesso total ao painel administrativo.
                </>
              ) : dialogAction === "demote" ? (
                <>
                  Tem certeza que deseja rebaixar{" "}
                  <strong>{targetUser?.full_name || targetUser?.email}</strong> a usuário
                  comum? Essa pessoa perderá acesso ao painel administrativo.
                </>
              ) : (
                <>
                  Esta ação é <strong>irreversível</strong>. Todos os dados pessoais de{" "}
                  <strong>{targetUser?.full_name || targetUser?.email}</strong> serão
                  apagados (nome, e-mail, telefone, foto).
                  <br /><br />
                  Os registros de transações serão mantidos de forma anônima para relatórios.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={actionLoading}
              className={dialogAction === "delete" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {actionLoading ? "Processando..." : dialogAction === "delete" ? "Confirmar exclusão" : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UserProfileModal
        open={userModalOpen}
        onOpenChange={setUserModalOpen}
        userId={selectedUserId}
        triggerRef={userModalTriggerRef}
      />
    </Card>
  );
}
