package com.mshaffe1111.slothadventure;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.os.Build;
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
 * Sound: the game holds Android's audio focus while it is in front, as games do (other music stops). When something else takes it (a call
 * ringing, an alarm, another app's sound) the page gets a "sloth-audio-focus" event with state "lost" (the game goes silent), "duck"
 * (another app speaks for a moment, like directions: the game plays on quieter), and "back" when it returns
 * (App.tsx): the game's sound stops until then. Going to the background is the 'pause' event of @capacitor/app (App.tsx too).
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // (registered before the bridge starts: the screen stays on only during play, KeepAwakePlugin.java)
        registerPlugin(KeepAwakePlugin.class);
        super.onCreate(savedInstanceState);
        hideSystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        // (back from another app, a dialog or the shade: hide them again)
        if (hasFocus) hideSystemBars();
    }

    private AudioManager audio;
    private AudioFocusRequest focusRequest;
    private final AudioManager.OnAudioFocusChangeListener onFocus = change -> {
        if (bridge == null) return;
        String state = change == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK ? "duck"
            : change == AudioManager.AUDIOFOCUS_LOSS || change == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT ? "lost"
            : "back";
        bridge.triggerWindowJSEvent("sloth-audio-focus", "{ \"state\": \"" + state + "\" }");
    };

    @Override
    public void onResume() {
        super.onResume();
        if (audio == null) audio = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        if (audio == null) return;
        int granted;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (focusRequest == null) {
                AudioAttributes attrs = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_GAME)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build();
                focusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                    .setAudioAttributes(attrs)
                    .setOnAudioFocusChangeListener(onFocus)
                    .build();
            }
            granted = audio.requestAudioFocus(focusRequest);
        } else {
            granted = audio.requestAudioFocus(onFocus, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
        }
        // (a loss from before the game went away is over: the sound is ours again)
        if (granted == AudioManager.AUDIOFOCUS_REQUEST_GRANTED) onFocus.onAudioFocusChange(AudioManager.AUDIOFOCUS_GAIN);
    }

    @Override
    public void onPause() {
        super.onPause();
        if (audio == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (focusRequest != null) audio.abandonAudioFocusRequest(focusRequest);
        } else {
            audio.abandonAudioFocus(onFocus);
        }
    }

    private void hideSystemBars() {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat bars = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        bars.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        bars.hide(WindowInsetsCompat.Type.systemBars());
    }
}
