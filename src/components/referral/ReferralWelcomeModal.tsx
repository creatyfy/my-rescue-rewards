import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Copy, Share2, Gift } from "lucide-react";
import {
  fetchMyReferralCode,
  hasReferralWelcomeBeenShown,
  markReferralWelcomeShown,
  buildReferralLink,
} from "@/integrations/supabase/referral";
import { supabase } from "@/integrations/supabase/client";

export function ReferralWelcomeModal() {
  const [open, setOpen] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;

      setUserId(user.id);

      const [alreadyShown, code] = await Promise.all([
        hasReferralWelcomeBeenShown(user.id),
        fetchMyReferralCode(),
      ]);

      if (!mounted) return;

      if (!alreadyShown && code) {
        setReferralLink(buildReferralLink(code));
        setOpen(true);
      }
    };

    init();
    return () => { mounted = false; };
  }, []);

  const handleClose = async () => {
    setOpen(false);
    if (userId) {
      await markReferralWelcomeShown(userId);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar. Copie manualmente.");
    }
    // Mark as shown after copying
    if (userId) {
      await markReferralWelcomeShown(userId);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Meu Resgate — Indicação",
          text: "Cadastre-se pelo meu link e ganhe pontos exclusivos!",
          url: referralLink,
        });
      } catch {
        // user cancelled or not supported
      }
    } else {
      await handleCopy();
    }
    if (userId) {
      await markReferralWelcomeShown(userId);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Gift className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            🎉 Seu link de convite exclusivo!
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Compartilhe e ganhe <span className="font-semibold text-primary">100 pontos</span> por cada amigo que se cadastrar.
          </DialogDescription>
        </DialogHeader>

        {/* Link box */}
        <div className="mt-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
          <p className="break-all text-xs text-foreground font-mono leading-relaxed">
            {referralLink}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-2">
          <Button onClick={handleCopy} className="w-full gap-2">
            <Copy className="h-4 w-4" />
            {copied ? "Copiado!" : "Copiar link"}
          </Button>
          <Button variant="outline" onClick={handleShare} className="w-full gap-2">
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
          <Button variant="ghost" onClick={handleClose} className="w-full text-muted-foreground">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
