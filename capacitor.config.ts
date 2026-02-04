import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.scbc.safetycheck',
  appName: 'SafetyCheckPro',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Live updates from deployed GitHub Pages
    url: 'https://scbc-app.github.io/juba-application-pro'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;