import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setHasRecoverySession(true);
      }

      if (session) {
        setHasRecoverySession(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setHasRecoverySession(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const canSubmit = useMemo(
    () => password.length >= 6 && confirmPassword.length >= 6 && hasRecoverySession,
    [password, confirmPassword, hasRecoverySession]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não conferem.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      toast.success("Senha atualizada com sucesso! Faça login novamente.");
      navigate("/auth");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a senha.";
      toast.error(message);
    } finally {
      setIsLoading(false);
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
          Voltar ao login
        </Link>
      </header>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-sm mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-primary">
            <span className="text-primary-foreground font-display font-bold text-2xl">
              MR
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Redefinir senha
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Digite sua nova senha para concluir a recuperação.
          </p>
        </div>

        {!hasRecoverySession && (
          <div className="mb-6 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 p-4 text-sm text-muted-foreground">
            Acesse esta página usando o link enviado por e-mail para concluir a
            recuperação de senha.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="pl-10 pr-10"
                required
                disabled={!hasRecoverySession}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="pl-10"
                required
                disabled={!hasRecoverySession}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Atualizando...
              </span>
            ) : (
              "Atualizar senha"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
