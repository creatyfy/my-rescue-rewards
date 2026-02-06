import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAppBaseUrl } from "@/lib/app-url";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Phone, FileText } from "lucide-react";
import logoHorizontal from "@/assets/logo-horizontal.png";
import { getDuplicateFieldMessage } from "@/lib/duplicate-errors";
import { TurnstileWidget } from "@/components/TurnstileWidget";

type AuthMode = "login" | "register";
type UniqueFieldKey = "cpf" | "email" | "phone";
type ValidationStatus = "idle" | "loading" | "valid" | "invalid";
type LoginAuthStatus = "success" | "pending_confirmation" | "error";
type UniqueFieldValidation = Record<
  UniqueFieldKey,
  {
    status: ValidationStatus;
    message: string;
  }
>;

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState("");
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const turnstileWidgetId = useRef<string | null>(null);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

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

  const [fieldValidation, setFieldValidation] = useState<UniqueFieldValidation>({
    cpf: { status: "idle", message: "" },
    email: { status: "idle", message: "" },
    phone: { status: "idle", message: "" },
  });
  const validationRequestId = useRef({
    cpf: 0,
    email: 0,
    phone: 0,
  });

  useEffect(() => {
    if (mode === "login") {
      setFieldValidation({
        cpf: { status: "idle", message: "" },
        email: { status: "idle", message: "" },
        phone: { status: "idle", message: "" },
      });
    }
  }, [mode]);

  const resetTurnstile = () => {
    if (turnstileWidgetId.current && window.turnstile) {
      window.turnstile.reset(turnstileWidgetId.current);
    }
    setTurnstileToken("");
    setTurnstileError("");
  };

  useEffect(() => {
    resetTurnstile();
  }, [mode]);

  const getErrorMessage = (payload: unknown) => {
    if (typeof payload === "object" && payload !== null) {
      const data = payload as { errors?: string[]; message?: string };
      if (Array.isArray(data.errors) && data.errors[0]) {
        return data.errors[0];
      }
      if (data.message) {
        return data.message;
      }
    }
    return "";
  };

  const callAuthFunction = async (path: string, body: Record<string, unknown>) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Configuração do servidor inválida.");
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    return { response, data };
  };

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

  const getNormalizedValue = (field: UniqueFieldKey, value: string) => {
    if (field === "cpf") {
      return getCpfDigits(value);
    }

    if (field === "phone") {
      const digits = getPhoneDigits(value);
      return digits ? `55${digits}` : "";
    }

    return value.trim().toLowerCase();
  };

  const isValidEmailFormat = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return false;
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  };

  const shouldValidateField = (field: UniqueFieldKey, value: string) => {
    if (field === "cpf") {
      return getCpfDigits(value).length === 11;
    }

    if (field === "phone") {
      const digits = getPhoneDigits(value);
      return digits.length === 11;
    }

    return isValidEmailFormat(value);
  };

  const setFieldValidationState = (
    field: UniqueFieldKey,
    status: ValidationStatus,
    message = "",
  ) => {
    setFieldValidation((prev) => ({
      ...prev,
      [field]: { status, message },
    }));
  };

  const getValidationMessage = (field: UniqueFieldKey) => {
    if (field === "cpf") {
      return "Este CPF já está cadastrado.";
    }

    if (field === "phone") {
      return "Este telefone já está vinculado a outra conta.";
    }

    return "Este e-mail já está cadastrado.";
  };

  const validateUniqueField = async (field: UniqueFieldKey, value: string) => {
    if (!shouldValidateField(field, value)) {
      setFieldValidationState(field, "idle");
      return "idle";
    }

    const normalizedValue = getNormalizedValue(field, value);
    const requestId = ++validationRequestId.current[field];
    setFieldValidationState(field, "loading");

    try {
      const functionName =
        field === "cpf"
          ? "validar-cpf"
          : field === "phone"
            ? "validar-telefone"
            : "validar-email";
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          valor: normalizedValue,
        },
      });

      if (requestId !== validationRequestId.current[field]) {
        return "idle";
      }

      if (error) {
        const status = (error as { context?: { status?: number } }).context?.status;
        if (status === 409) {
          setFieldValidationState(field, "invalid", getValidationMessage(field));
          return "invalid";
        }
        setFieldValidationState(field, "idle");
        return "idle";
      }

      if (data?.disponivel) {
        setFieldValidationState(field, "valid", "Disponível");
        return "valid";
      }
      setFieldValidationState(field, "invalid", getValidationMessage(field));
      return "invalid";
    } catch (validationError) {
      if (requestId !== validationRequestId.current[field]) {
        return "idle";
      }

      setFieldValidationState(field, "idle");
      return "idle";
    }
  };

  useEffect(() => {
    if (mode !== "register") {
      return;
    }

    if (!shouldValidateField("cpf", formData.cpf)) {
      setFieldValidationState("cpf", "idle");
      return;
    }

    const timeout = window.setTimeout(() => {
      void validateUniqueField("cpf", formData.cpf);
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [formData.cpf, mode]);

  useEffect(() => {
    if (mode !== "register") {
      return;
    }

    if (!shouldValidateField("phone", formData.phone)) {
      setFieldValidationState("phone", "idle");
      return;
    }

    const timeout = window.setTimeout(() => {
      void validateUniqueField("phone", formData.phone);
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [formData.phone, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cpfDigits = getCpfDigits(formData.cpf);
      const phoneDigits = getPhoneDigits(formData.phone);
      const normalizedEmail = formData.email.trim().toLowerCase();

      if (mode === "register" && formData.password !== formData.confirmPassword) {
        toast.error("As senhas não conferem.");
        return;
      }

      if (
        mode === "register" &&
        (fieldValidation.cpf.status === "loading" ||
          fieldValidation.email.status === "loading" ||
          fieldValidation.phone.status === "loading")
      ) {
        toast.error("Aguarde a validação dos campos.");
        return;
      }

      if (
        mode === "register" &&
        (fieldValidation.cpf.status === "invalid" ||
          fieldValidation.email.status === "invalid" ||
          fieldValidation.phone.status === "invalid")
      ) {
        toast.error("Corrija os campos antes de continuar.");
        return;
      }

      if (!turnstileSiteKey) {
        toast.error("Captcha indisponível no momento.");
        return;
      }

      if (!turnstileToken) {
        toast.error("Confirme o desafio de segurança antes de continuar.");
        return;
      }

      if (mode === "register" && !isValidEmailFormat(formData.email)) {
        setFieldValidationState("email", "invalid", "Informe um e-mail válido.");
        return;
      }

      if (mode === "register") {
        const validationResults = await Promise.all([
          fieldValidation.cpf.status === "valid"
            ? "valid"
            : validateUniqueField("cpf", formData.cpf),
          fieldValidation.phone.status === "valid"
            ? "valid"
            : validateUniqueField("phone", formData.phone),
          fieldValidation.email.status === "valid"
            ? "valid"
            : validateUniqueField("email", formData.email),
        ]);

        if (validationResults.some((status) => status === "invalid")) {
          return;
        }
      }

      if (mode === "login") {
        const loginResult = await authenticateLoginWithEmailConfirmation(
          normalizedEmail,
          formData.password,
        );

        if (loginResult.status === "pending_confirmation") {
          setPendingConfirmationEmail(normalizedEmail);
          toast.error(
            loginResult.message ||
              "Seu cadastro ainda não foi confirmado por e-mail.",
          );
          return;
        }

        if (loginResult.status === "error") {
          throw new Error(loginResult.message || "Não foi possível autenticar.");
        }

        setPendingConfirmationEmail("");
        navigate("/dashboard");
        return;
      }

      const { response, data } = await callAuthFunction("register-user", {
        full_name: formData.name,
        email: normalizedEmail,
        cpf: cpfDigits,
        phone: phoneDigits,
        password: formData.password,
        turnstileToken,
      });

      if (!response.ok) {
        const message = getErrorMessage(data);
        throw new Error(message || "Não foi possível concluir o cadastro.");
      }

      setPendingConfirmationEmail(normalizedEmail);
      toast.success(
        getErrorMessage(data) ||
          "Cadastro realizado! Verifique seu e-mail para confirmar a conta.",
      );
    } catch (error) {
      const duplicateMessage = getDuplicateFieldMessage(error);
      if (duplicateMessage) {
        toast.error(duplicateMessage);
        return;
      }

      const message = error instanceof Error ? error.message : "";
      toast.error(message || "Não foi possível autenticar. Tente novamente.");
    } finally {
      resetTurnstile();
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "cpf") {
      const digits = getCpfDigits(value);
      setFormData({ ...formData, cpf: formatCpf(digits) });
      setFieldValidationState("cpf", "idle");
      return;
    }

    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 11);
      setFormData({ ...formData, phone: digits ? `55${digits}` : "" });
      setFieldValidationState("phone", "idle");
      return;
    }

    if (name === "email") {
      setFieldValidationState("email", "idle");
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleUniqueFieldBlur = (field: UniqueFieldKey) => {
    if (mode !== "register") {
      return;
    }

    if (field === "email") {
      const emailValue = formData.email.trim();
      if (emailValue && !isValidEmailFormat(emailValue)) {
        setFieldValidationState("email", "invalid", "Informe um e-mail válido.");
        return;
      }
    }

    if (!shouldValidateField(field, formData[field])) {
      setFieldValidationState(field, "idle");
      return;
    }

    void validateUniqueField(field, formData[field]);
  };

  const isRegister = mode === "register";
  const cpfDigits = getCpfDigits(formData.cpf);
  const phoneDigits = getPhoneDigits(formData.phone);
  const hasPasswordMismatch =
    isRegister &&
    formData.password &&
    formData.confirmPassword &&
    formData.password !== formData.confirmPassword;
  const hasMissingRequiredFields =
    isRegister &&
    (!formData.name.trim() ||
      !shouldValidateField("cpf", formData.cpf) ||
      !shouldValidateField("phone", formData.phone) ||
      !shouldValidateField("email", formData.email) ||
      !formData.password ||
      !formData.confirmPassword ||
      !cpfDigits ||
      !phoneDigits);

  const shouldDisableSubmit =
    isLoading ||
    !turnstileSiteKey ||
    !turnstileToken ||
    (isRegister &&
      (hasMissingRequiredFields ||
        hasPasswordMismatch ||
        fieldValidation.cpf.status === "loading" ||
        fieldValidation.email.status === "loading" ||
        fieldValidation.phone.status === "loading" ||
        fieldValidation.cpf.status === "invalid" ||
        fieldValidation.email.status === "invalid" ||
        fieldValidation.phone.status === "invalid"));


  const resendConfirmationEmail = async () => {
    const normalizedEmail = pendingConfirmationEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error("Informe seu e-mail para reenviar a confirmação.");
      return;
    }

    if (turnstileSiteKey && !turnstileToken) {
      toast.error("Confirme o desafio de segurança antes de reenviar.");
      return;
    }

    setIsResendingConfirmation(true);

    try {
      const { data, error } = await supabase.functions.invoke("resend-confirmation", {
        body: {
          email: normalizedEmail,
          turnstileToken,
          redirectTo: `${getAppBaseUrl()}/dashboard`,
        },
      });

      if (error) {
        const errorData = data as { errors?: string[] } | null;
        throw new Error(errorData?.errors?.[0] || error.message || "Erro ao reenviar.");
      }

      toast.success("E-mail de confirmação reenviado. Verifique sua caixa de entrada.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      toast.error(message || "Não foi possível reenviar o e-mail de confirmação.");
    } finally {
      resetTurnstile();
      setIsResendingConfirmation(false);
    }
  };

  const authenticateLoginWithEmailConfirmation = async (
    email: string,
    password: string,
  ): Promise<{ status: LoginAuthStatus; message?: string }> => {
    try {
      const { response, data } = await callAuthFunction("login-user", {
        email,
        password,
        turnstileToken,
      });

      if (!response.ok) {
        const message = getErrorMessage(data);
        if (response.status === 403 && message.toLowerCase().includes("confirma")) {
          return {
            status: "pending_confirmation",
            message:
              message ||
              "Seu cadastro está aguardando confirmação de e-mail. Confirme seu e-mail para entrar.",
          };
        }

        return {
          status: "error",
          message: message || "Credenciais inválidas.",
        };
      }

      const session = (data as { session?: { access_token?: string; refresh_token?: string } })
        .session;
      if (!session?.access_token || !session.refresh_token) {
        return {
          status: "error",
          message: "Não foi possível iniciar a sessão.",
        };
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      if (sessionError) {
        return {
          status: "error",
          message: sessionError.message,
        };
      }

      return { status: "success" };
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : "";
      return { status: "error", message: message || "Credenciais inválidas." };
    }
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
                  onBlur={() => handleUniqueFieldBlur("cpf")}
                  className={`pl-10 ${
                    fieldValidation.cpf.status === "invalid"
                      ? "border-destructive"
                      : ""
                  }`}
                  maxLength={14}
                  required
                />
              </div>
              {fieldValidation.cpf.status === "loading" && (
                <p className="text-xs text-muted-foreground">Validando CPF...</p>
              )}
              {fieldValidation.cpf.status === "valid" && (
                <p className="text-xs text-emerald-600">
                  {fieldValidation.cpf.message}
                </p>
              )}
              {fieldValidation.cpf.status === "invalid" && (
                <p className="text-xs text-destructive">
                  {fieldValidation.cpf.message}
                </p>
              )}
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
                  onBlur={() => handleUniqueFieldBlur("phone")}
                  className={`pl-16 ${
                    fieldValidation.phone.status === "invalid" ? "border-destructive" : ""
                  }`}
                  inputMode="numeric"
                  maxLength={11}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                O código do país 55 já está incluso. Digite DDD + número (11 dígitos).
              </p>
              {fieldValidation.phone.status === "loading" && (
                <p className="text-xs text-muted-foreground">
                  Validando telefone...
                </p>
              )}
              {fieldValidation.phone.status === "valid" && (
                <p className="text-xs text-emerald-600">
                  {fieldValidation.phone.message}
                </p>
              )}
              {fieldValidation.phone.status === "invalid" && (
                <p className="text-xs text-destructive">
                  {fieldValidation.phone.message}
                </p>
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
                onBlur={() => handleUniqueFieldBlur("email")}
                className={`pl-10 ${
                  fieldValidation.email.status === "invalid"
                    ? "border-destructive"
                    : ""
                }`}
                required
              />
            </div>
            {mode === "register" && fieldValidation.email.status === "loading" && (
              <p className="text-xs text-muted-foreground">
                Validando e-mail...
              </p>
            )}
            {mode === "register" && fieldValidation.email.status === "valid" && (
              <p className="text-xs text-emerald-600">
                {fieldValidation.email.message}
              </p>
            )}
            {mode === "register" && fieldValidation.email.status === "invalid" && (
              <p className="text-xs text-destructive">
                {fieldValidation.email.message}
              </p>
            )}
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
              className="w-full"
            />
            {turnstileError ? (
              <p className="text-sm text-destructive">{turnstileError}</p>
            ) : null}
          </div>

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

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={shouldDisableSubmit}
          >
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


          {mode === "login" && pendingConfirmationEmail && (
            <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p>
                Conta aguardando confirmação de e-mail para{" "}
                <strong>{pendingConfirmationEmail}</strong>.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={resendConfirmationEmail}
                disabled={isResendingConfirmation}
              >
                {isResendingConfirmation
                  ? "Reenviando..."
                  : "Reenviar e-mail de confirmação"}
              </Button>
            </div>
          )}
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
