import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Switch } from "@/components/ui/switch";

const initialPreferences = {
  notifications: true,
  promotions: false,
  pointsExpiration: true,
  darkMode: false,
};

export default function Settings() {
  const [preferences, setPreferences] = useState(initialPreferences);

  const togglePreference = (key: keyof typeof initialPreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
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
      </div>
    </AppLayout>
  );
}
