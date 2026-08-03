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

  // Android: cria o canal de notificação com o som personalizado.
  // O canal precisa existir antes de a notificação chegar, e o envio
  // (send-push) precisa mandar channel_id = "meu_resgate_default".
  // No iOS o som vem do payload (aps.sound) apontando pro arquivo do bundle.
  if (Capacitor.getPlatform() === "android") {
    try {
      await PushNotifications.createChannel({
        id: "meu_resgate_default",
        name: "Meu Resgate",
        description: "Notificações do Meu Resgate",
        importance: 5,
        sound: "notification.wav",
        visibility: 1,
        vibration: true,
      });
    } catch (err) {
      console.warn("[push] falha ao criar canal:", err);
    }
  }

  // Token gerado pelo FCM (Android) / APNs (iOS) → salva no banco.
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

  await PushNotifications.addListener("pushNotificationReceived", (notification) => {
    console.log("[push] recebida:", notification);
  });

  await PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    console.log("[push] ação:", action);
  });

  await PushNotifications.register();
}
