import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { toast } from "@/components/ui/sonner";
import { deleteCurrentUserData, logoutCurrentUser } from "@/integrations/supabase/profile";

export function DeleteAccountDialog() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteCurrentUserData();
      await logoutCurrentUser();
      toast.success("Conta excluída com sucesso.");
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      toast.error("Não foi possível excluir sua conta. Tente novamente.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <SidebarMenuItem>
        <AlertDialogTrigger asChild>
          <SidebarMenuButton
            tooltip="Deletar conta"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span>Deletar conta</span>
          </SidebarMenuButton>
        </AlertDialogTrigger>
      </SidebarMenuItem>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deletar conta permanentemente?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação é <strong>irreversível</strong>. Todos os seus dados pessoais
            serão apagados, incluindo nome, e-mail, telefone e foto de perfil.
            <br /><br />
            Os registros de transações serão mantidos de forma anônima para fins
            de relatórios e análises.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Confirmar exclusão"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
