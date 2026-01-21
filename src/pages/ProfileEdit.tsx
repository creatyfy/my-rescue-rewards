import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { fetchCurrentUserProfile, updateCurrentUserProfile } from "@/integrations/supabase/profile";

export default function ProfileEdit() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
  });
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const profile = await fetchCurrentUserProfile();

        if (!profile || !isMounted) {
          return;
        }

        setForm({
          fullName: profile.fullName ?? "",
          phone: profile.phone ?? "",
        });
        setEmail(profile.email ?? "");
      } catch (error) {
        console.error("Erro ao carregar dados pessoais:", error);
        toast.error("Não foi possível carregar seus dados.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field: "fullName" | "phone") => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsSaving(true);

    try {
      await updateCurrentUserProfile({
        fullName: form.fullName.trim() || null,
        phone: form.phone.trim() || null,
      });
      toast.success("Dados atualizados com sucesso.");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Não foi possível salvar as alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout title="Dados pessoais">
      <div className="container px-4 py-6">
        <div className="bg-card border border-border/50 rounded-2xl shadow-soft p-6">
          <h2 className="font-display font-semibold text-lg text-foreground mb-4">
            Informações principais
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                placeholder="Seu nome"
                value={form.fullName}
                onChange={handleChange("fullName")}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={email} disabled readOnly />
              <p className="text-xs text-muted-foreground">
                O e-mail é usado para login e não pode ser alterado aqui.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                value={form.phone}
                onChange={handleChange("phone")}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isSaving}>
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
