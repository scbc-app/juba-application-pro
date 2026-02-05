module.exports = {
  appId: 'com.scbc.safetycheck',
  appName: 'SafetyCheckPro',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://scbc-app.github.io/juba-application-pro'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
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
  },
  electron: {
    deepLinkingEnabled: true,
    customUrlScheme: 'safetycheckpro',
    trayIconAndMenuEnabled: false,
    splashScreenEnabled: true,
    splashScreenImageName: 'splash.png',
    backgroundColor: '#ffffff'
  }
};