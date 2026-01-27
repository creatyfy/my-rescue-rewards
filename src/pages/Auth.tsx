import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { updateCurrentUserProfile } from "@/integrations/supabase/profile";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Phone, FileText } from "lucide-react";
import logoHorizontal from "@/assets/logo-horizontal.png";
import { getPhoneValidationError } from "@/lib/phone-utils";

type AuthMode = "login" | "register";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const requestedMode = searchParams.get("mode");

    if (requestedMode === "register") {
      setMode("register");
      return;
    }

    if (requestedMode === "login") {
      setMode("login");
    }
  }, [searchParams]);

  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPhoneError(null);

    try {
      if (mode === "register" && formData.password !== formData.confirmPassword) {
        toast.error("As senhas não conferem.");
        return;
      }

      // Validate phone for registration
      if (mode === "register" && formData.phone) {
        const validationError = getPhoneValidationError(formData.phone);
        if (validationError) {
          setPhoneError(validationError);
          toast.error(validationError);
          return;
        }
      }

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          throw error;
        }

        navigate("/dashboard");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.name,
            cpf: formData.cpf,
            phone: formData.phone,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        await updateCurrentUserProfile({
          fullName: formData.name,
          cpf: formData.cpf,
          phone: formData.phone,
        });
        navigate("/dashboard");
      } else {
        toast.success("Conta criada! Verifique seu e-mail para confirmar.");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível autenticar. Tente novamente.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </header>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-sm mx-auto w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src={logoHorizontal} 
            alt="Meu Resgate" 
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="font-display text-2xl font-bold text-foreground">
            {mode === "login" ? "Bem-vindo de volta!" : "Criar conta"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login"
              ? "Entre na sua conta para continuar"
              : "Preencha seus dados para começar"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="cpf"
                  name="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="5511912345678"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`pl-10 ${phoneError ? "border-destructive" : ""}`}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Inclua o código do país 55. Ex: 5511912345678
              </p>
              {phoneError && (
                <p className="text-xs text-destructive">{phoneError}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-10"
                required
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

          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          {mode === "login" && (
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                {mode === "login" ? "Entrando..." : "Criando conta..."}
              </span>
            ) : mode === "login" ? (
              "Entrar"
            ) : (
              "Criar conta"
            )}
          </Button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === "login" ? (
            <>
              Não tem uma conta?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-primary font-semibold hover:underline"
              >
                Cadastre-se
              </button>
            </>
          ) : (
            <>
              Já tem uma conta?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-primary font-semibold hover:underline"
              >
                Entrar
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
