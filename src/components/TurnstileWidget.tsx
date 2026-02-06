import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const SCRIPT_ID = "turnstile-script";

const ensureTurnstileLoaded = () =>
  new Promise<void>((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () =>
        reject(new Error("Não foi possível carregar o Turnstile.")),
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Não foi possível carregar o Turnstile."));
    document.body.appendChild(script);
  });

type TurnstileWidgetProps = {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  onWidgetId?: (id: string) => void;
  className?: string;
};

export const TurnstileWidget = ({
  siteKey,
  onVerify,
  onExpire,
  onError,
  onWidgetId,
  className,
}: TurnstileWidgetProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!siteKey) {
      return;
    }

    const renderWidget = async () => {
      try {
        await ensureTurnstileLoaded();
        if (!isMounted || !containerRef.current || !window.turnstile) {
          return;
        }

        if (widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current);
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => onVerify(token),
          "expired-callback": () => {
            onVerify("");
            onExpire?.();
          },
          "error-callback": () => {
            onVerify("");
            onError?.();
          },
        });

        if (widgetIdRef.current) {
          onWidgetId?.(widgetIdRef.current);
        }
      } catch (error) {
        console.error("Erro ao renderizar Turnstile:", error);
        onError?.();
      }
    };

    void renderWidget();

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [onError, onExpire, onVerify, onWidgetId, siteKey]);

  return <div ref={containerRef} className={className} />;
};
