import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getAppBaseUrl } from "@/lib/app-url";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import logoHorizontal from "@/assets/logo-horizontal.png";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useRef } from "react";

export default function VerifyEmail() {
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? "";
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileWidgetId = useRef<string | null>(null);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const resetTurnstile = () => {
    if (turnstileWidgetId.current && window.turnstile) {
      try {
        window.turnstile.reset(turnstileWidgetId.current);
      } catch {
        turnstileWidgetId.current = null;
      }
    }
    setTurnstileToken("");
  };

  const handleResend = async () => {
    if (!email) return;

    if (turnstileSiteKey && !turnstileToken) {
      setError("Confirme o desafio de segurança antes de reenviar.");
      return;
    }

    setIsResending(true);
    setError("");

    try {
      const { data, error: invokeError } = await supabase.functions.invoke("resend-confirmation", {
        body: {
          email: email.trim().toLowerCase(),
          turnstileToken,
          redirectTo: `${getAppBaseUrl()}/dashboard`,
        },
      });

      if (invokeError) {
        const errorData = data as { errors?: string[] } | null;
        throw new Error(errorData?.errors?.[0] || invokeError.message || "Erro ao reenviar.");
      }

      setResent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível reenviar o e-mail.");
    } finally {
      resetTurnstile();
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4">
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o login
        </Link>
      </header>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-sm mx-auto w-full text-center">
        <img
          src={logoHorizontal}
          alt="Meu Resgate"
          className="h-10 w-auto mx-auto mb-8"
        />

        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="w-10 h-10 text-primary" />
        </div>

        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          Verifique seu e-mail
        </h1>

        <p className="text-muted-foreground mb-2">
          Enviamos um link de confirmação para:
        </p>

        {email && (
          <p className="font-semibold text-foreground mb-6">{email}</p>
        )}

        <div className="bg-accent/50 rounded-xl p-4 mb-6 text-left">
          <h3 className="font-semibold text-sm text-foreground mb-2">Próximos passos:</h3>
          <ol className="text-xs text-muted-foreground space-y-1">
            <li>1. Acesse sua caixa de entrada</li>
            <li>2. Clique no link de confirmação</li>
            <li>3. Você será redirecionado para o login</li>
          </ol>
        </div>

        {resent ? (
          <div className="flex items-center justify-center gap-2 text-sm text-success mb-4">
            <CheckCircle className="w-4 h-4" />
            E-mail reenviado com sucesso!
          </div>
        ) : (
          <>
            {turnstileSiteKey && (
              <div className="mb-4">
                <TurnstileWidget
                  siteKey={turnstileSiteKey}
                  onVerify={(token) => {
                    setTurnstileToken(token);
                    setError("");
                  }}
                  onExpire={() => setTurnstileToken("")}
                  onError={() => setTurnstileToken("")}
                  onWidgetId={(id) => {
                    turnstileWidgetId.current = id;
                  }}
                  className="w-full flex justify-center"
                />
              </div>
            )}

            <Button
              onClick={handleResend}
              variant="outline"
              className="w-full"
              disabled={isResending || !email}
            >
              {isResending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Reenviando...
                </span>
              ) : (
                "Reenviar e-mail de confirmação"
              )}
            </Button>
          </>
        )}

        {error && (
          <p className="text-sm text-destructive mt-3">{error}</p>
        )}

        <p className="text-xs text-muted-foreground mt-6">
          Não recebeu? Verifique a pasta de spam ou lixo eletrônico.
        </p>
      </div>
    </div>
  );
}
