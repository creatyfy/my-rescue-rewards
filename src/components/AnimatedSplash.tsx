import { useEffect, useState } from "react";
import { isNativePlatform } from "@/lib/native";
import splashSymbol from "@/assets/splash-symbol.png";
import splashWordmark from "@/assets/splash-wordmark.png";

/**
 * Splash animado (somente no app nativo).
 *
 * Sequência:
 *  1. fundo com gradiente ciano (igual ao splash estático nativo);
 *  2. o símbolo "R" entra da esquerda e o texto "meu Resgate" entra da
 *     direita — os dois se encontram no centro formando a logo;
 *  3. um brilho pulsa quando eles se encontram;
 *  4. a tagline aparece por baixo;
 *  5. tudo faz fade-out e o componente é desmontado, revelando o app.
 *
 * O splash nativo do Capacitor é escondido assim que este componente monta
 * (launchAutoHide:false no capacitor.config.ts), então não há "replay".
 */
export function AnimatedSplash() {
  // só faz sentido no app nativo; na web nem monta.
  const [visible, setVisible] = useState(() => isNativePlatform());
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!visible) return;

    // esconde o splash estático nativo assim que a animação começa.
    let cancelled = false;
    (async () => {
      try {
        const { SplashScreen } = await import("@capacitor/splash-screen");
        if (!cancelled) await SplashScreen.hide();
      } catch {
        /* plugin ausente na web — ignora */
      }
    })();

    // inicia o fade-out perto do fim e desmonta ao terminar.
    const startLeave = setTimeout(() => setLeaving(true), 3900);
    const unmount = setTimeout(() => setVisible(false), 4600);

    return () => {
      cancelled = true;
      clearTimeout(startLeave);
      clearTimeout(unmount);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className={`splash-root ${leaving ? "splash-root--leaving" : ""}`}
    >
      <div className="splash-logo">
        <img
          src={splashSymbol}
          alt=""
          className="splash-symbol"
          draggable={false}
        />
        <img
          src={splashWordmark}
          alt=""
          className="splash-wordmark"
          draggable={false}
        />
      </div>
      <p className="splash-tagline">Acumule pontos. Resgate prêmios.</p>
    </div>
  );
}

export default AnimatedSplash;
