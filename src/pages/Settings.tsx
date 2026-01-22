import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { bootstrapFirstAdmin, fetchAdminStatus } from "@/integrations/supabase/admin";

const initialPreferences = {
  notifications: true,
  promotions: false,
  pointsExpiration: true,
  darkMode: false,
};

export default function Settings() {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [adminLoading, setAdminLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [promoting, setPromoting] = useState(false);

  const togglePreference = (key: keyof typeof initialPreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    let mounted = true;

    const loadAdminStatus = async () => {
      setAdminLoading(true);
      try {
        const status = await fetchAdminStatus().catch(() => false);
        if (mounted) setIsAdmin(status);
      } finally {
        if (mounted) setAdminLoading(false);
      }
    };

    loadAdminStatus();
    return () => {
      mounted = false;
    };
  }, []);

  const handleBootstrapAdmin = async () => {
    setPromoting(true);
    try {
      const promoted = await bootstrapFirstAdmin();

      if (!promoted) {
        toast.error("Já existe um administrador cadastrado.");
        return;
      }

      toast.success("Administrador ativado com sucesso neste usuário.");
      setIsAdmin(true);
    } catch (error) {
      console.error("Erro ao ativar admin:", error);
      toast.error("Não foi possível ativar administrador.");
    } finally {
      setPromoting(false);
    }
  };

  return (
    <AppLayout title="Configurações">
      <div className="container px-4 py-6 space-y-6">
        <section className="bg-card border border-border/50 rounded-2xl shadow-soft p-6">
          <h2 className="font-display font-semibold text-lg text-foreground mb-4">
            Preferências gerais
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Alertas de pontos
                </p>
                <p className="text-xs text-muted-foreground">
                  Receba avisos sobre aprovação de comprovantes e resgates.
                </p>
              </div>
              <Switch
                checked={preferences.notifications}
                onCheckedChange={() => togglePreference("notifications")}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Ofertas e promoções
                </p>
                <p className="text-xs text-muted-foreground">
                  Ative para receber novidades e campanhas personalizadas.
                </p>
              </div>
              <Switch
                checked={preferences.promotions}
                onCheckedChange={() => togglePreference("promotions")}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Lembrete de expiração
                </p>
                <p className="text-xs text-muted-foreground">
                  Notificações sobre pontos próximos do vencimento.
                </p>
              </div>
              <Switch
                checked={preferences.pointsExpiration}
                onCheckedChange={() => togglePreference("pointsExpiration")}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Modo escuro automático
                </p>
                <p className="text-xs text-muted-foreground">
                  Ajuste visual automático conforme o tema do dispositivo.
                </p>
              </div>
              <Switch
                checked={preferences.darkMode}
                onCheckedChange={() => togglePreference("darkMode")}
              />
            </div>
          </div>
        </section>

        <section className="bg-card border border-border/50 rounded-2xl shadow-soft p-6">
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

        <section className="bg-card border border-border/50 rounded-2xl shadow-soft p-6">
          <h2 className="font-display font-semibold text-lg text-foreground mb-2">
            Administração
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ative o primeiro administrador do sistema (somente uma vez).
          </p>

          {adminLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : isAdmin ? (
            <div className="rounded-xl border border-border/50 p-4">
              <p className="text-sm font-medium text-foreground">Você já é administrador.</p>
              <p className="text-xs text-muted-foreground mt-1">
                O painel administrativo está disponível no seu Perfil.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Use este botão apenas no setup inicial. Se já existir um admin, a ativação será negada.
              </p>
              <Button onClick={handleBootstrapAdmin} disabled={promoting}>
                {promoting ? "Ativando..." : "Ativar admin neste usuário"}
              </Button>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
