import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle } from "lucide-react";
import { fetchAdminUserDetails, type AdminReceiptUser } from "@/integrations/supabase/admin";
import { buildWhatsAppUrl, openWhatsApp } from "@/lib/phone-utils";

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

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  triggerRef?: React.RefObject<HTMLButtonElement>;
}

export function UserProfileModal({ open, onOpenChange, userId, triggerRef }: UserProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AdminReceiptUser | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open || !userId) {
      return;
    }

    const loadUser = async () => {
      setLoading(true);
      setError(null);
      setUser(null);

      try {
        const data = await fetchAdminUserDetails(userId);
        if (!data) {
          setError("Não foi possível carregar os dados do usuário.");
          return;
        }
        setUser(data);
      } catch (err) {
        console.error("Erro ao carregar dados do usuário:", err);
        setError("Não foi possível carregar os dados do usuário.");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [open, userId]);

  useEffect(() => {
    if (open) {
      const handle = window.setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);
      return () => window.clearTimeout(handle);
    }

    // Return focus to trigger on close
    if (triggerRef?.current) {
      triggerRef.current.focus();
    }
  }, [open, triggerRef]);

  const handleClose = () => {
    onOpenChange(false);
    setUser(null);
    setError(null);
  };

  const message = user ? `Olá ${user.full_name ?? ""}, tudo bem?` : "";
  const whatsappUrl = user ? buildWhatsAppUrl(user.phone, message) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl" role="dialog" aria-modal="true">
        <DialogHeader>
          <DialogTitle>Dados do usuário</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Carregando dados do usuário...</span>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : user ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Nome completo</p>
              <p className="text-sm font-medium">{user.full_name ?? "Não informado"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">CPF</p>
              <p className="text-sm font-medium">{user.cpf ?? "Não informado"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">E-mail</p>
              <p className="text-sm font-medium">{user.email ?? "Não informado"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Telefone</p>
              <p className="text-sm font-medium">{user.phone ?? "Não informado"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Data de cadastro</p>
              <p className="text-sm font-medium">{formatDateTime(user.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status da conta</p>
              <p className="text-sm font-medium">
                {user.role ? `Perfil: ${user.role}` : "Usuário"}
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {user && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              disabled={!whatsappUrl}
              className={!whatsappUrl ? "pointer-events-none opacity-50" : ""}
              onClick={() => openWhatsApp(user.phone, message)}
            >
              <MessageCircle className="h-4 w-4 mr-1.5" />
              {whatsappUrl ? "Abrir conversa no WhatsApp" : "Usuário sem telefone cadastrado"}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            ref={closeButtonRef}
            onClick={handleClose}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
