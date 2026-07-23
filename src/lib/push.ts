import { isNativePlatform } from "./native";
import { supabase } from "@/integrations/supabase/client";

// Registro de push notifications (só no app nativo). Idempotente.
let started = false;

export async function registerPush(): Promise<void> {
  if (!isNativePlatform() || started) return;

  const { PushNotifications } = await import("@capacitor/push-notifications");
  const { Capacitor } = await import("@capacitor/core");

  let perm = await PushNotifications.checkPermissions();
  if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") {
    perm = await PushNotifications.requestPermissions();
  }
  if (perm.receive !== "granted") return;

  started = true;

  // Token gerado pelo FCM/APNs → salva no banco
  await PushNotifications.addListener("registration", async (token) => {
    try {
      await supabase.rpc("save_device_token", {
        p_token: token.value,
        p_platform: Capacitor.getPlatform(),
      });
    } catch (err) {
      console.warn("[push] falha ao salvar token:", err);
    }
  });

  await PushNotifications.addListener("registrationError", (err) => {
    console.warn("[push] erro de registro:", err);
  });

  // Notificação recebida com o app aberto
  await PushNotifications.addListener("pushNotificationReceived", (notification) => {
    console.log("[push] recebida:", notification);
  });

  // Usuário tocou na notificação
  await PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    console.log("[push] ação:", action);
  });

  await PushNotifications.register();
}
