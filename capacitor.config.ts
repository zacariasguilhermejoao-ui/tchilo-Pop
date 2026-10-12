import type { CapacitorConfig } from '@capacitor/cli';

/**
 * App nativa = mesma interface do site (login, criar conta, feed…).
 * server.url → tchilopop.com para não ficar preso a snapshot antigo no AAB.
 */
const config: CapacitorConfig = {
  appId: 'com.tchilo.isabstudio',
  appName: 'Tchilo',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    url: 'https://tchilopop.com',
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
