import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isNativePlatform } from "@/lib/native";
import { registerPush } from "@/lib/push";

/**
 * Inicializa recursos nativos (push + deep links) quando o app roda no celular.
 * Não renderiza nada. No navegador é no-op. Deve ficar DENTRO do Router.
 */
export function NativeBootstrap() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNativePlatform()) return;

    // ---- Push notifications ----
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void registerPush();
    });
    const { data: authSub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        void registerPush();
      }
    });

    // ---- Deep links (links do email/site abrindo o app) ----
    let appListener: { remove: () => void } | undefined;
    void (async () => {
      const { App } = await import("@capacitor/app");
      appListener = await App.addListener("appUrlOpen", async ({ url }) => {
        try {
          const parsed = new URL(url);

          // Links de auth (recovery/signup/magiclink) trazem os tokens no hash.
          const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ""));
          const access_token = hashParams.get("access_token");
          const refresh_token = hashParams.get("refresh_token");
          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
          }

          const path = (parsed.pathname || "/") + parsed.search + parsed.hash;
          navigate(path || "/");
        } catch (err) {
          console.warn("[deep-link] erro ao processar:", err);
        }
      });
    })();

    return () => {
      authSub.subscription.unsubscribe();
      appListener?.remove();
    };
  }, [navigate]);

  return null;
}
