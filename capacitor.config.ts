import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.scbc.safetycheck',
  appName: 'SafetyCheckPro',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Enable live updates from your deployed URL
    // url: 'https://your-deployed-app-url.com'  // Uncomment when deployed
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