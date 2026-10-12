import type { CapacitorConfig } from '@capacitor/cli';

/**
 * App NATIVA com UI embutida em www/ (mesma interface do site no build).
 * NÃO usa server.url → não é um browser a abrir tchilopop.com.
 * Online: auth, feed cloud, mensagens, compras, lives.
 * Offline: shell da app, ecrãs estáticos, sessão em cache local.
 */
const config: CapacitorConfig = {
  appId: 'com.tchilo.isabstudio',
  appName: 'Tchilo',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    cleartext: false,
    allowNavigation: [
      'tchilopop.com',
      'www.tchilopop.com',
      '*.supabase.co',
      '*.supabase.in',
      'api.deezer.com',
      'corsproxy.io',
      'api.allorigins.win',
      'cdn.jsdelivr.net',
      'raw.githack.com',
      '*.paddle.com',
      '*.google.com',
      '*.googleapis.com'
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
