/**
 * The Android app (Play Store job, 2026-10-29). The web game in dist/ (built with `npm run build:store`: no tester logging, no
 * collector, no service worker) wrapped by Capacitor 8. The android/ project is committed (reference/PLAY-STORE.md): CI only syncs the
 * web build into it and builds. The app id can never change after the first Play upload.
 */
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mshaffe1111.slothadventure',
  appName: 'Sloths Rainforest Adventures',
  webDir: 'dist',
  android: {
    // (no remote debugging of the shipped app; a debug build still allows it)
    webContentsDebuggingEnabled: false,
    allowMixedContent: false,
  },
  plugins: {
    // the bars are hidden natively (MainActivity: immersive); the plugin passes the notch's insets to the page as
    // --safe-area-inset-* CSS variables, for WebViews older than 140 where env(safe-area-inset-*) does not reach the page
    SystemBars: { insetsHandling: 'css' },
  },
};

export default config;
