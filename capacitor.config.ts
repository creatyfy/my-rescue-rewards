import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.meuresgate.app',
  appName: 'Meu Resgate',
  webDir: 'dist',
  backgroundColor: '#ffffff',
  // Faz o app nativo rodar com a origem https://meuresgate.com.br (servindo os
  // arquivos locais). Necessário pra o Cloudflare Turnstile validar o captcha
  // dentro do app — o widget só aceita os domínios cadastrados, e localhost
  // não está na lista. Também deixa a origem consistente com o site.
  server: {
    hostname: 'meuresgate.com.br',
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      backgroundColor: '#10b0e0',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
