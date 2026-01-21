import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        throw error;
      }

      toast.success("Enviamos um link de recuperação para o seu e-mail.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o e-mail de recuperação.";
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
            Recuperar senha
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Informe seu e-mail para receber o link de redefinição.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Enviando...
              </span>
            ) : (
              "Enviar link"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Lembrou a senha?{" "}
          <Link to="/auth" className="text-primary font-semibold hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
