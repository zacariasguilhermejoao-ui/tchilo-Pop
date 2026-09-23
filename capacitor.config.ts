import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tchilo.isabstudio',
  appName: 'tchilo-Pop',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    /* App nativa carrega o site ao vivo — mudanças no GitHub aparecem sem rebuild completo */
    url: 'https://tchilopop.com',
    androidScheme: 'https',
    cleartext: false,
    allowNavigation: [
      'tchilopop.com',
      '*.tchilopop.com',
      'api.deezer.com',
      '*.supabase.co',
      '*.supabase.in',
      'api.allorigins.win',
      'corsproxy.io'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 900,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
