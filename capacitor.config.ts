import type { CapacitorConfig } from '@capacitor/cli';

/**
 * App NATIVA — carrega ficheiros locais em www/.
 * NÃO definir server.url (isso abria tchilopop.com na WebView).
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
      '*.supabase.co',
      '*.supabase.in',
      'api.deezer.com',
      'corsproxy.io',
      'api.allorigins.win',
      'cdn.jsdelivr.net',
      'raw.githack.com'
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
