import { useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail } from "lucide-react";

interface RedemptionSuccessModalProps {
  open: boolean;
  onClose: () => void;
  userName: string | null;
}

export function RedemptionSuccessModal({
  open,
  onClose,
  userName,
}: RedemptionSuccessModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open && closeButtonRef.current) {
      // Small delay to ensure dialog is fully mounted
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const displayName = userName || "Usuário";
  const supportEmail = "suporte@meuresgate.com";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        role="dialog"
        aria-modal="true"
        showCloseButton={false}
        className="sm:max-w-md"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          closeButtonRef.current?.focus();
        }}
      >
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold">
            Parabéns, {displayName}! 🎉
          </DialogTitle>
          <DialogDescription className="text-base">
            Você acaba de solicitar um resgate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 text-center text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Sua solicitação está em análise.</strong>
            <br />
            Você pode acompanhar o status do seu resgate na aba{" "}
            <span className="font-medium text-foreground">Histórico</span>, disponível na página inicial.
          </p>

          <p className="text-base">Agora é só aguardar. 😉</p>

          <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Em caso de dúvidas
            </p>
            <div className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href={`mailto:${supportEmail}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {supportEmail}
              </a>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            ref={closeButtonRef}
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
