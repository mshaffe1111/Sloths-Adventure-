package com.mshaffe1111.slothadventure;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

/**
 * The game full screen (Play Store job, 2026-10-29: Matt could not skip the story, its button was under the status bar's Wi-Fi icon).
 * Immersive: the status and navigation bars are hidden, and a swipe from the edge brings them back for a moment. The page still gets the
 * notch's insets (Capacitor's SystemBars plugin: --safe-area-inset-* CSS variables, and env() on WebView 140+). The screen stays on only
 * during play (KeepAwakePlugin.java).
 *
 * Sound: the game holds Android's audio focus while it is in front and its sound is on, and lets it go when muted
 * (AudioFocusPlugin.java). Going to the background is the 'pause' event of @capacitor/app (App.tsx).
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // (registered before the bridge starts: the screen stays on only during play, KeepAwakePlugin.java)
        registerPlugin(KeepAwakePlugin.class);
        // (the game holds Android's audio focus only while it has sound: AudioFocusPlugin.java)
        registerPlugin(AudioFocusPlugin.class);
        super.onCreate(savedInstanceState);
        hideSystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        // (back from another app, a dialog or the shade: hide them again)
        if (hasFocus) hideSystemBars();
    }

    private void hideSystemBars() {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat bars = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        bars.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        bars.hide(WindowInsetsCompat.Type.systemBars());
    }
}
