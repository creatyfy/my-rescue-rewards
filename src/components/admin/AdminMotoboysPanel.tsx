import { useEffect, useState } from "react";
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
import { toast } from "@/components/ui/sonner";
import {
  fetchMotoboyInvites,
  inviteMotoboy,
  removeMotoboyInvite,
  type MotoboyInvite,
} from "@/integrations/supabase/admin";
import { Bike, Loader2, Trash2, UserPlus } from "lucide-react";

export function AdminMotoboysPanel() {
  const [invites, setInvites] = useState<MotoboyInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setInvites(await fetchMotoboyInvites());
    } catch (error) {
      console.error("Erro ao carregar motoboys:", error);
      toast.error("Não foi possível carregar os motoboys.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    const value = email.trim().toLowerCase();
    if (!value || !value.includes("@")) {
      toast.error("Informe um e-mail válido.");
      return;
    }
    try {
      setAdding(true);
      const result = await inviteMotoboy(value);
      if (result === "promoted") {
        toast.success("Conta encontrada! Já virou motoboy.");
      } else {
        toast.success("E-mail autorizado. Vira motoboy assim que a conta for criada.");
      }
      setEmail("");
      await load();
    } catch (error) {
      const msg = (error as { message?: string }).message ?? "Não foi possível autorizar.";
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (invite: MotoboyInvite) => {
    try {
      setRemoving(invite.email);
      await removeMotoboyInvite(invite.email, invite.user_id, invite.is_active);
      toast.success("Motoboy removido.");
      await load();
    } catch (error) {
      const msg = (error as { message?: string }).message ?? "Não foi possível remover.";
      toast.error(msg);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
          <Bike className="h-5 w-5 text-primary" /> Motoboys
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Autorize entregadores pelo e-mail. Quando a pessoa criar a conta com esse e-mail, o
          acesso de motoboy é liberado automaticamente. Se a conta já existir, ela vira motoboy na
          hora.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center mb-6">
        <Input
          type="email"
          placeholder="email@domotoboy.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          className="flex-1"
        />
        <Button onClick={handleAdd} disabled={adding}>
          <UserPlus className="h-4 w-4 mr-1" />
          {adding ? "Autorizando..." : "Autorizar motoboy"}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : invites.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum motoboy autorizado ainda.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">E-mail</TableHead>
                <TableHead className="whitespace-nowrap">Nome</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="text-right whitespace-nowrap">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invites.map((inv) => (
                <TableRow key={inv.email}>
                  <TableCell className="font-medium">{inv.email}</TableCell>
                  <TableCell className="text-muted-foreground">{inv.full_name ?? "—"}</TableCell>
                  <TableCell>
                    {inv.is_active ? (
                      <Badge variant="default">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Aguardando cadastro</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemove(inv)}
                      disabled={removing === inv.email}
                    >
                      <Trash2 className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Remover</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
