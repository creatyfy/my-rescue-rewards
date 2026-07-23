import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.meuresgate.app',
  appName: 'Meu Resgate',
  webDir: 'dist',
  backgroundColor: '#ffffff',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1400,
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
