package com.mshaffe1111.slothadventure;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.os.Build;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Android's audio focus (PLAY-STORE-RULES §4: "Ask for it when sound starts, let go when it stops"). The page says whether the game
 * wants sound (`want`: on when sound is on, off when the player mutes it; src/game/audioFocus.ts), and the game holds the focus only
 * while it wants sound and is in front: a muted game never stops the player's own music or podcast.
 *
 * The page hears every change as a "sloth-audio-focus" event (App.tsx): "lost" when something else takes it (a call ringing, an alarm,
 * another app's music) or a request is refused (a call in progress), "duck" when another app speaks for a moment (directions: the
 * game plays on quieter), and "back" when the sound is the game's again. After a permanent loss Android sends nothing more, so the
 * page asks again on the player's next touch (`want` while it is not held).
 */
@CapacitorPlugin(name = "AudioFocus")
public class AudioFocusPlugin extends Plugin {

    private AudioManager audio;
    private AudioFocusRequest focusRequest;
    /** the page wants sound (not muted); set by `want` */
    private boolean wanted = false;
    /** the game holds the focus (a short loss, with its gain to come, still counts as held) */
    private boolean held = false;
    /** the activity is in front */
    private boolean front = false;

    private final AudioManager.OnAudioFocusChangeListener onFocus = change -> {
        if (change == AudioManager.AUDIOFOCUS_LOSS) held = false;
        else if (change == AudioManager.AUDIOFOCUS_GAIN) held = true;
        send(change == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK ? "duck"
            : change == AudioManager.AUDIOFOCUS_LOSS || change == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT ? "lost"
            : "back");
    };

    @PluginMethod
    public void want(PluginCall call) {
        final boolean on = Boolean.TRUE.equals(call.getBoolean("on", false));
        getActivity().runOnUiThread(() -> {
            wanted = on;
            if (!on) abandon();
            else if (front && !held) request();
            call.resolve();
        });
    }

    @Override
    protected void handleOnResume() {
        front = true;
        if (wanted) request();
    }

    @Override
    protected void handleOnPause() {
        front = false;
        abandon();
    }

    private void request() {
        if (audio == null) audio = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
        if (audio == null) return;
        int result;
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
            result = audio.requestAudioFocus(focusRequest);
        } else {
            result = audio.requestAudioFocus(onFocus, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
        }
        boolean granted = result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED;
        held = granted;
        // (granted: a loss from before is over, the sound is the game's again; refused, as during a call: the game stays quiet)
        send(granted ? "back" : "lost");
    }

    private void abandon() {
        held = false;
        if (audio == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (focusRequest != null) audio.abandonAudioFocusRequest(focusRequest);
        } else {
            audio.abandonAudioFocus(onFocus);
        }
    }

    private void send(String state) {
        if (bridge == null) return;
        bridge.triggerWindowJSEvent("sloth-audio-focus", "{ \"state\": \"" + state + "\" }");
    }
}
