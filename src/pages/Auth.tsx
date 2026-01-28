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
import { getDuplicateFieldMessage } from "@/lib/duplicate-errors";

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

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    const part1 = digits.slice(0, 3);
    const part2 = digits.slice(3, 6);
    const part3 = digits.slice(6, 9);
    const part4 = digits.slice(9, 11);

    if (!part2) {
      return part1;
    }

    if (!part3) {
      return `${part1}.${part2}`;
    }

    if (!part4) {
      return `${part1}.${part2}.${part3}`;
    }

    return `${part1}.${part2}.${part3}-${part4}`;
  };

  const getCpfDigits = (value: string) => value.replace(/\D/g, "").slice(0, 11);

  const getPhoneDigits = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits.startsWith("55") ? digits.slice(2, 13) : digits.slice(0, 11);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPhoneError(null);

    try {
      const cpfDigits = getCpfDigits(formData.cpf);
      const formattedCpf = formatCpf(cpfDigits);
      const phoneDigits = getPhoneDigits(formData.phone);
      const normalizedPhone = phoneDigits ? `55${phoneDigits}` : "";
      const normalizedEmail = formData.email.trim().toLowerCase();

      if (mode === "register" && formData.password !== formData.confirmPassword) {
        toast.error("As senhas não conferem.");
        return;
      }

      // Validate phone for registration
      if (mode === "register" && normalizedPhone) {
        const validationError = getPhoneValidationError(normalizedPhone);
        if (validationError) {
          setPhoneError(validationError);
          toast.error(validationError);
          return;
        }
      }

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: formData.password,
        });

        if (error) {
          throw error;
        }

        navigate("/dashboard");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.name,
            cpf: formattedCpf,
            phone: normalizedPhone,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        await updateCurrentUserProfile({
          fullName: formData.name,
          cpf: formattedCpf,
          phone: normalizedPhone,
        });
        navigate("/dashboard");
      } else {
        toast.success("Conta criada! Verifique seu e-mail para confirmar.");
      }
    } catch (error) {
      const duplicateMessage = getDuplicateFieldMessage(error);
      if (duplicateMessage) {
        toast.error(duplicateMessage);
        return;
      }

      const message = error instanceof Error ? error.message : "";
      toast.error(message || "Não foi possível autenticar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "cpf") {
      const digits = getCpfDigits(value);
      setFormData({ ...formData, cpf: formatCpf(digits) });
      return;
    }

    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 11);
      setFormData({ ...formData, phone: digits ? `55${digits}` : "" });
      return;
    }

    setFormData({ ...formData, [name]: value });
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
                  maxLength={14}
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
                <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  55
                </span>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="35988925480"
                  value={getPhoneDigits(formData.phone)}
                  onChange={handleChange}
                  className={`pl-16 ${phoneError ? "border-destructive" : ""}`}
                  inputMode="numeric"
                  maxLength={11}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                O código do país 55 já está incluso. Digite DDD + número (11 dígitos).
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
