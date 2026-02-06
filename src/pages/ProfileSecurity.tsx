import { useRef, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { updateCurrentUserPassword } from "@/integrations/supabase/profile";
import { TurnstileWidget } from "@/components/TurnstileWidget";

export default function ProfileSecurity() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState("");
  const turnstileWidgetId = useRef<string | null>(null);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const resetTurnstile = () => {
    if (turnstileWidgetId.current && window.turnstile) {
      window.turnstile.reset(turnstileWidgetId.current);
    }
    setTurnstileToken("");
    setTurnstileError("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentPassword || !newPassword) {
      toast.error("Preencha todos os campos para continuar.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("A confirmação da senha não confere.");
      return;
    }

    if (turnstileSiteKey && !turnstileToken) {
      toast.error("Confirme o desafio de segurança para continuar.");
      return;
    }

    setIsSaving(true);

    try {
      await updateCurrentUserPassword({
        currentPassword,
        newPassword,
        turnstileToken,
      });
      toast.success("Senha atualizada com sucesso.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      toast.error("Não foi possível atualizar sua senha.");
    } finally {
      resetTurnstile();
      setIsSaving(false);
    }
  };

  return (
    <AppLayout title="Segurança" showBack>
      <div className="container px-4 py-6 space-y-6">
        <div className="bg-card border border-border/50 rounded-2xl shadow-soft p-6 space-y-4">
          <div>
            <h2 className="font-display font-semibold text-lg text-foreground">
              Alterar senha
            </h2>
            <p className="text-sm text-muted-foreground">
              Utilize uma senha forte com letras, números e símbolos.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Digite sua senha atual"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Crie uma nova senha"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repita a nova senha"
              />
            </div>
            <div className="space-y-2">
              <Label>Verificação de segurança</Label>
              <TurnstileWidget
                siteKey={turnstileSiteKey}
                onVerify={(token) => {
                  setTurnstileToken(token);
                  setTurnstileError("");
                }}
                onExpire={() => setTurnstileError("O desafio expirou. Tente novamente.")}
                onError={() => setTurnstileError("Não foi possível validar o captcha.")}
                onWidgetId={(id) => {
                  turnstileWidgetId.current = id;
                }}
              />
              {turnstileError ? (
                <p className="text-sm text-destructive">{turnstileError}</p>
              ) : null}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSaving || (!!turnstileSiteKey && !turnstileToken)}
            >
              {isSaving ? "Atualizando..." : "Atualizar senha"}
            </Button>
          </form>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-6">
          <h3 className="font-display font-semibold text-base text-foreground mb-2">
            Dicas de segurança
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Não compartilhe sua senha com terceiros.</li>
            <li>• Altere sua senha sempre que suspeitar de acessos indevidos.</li>
            <li>• Utilize combinações únicas para cada aplicativo.</li>
          </ul>
        </div>

        <section className="bg-card border border-border/50 rounded-2xl shadow-soft p-4 sm:p-6">
          <h2 className="font-display font-semibold text-lg text-foreground mb-4">
            Resumo de privacidade
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Seus dados são usados apenas para validar compras, contabilizar pontos
              e melhorar sua experiência.
            </p>
            <p>
              Você pode atualizar suas preferências a qualquer momento. Para dúvidas
              adicionais, fale com nosso suporte.
            </p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
