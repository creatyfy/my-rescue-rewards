import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";

const STORAGE_KEY = "profile-notification-preferences";

type NotificationPreferences = {
  marketingEmail: boolean;
  pointsSummary: boolean;
  receiptUpdates: boolean;
  whatsappAlerts: boolean;
};

const defaultPreferences: NotificationPreferences = {
  marketingEmail: true,
  pointsSummary: true,
  receiptUpdates: true,
  whatsappAlerts: false,
};

export default function ProfileNotifications() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as NotificationPreferences;
      setPreferences({ ...defaultPreferences, ...parsed });
    } catch (error) {
      console.error("Erro ao ler preferências:", error);
    }
  }, []);

  const togglePreference = (key: keyof NotificationPreferences) => () => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      toast.success("Preferências de notificações atualizadas.");
    } catch (error) {
      console.error("Erro ao salvar preferências:", error);
      toast.error("Não foi possível salvar as preferências.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout title="Notificações" showBack>
      <div className="container px-4 py-6 space-y-6">
        <div className="bg-card border border-border/50 rounded-2xl shadow-soft p-6 space-y-5">
          <div>
            <h2 className="font-display font-semibold text-lg text-foreground">
              Preferências de aviso
            </h2>
            <p className="text-sm text-muted-foreground">
              Escolha como deseja ser informado sobre movimentações e campanhas.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">Ofertas por e-mail</p>
                <p className="text-sm text-muted-foreground">
                  Receba novidades, cupons e campanhas exclusivas.
                </p>
              </div>
              <Switch checked={preferences.marketingEmail} onCheckedChange={togglePreference("marketingEmail")} />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">Resumo de pontos</p>
                <p className="text-sm text-muted-foreground">
                  Envie um resumo semanal do saldo e das metas.
                </p>
              </div>
              <Switch checked={preferences.pointsSummary} onCheckedChange={togglePreference("pointsSummary")} />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">Atualizações de comprovantes</p>
                <p className="text-sm text-muted-foreground">
                  Notifique quando seus comprovantes forem aprovados.
                </p>
              </div>
              <Switch checked={preferences.receiptUpdates} onCheckedChange={togglePreference("receiptUpdates")} />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">Avisos pelo WhatsApp</p>
                <p className="text-sm text-muted-foreground">
                  Receba alertas rápidos no WhatsApp cadastrado.
                </p>
              </div>
              <Switch checked={preferences.whatsappAlerts} onCheckedChange={togglePreference("whatsappAlerts")} />
            </div>
          </div>
        </div>

        <Button className="w-full" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Salvando..." : "Salvar preferências"}
        </Button>
      </div>
    </AppLayout>
  );
}
