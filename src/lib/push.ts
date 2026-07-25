import { isNativePlatform } from "./native";
import { supabase } from "@/integrations/supabase/client";

// Registro de push notifications (só no app nativo). Idempotente.
let started = false;

// Diagnóstico: grava cada etapa no banco (tabela push_debug) pra sabermos
// onde o registro trava no iOS. Nunca lança erro.
async function dbg(stage: string, detail?: string): Promise<void> {
  try {
    await supabase.rpc("log_push_debug", { p_stage: stage, p_detail: detail ?? null });
  } catch {
    /* ignora */
  }
}

export async function registerPush(): Promise<void> {
  if (!isNativePlatform() || started) return;

  const { PushNotifications } = await import("@capacitor/push-notifications");
  const { Capacitor } = await import("@capacitor/core");

  const platform = Capacitor.getPlatform();
  await dbg("register_start", platform);

  let perm = await PushNotifications.checkPermissions();
  if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") {
    perm = await PushNotifications.requestPermissions();
  }
  await dbg("permission", perm.receive);
  if (perm.receive !== "granted") return;

  started = true;

  // Token gerado pelo FCM/APNs → salva no banco
  await PushNotifications.addListener("registration", async (token) => {
    await dbg("registration_ok", "len=" + (token?.value?.length ?? 0));
    try {
      await supabase.rpc("save_device_token", {
        p_token: token.value,
        p_platform: Capacitor.getPlatform(),
      });
      await dbg("token_saved", "len=" + (token?.value?.length ?? 0));
    } catch (err) {
      await dbg("token_save_error", String(err));
      console.warn("[push] falha ao salvar token:", err);
    }
  });

  await PushNotifications.addListener("registrationError", async (err) => {
    await dbg("registration_error", JSON.stringify(err));
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

  await dbg("before_register", platform);
  await PushNotifications.register();
  await dbg("after_register_call", platform);
}
