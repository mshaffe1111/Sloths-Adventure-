/**
 * The Conductor runs the live sound of the game: it owns the Web Audio context, plays whichever piece of music
 * fits the scene, crossfades between pieces, raises and lowers the music's intensity with the action, ducks it
 * under stingers, muffles it when the game is paused, and fires the sound effects.
 *
 * Browsers only allow audio after a tap or key press, so nothing is created until `unlock()` is called from a
 * user gesture; scene changes asked for before that are remembered and start the moment audio is allowed.
 */
import { Ambience, type AmbientType } from './ambience.ts';
import { COMBO_WINDOW, nextVariant } from './combat.ts';
import { AudioCore } from './core.ts';
import { Playback, type KeyInfo } from './music.ts';
import { SFX, runFx } from './sfx.ts';
import { speechBlip } from './speech.ts';
import { playSting } from './stingers.ts';
import { themeById } from './themes.ts';

const LOOKAHEAD = 0.3;
const TICK_MS = 25;
const DEFAULT_KEY: KeyInfo = { tonic: 60, scale: [0, 2, 4, 5, 7, 9, 11] };

const KEY_MUSIC = 'sloth_music_vol';
const KEY_SFX = 'sloth_sfx_vol';
const KEY_MUTED = 'sloth_game_muted';

const readNum = (k: string, d: number) => {
  try {
    const v = localStorage.getItem(k);
    if (v !== null && v !== '' && !Number.isNaN(Number(v))) return Math.max(0, Math.min(1, Number(v)));
  } catch {
    /* storage can be unavailable */
  }
  return d;
};
const writeStr = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
};

export interface SceneOptions {
  /** crossfade length in seconds */
  fade?: number;
  /** starting intensity 0..1 */
  intensity?: number;
  /** restart the piece even if it is already playing */
  restart?: boolean;
  /** per-stage number: a different seed starts the same piece at a different point and develops it differently */
  seed?: number;
  /** playing speed, 1 = as written */
  tempo?: number;
}

/** minimum seconds between two plays of the same effect, so a held button or a coin spray never machine-guns */
const MIN_GAP: Record<string, number> = { step: 0.17, flower: 0.035, leaf: 0.04, fruit: 0.05, whoosh: 0.07, jump: 0.06, hit: 0.04, climb: 0.1, land: 0.08, uiTap: 0.04 };

export class Conductor {
  private ctx: AudioContext | null = null;
  private core: AudioCore | null = null;
  private amb: Ambience | null = null;
  private playback: Playback | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  private wantTheme: string | null = null;
  private wantKey: string | null = null;
  private wantOpts: SceneOptions = {};
  private wantAmbient: AmbientType | null = null;
  private intensity = 0.4;
  private paused = false;
  private lowHealth = false;
  private nextHeartbeat = 0;
  private lastFx = new Map<string, number>();
  private recentFx: number[] = [];
  private lite = false;
  private lastVariant = new Map<string, number>();
  private streak = 0;
  private lastHitAt = -10;

  musicVol = readNum(KEY_MUSIC, 1);
  sfxVol = readNum(KEY_SFX, 1);
  muted = (() => {
    try {
      return localStorage.getItem(KEY_MUTED) === 'true';
    } catch {
      return false;
    }
  })();

  get ready() {
    return this.core !== null;
  }

  /** call from any tap / key / click: creates (or wakes) the audio context */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      try {
        this.ctx = new AC({ latencyHint: 'interactive' });
      } catch {
        return;
      }
      this.core = new AudioCore(this.ctx);
      this.amb = new Ambience(this.core);
      this.lite = typeof navigator !== 'undefined' && /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) && (navigator.hardwareConcurrency ?? 8) <= 4;
      this.amb.lite = this.lite;
      this.applyVolumes(true);
      document.addEventListener('visibilitychange', this.onVisibility);
      this.timer = setInterval(this.tick, TICK_MS);
    }
    if (this.ctx.state !== 'running' && !this.muted && !document.hidden) this.ctx.resume().catch(() => {});
    // anything asked for before audio was allowed
    if (this.core && !this.playback && this.wantTheme) this.startTheme(this.wantTheme, this.wantOpts, true);
    if (this.core && this.wantAmbient && this.amb && !this.amb.type) this.amb.start(this.wantAmbient);
  }

  private onVisibility = () => {
    if (!this.ctx) return;
    if (document.hidden) this.ctx.suspend().catch(() => {});
    else if (!this.muted) this.ctx.resume().catch(() => {});
  };

  // ------------------------------------------------------------------------------------------- music

  /** play the piece for a scene (an id in THEMES), or null for silence */
  setScene(id: string | null, opts: SceneOptions = {}) {
    const key = id ? `${id}#${opts.seed ?? 0}` : null;
    if (key === this.wantKey && !opts.restart) {
      if (opts.intensity !== undefined) this.setIntensity(opts.intensity);
      return;
    }
    this.wantKey = key;
    this.wantTheme = id;
    this.wantOpts = opts;
    if (opts.intensity !== undefined) this.intensity = opts.intensity;
    if (!this.core) return;
    this.startTheme(id, opts, false);
  }

  private startTheme(id: string | null, opts: SceneOptions, first: boolean) {
    const core = this.core;
    if (!core) return;
    const fade = opts.fade ?? 1.4;
    const old = this.playback;
    this.playback = null;
    if (old) {
      old.retire(fade);
      setTimeout(() => old.dispose(), (fade + 4) * 1000);
    }
    if (!id) return;
    const theme = themeById(id);
    if (!theme) return;
    const pb = new Playback(core, theme, core.ctx.currentTime + 0.08, undefined, !first || !!old, { seed: opts.seed, tempo: opts.tempo });
    pb.liteMode = this.lite;
    pb.setIntensity(opts.intensity ?? this.intensity, true);
    this.playback = pb;
    pb.update(core.ctx.currentTime + LOOKAHEAD);
  }

  get scene() {
    return this.wantTheme;
  }

  setIntensity(v: number) {
    this.intensity = Math.max(0, Math.min(1, v));
    this.playback?.setIntensity(this.intensity);
  }

  /** speed the music up or down (1 = as written); eases in over a few bars. Used when a boss enrages. */
  setTempo(scale: number) {
    this.playback?.setTempo(scale);
  }

  /** the key of the music right now (sound effects play in it) */
  key(): KeyInfo {
    return this.playback?.key() ?? DEFAULT_KEY;
  }

  /** dip the music to `level` for `hold` seconds, then ease back */
  duck(level: number, hold: number, release = 1.0) {
    const core = this.core;
    if (!core) return;
    const g = core.musicDuck.gain;
    const t = core.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setTargetAtTime(level, t, 0.04);
    g.setTargetAtTime(1, t + hold, release / 3);
  }

  // ------------------------------------------------------------------------------------------- ambience

  setAmbient(type: AmbientType | null) {
    this.wantAmbient = type;
    if (!this.amb) return;
    if (type) this.amb.start(type);
    else this.amb.stop();
  }

  // ------------------------------------------------------------------------------------------- effects

  fx(name: string, arg?: number) {
    const core = this.core;
    if (!core || this.muted || !core.ctx || core.ctx.state !== 'running') return;
    if (!SFX[name]) return;
    const now = core.ctx.currentTime;
    const gap = MIN_GAP[name] ?? 0.02;
    if (now - (this.lastFx.get(name) ?? -1) < gap) return;
    this.lastFx.set(name, now);
    // a voice budget: in a frantic moment, drop the least important sounds first
    this.recentFx = this.recentFx.filter((x) => now - x < 0.12);
    const trivial = name === 'step' || name === 'leaf' || name === 'climb' || name === 'land';
    if (this.recentFx.length > (trivial ? 5 : 12)) return;
    this.recentFx.push(now);
    // a different version each time (never the same twice in a row), and a combo counter for landed hits
    const variant = nextVariant(this.lastVariant.get(name) ?? -1, 4, Math.random());
    this.lastVariant.set(name, variant);
    if (name === 'hit') {
      this.streak = now - this.lastHitAt < COMBO_WINDOW ? this.streak + 1 : 1;
      this.lastHitAt = now;
    } else if (name === 'defeat' && now - this.lastHitAt >= COMBO_WINDOW) {
      this.streak = 0;
    }
    runFx(name, core, this.key(), arg, { variant, streak: this.streak });
  }

  /** a piece of written music over the top; the music underneath ducks */
  sting(name: string) {
    const core = this.core;
    if (!core || this.muted || core.ctx.state !== 'running') return 0;
    const dur = playSting(core, name, core.ctx.currentTime + 0.05);
    this.duck(0.12, Math.max(0.2, dur - 1.6), 1.4);
    return dur;
  }

  speak(speaker: string, ch: string, index: number) {
    const core = this.core;
    if (!core || this.muted || core.ctx.state !== 'running') return;
    speechBlip(core, speaker, ch, index);
  }

  // ------------------------------------------------------------------------------------------- state

  setPaused(p: boolean) {
    this.paused = p;
    const core = this.core;
    if (!core) return;
    const t = core.ctx.currentTime;
    const open = Math.min(20000, core.ctx.sampleRate / 2 - 100);
    core.musicFilter.frequency.cancelScheduledValues(t);
    core.musicFilter.frequency.setTargetAtTime(p ? 650 : open, t, p ? 0.05 : 0.12);
    core.amb.gain.cancelScheduledValues(t);
    core.amb.gain.setTargetAtTime(p ? 0.18 * this.sfxVol : 0.6 * this.sfxVol, t, 0.1);
  }

  setLowHealth(on: boolean) {
    this.lowHealth = on;
  }

  setMuted(m: boolean) {
    this.muted = m;
    writeStr(KEY_MUTED, String(m));
    this.applyVolumes(false);
    const ctx = this.ctx;
    if (!ctx) return;
    if (m) setTimeout(() => this.muted && ctx.suspend().catch(() => {}), 350);
    else if (!document.hidden) ctx.resume().catch(() => {});
  }

  setMusicVolume(v: number) {
    this.musicVol = Math.max(0, Math.min(1, v));
    writeStr(KEY_MUSIC, String(this.musicVol));
    this.applyVolumes(false);
  }

  setSfxVolume(v: number) {
    this.sfxVol = Math.max(0, Math.min(1, v));
    writeStr(KEY_SFX, String(this.sfxVol));
    this.applyVolumes(false);
  }

  private applyVolumes(snap: boolean) {
    const core = this.core;
    if (!core) return;
    const t = core.ctx.currentTime;
    const set = (p: AudioParam, v: number) => {
      p.cancelScheduledValues(t);
      if (snap) p.setValueAtTime(v, t);
      else p.setTargetAtTime(v, t, 0.05);
    };
    set(core.master.gain, this.muted ? 0 : 1);
    set(core.music.gain, 0.32 * this.musicVol);
    set(core.sfx.gain, 0.9 * this.sfxVol);
    set(core.amb.gain, (this.paused ? 0.18 : 0.6) * this.sfxVol);
  }

  /** what is happening right now: used by tests and the debug overlay */
  debug() {
    const core = this.core;
    let rms = 0;
    let peak = 0;
    if (core) {
      const buf = new Float32Array(core.meter.fftSize);
      core.meter.getFloatTimeDomainData(buf);
      let sum = 0;
      for (const v of buf) {
        sum += v * v;
        peak = Math.max(peak, Math.abs(v));
      }
      rms = Math.sqrt(sum / buf.length);
    }
    return {
      state: this.ctx?.state ?? 'none',
      time: this.ctx?.currentTime ?? 0,
      scene: this.wantTheme,
      playing: this.playback?.theme.id ?? null,
      seed: this.playback?.seed ?? null,
      tempo: this.playback?.tempo ?? null,
      ambient: this.amb?.type ?? null,
      intensity: this.intensity,
      muted: this.muted,
      lite: this.lite,
      rms,
      peak,
    };
  }

  // ------------------------------------------------------------------------------------------- the clock

  private tick = () => {
    const core = this.core;
    if (!core || core.ctx.state !== 'running') return;
    const now = core.ctx.currentTime;
    const until = now + LOOKAHEAD;
    this.playback?.update(until);
    this.amb?.update(until);
    if (this.lowHealth && !this.paused && !this.muted && now >= this.nextHeartbeat) {
      this.nextHeartbeat = now + 1.15;
      SFX.heartbeat(core, this.key());
    }
  };
}
