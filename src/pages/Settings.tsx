import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Switch } from "@/components/ui/switch";
import { resolveAdminAccess } from "@/integrations/supabase/admin";

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

  const togglePreference = (key: keyof typeof initialPreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    let mounted = true;

    const loadAdminStatus = async () => {
      setAdminLoading(true);
      try {
        const status = await resolveAdminAccess().catch(() => false);
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

  return (
    <AppLayout title="Configurações" showBack>
      <div className="container px-4 py-6 space-y-6">
        <section className="bg-card border border-border/50 rounded-2xl shadow-soft p-4 sm:p-6">
          <h2 className="font-display font-semibold text-lg text-foreground mb-4">
            Preferências gerais
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-xl border border-border/50 p-4">
              <div className="flex-1 min-w-0">
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
                className="shrink-0"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-xl border border-border/50 p-4">
              <div className="flex-1 min-w-0">
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
                className="shrink-0"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-xl border border-border/50 p-4">
              <div className="flex-1 min-w-0">
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
                className="shrink-0"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-xl border border-border/50 p-4">
              <div className="flex-1 min-w-0">
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
                className="shrink-0"
              />
            </div>
          </div>
        </section>


        {isAdmin && (
          <section className="bg-card border border-border/50 rounded-2xl shadow-soft p-4 sm:p-6">
            <h2 className="font-display font-semibold text-lg text-foreground mb-2">
              Administração
            </h2>
            <div className="rounded-xl border border-border/50 p-4">
              <p className="text-sm font-medium text-foreground">Você é administrador.</p>
              <p className="text-xs text-muted-foreground mt-1">
                O painel administrativo está disponível no menu lateral.
              </p>
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
