/**
 * The Conductor runs the sound of the game: it owns the Web Audio context, plays whichever piece of music fits the
 * scene, crossfades between pieces, raises and lowers the music's intensity with the action, ducks it under
 * stingers, muffles it when the game is paused, and fires the sound effects.
 *
 * The music is recorded (loops.ts): each piece was played once by its orchestra, offline (tools/music), and the
 * game plays the recordings back, mixing their stems with the game's state. Nothing is composed while the game
 * runs; the effects, stingers and cues are still played live.
 *
 * Browsers only allow audio after a tap or key press, so nothing is created until `unlock()` is called from a
 * user gesture; scene changes asked for before that are remembered and start the moment audio is allowed.
 */
import { Ambience, type AmbientType } from './ambience.ts';
import { COMBO_WINDOW, nextVariant } from './combat.ts';
import { AudioCore, SFX_BUS } from './core.ts';
import type { KeyInfo } from './music.ts';
import { LoopPlayer } from './loops.ts';
import { recordingFor } from './recordings.ts';
import { SFX, runFx } from './sfx.ts';
import { playRec, recFor, recForPuzzle, type Surface } from './sfxRec.ts';
import { playSyllable, voiceReady } from './voiceBank.ts';
import { Speech, voiceOf, type Tone } from './voiceLine.ts';
import { playSting, STORY_STING_NAMES, stingDuck, stingVoices } from './stingers.ts';
import { CALM, type MusicState } from './adaptive.ts';
import { CUE_DUCK, CUE_NAMES, cuePlan, playCue, type CueName } from './cues.ts';
import { STINGS } from './stingers.ts';

// how far ahead of the audio clock the ambience is scheduled: long enough to ride out a stalled main thread
// (a level loading, a garbage collection) without it dropping out and then firing in one burst
const LOOKAHEAD = 0.6;
// (the music needs no clock: it is recorded. The ambience and the heartbeat are all the tick schedules)
const TICK_MS = 100;
/** the music bus level: the recordings already carry the old bus's 0.32 */
const MUSIC_LEVEL = 1;
/** a stage's piece is most often followed by the results' */
const AFTER_STAGE = 'results~c';
const DEFAULT_KEY: KeyInfo = { tonic: 60, scale: [0, 2, 4, 5, 7, 9, 11] };

/** a phone or tablet (they get the lighter sound and the roomier buffer) */
const PHONE = typeof navigator !== 'undefined' && /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);

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

/** the music under the pause menu: this share of its level, through the low-pass (SN-6) */
export const PAUSED_MUSIC = 0.45;
/** the music under speech (SN-7): -5 dB, in 80 ms, out over 400 ms (a time constant of a third: about 95% there in that time) */
export const SPEECH_DUCK = 10 ** (-5 / 20);
export const SPEECH_ATTACK = 0.08;
export const SPEECH_RELEASE = 0.4;

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
  /** lay a piece written as one loop out as a form (the stage music; see form.ts) */
  form?: boolean;
}

/** minimum seconds between two plays of the same effect, so a held button or a coin spray never machine-guns */
const MIN_GAP: Record<string, number> = { step: 0.17, flower: 0.035, leaf: 0.04, fruit: 0.05, whoosh: 0.07, jump: 0.06, hit: 0.04, climb: 0.3, land: 0.08, landing: 0.08, uiTap: 0.04, glide: 0.03 };

export class Conductor {
  private ctx: AudioContext | null = null;
  private core: AudioCore | null = null;
  private amb: Ambience | null = null;
  private loops: LoopPlayer | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  private wantTheme: string | null = null;
  private wantKey: string | null = null;
  private wantOpts: SceneOptions = {};
  private wantAmbient: AmbientType | null = null;
  private intensity = 0.4;
  /** the game's state the music follows (adaptive.ts) */
  private mstate: MusicState = CALM;
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

  /** true while sound is wanted but the browser has not let it start yet (no tap so far, or the phone suspended it) */
  get locked(): boolean {
    return !this.muted && (!this.ctx || this.ctx.state !== 'running') && !(this.ctx && document.hidden);
  }
  /** when (performance.now) a tap last woke locked audio: the same tap must not also count as a press on a mute button */
  wokeAt = -1e9;
  private announce = () => {
    try {
      window.dispatchEvent(new Event('sloth-audio-state'));
    } catch {
      /* no window */
    }
  };

  /**
   * creates (or wakes) the audio context. Call it from any tap / key / click (`fromTap`); calling it with no tap, as the page does at load, only
   * prepares the audio (and plays if this browser allows sound without a tap, as an installed app often does).
   */
  unlock(fromTap = false) {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      let ctx: AudioContext;
      try {
        // a phone gets a roomier buffer: with the smallest one ('interactive') the sound crackled and broke up on Android while the
        // game was busy drawing (the control test, 2026-10-24). 'balanced' costs a few hundredths of a second of delay on the effects.
        ctx = new AC({ latencyHint: PHONE ? 'balanced' : 'interactive' });
        // iPhones follow the ringer switch for Web Audio unless the page says this is playback, not a notification
        const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
        if (session) session.type = 'playback';
        // a phone gets the light room (core.ts): the two long convolution rooms were too much for a busy iPhone's sound
        this.core = new AudioCore(ctx, { lightRoom: PHONE, recorded: true });
      } catch {
        this.core = null;
        // the context was made before the core failed: close it, or every later tap would make (and leak) another one
        try {
          void (ctx! as AudioContext | undefined)?.close();
        } catch {
          /* already gone */
        }
        return;
      }
      this.ctx = ctx;
      ctx.onstatechange = this.announce;
      // the recorded sounds load in the background; until they are ready the effects use their synthesized layers
      void import('./sampleLoader.ts').then((m) => m.loadSamples(this.core as AudioCore)).catch(() => {});
      // the recorded effect set: decoded at once, the frequent moves first, so the first jump already has its sound
      void import('./sfxRecLoader.ts').then((m) => m.loadRec(this.core as AudioCore)).catch(() => {});
      // the orchestra the game's stingers and cues play on (the music no longer needs it: it is recorded)
      this.warmEffects();
      // the recorded music: its manifest and files' addresses, then whatever piece was asked for in the meantime
      const core = this.core;
      void import('./musicFiles.ts')
        .then((m) => {
          if (this.core !== core) return;
          this.loops = new LoopPlayer(ctx, core.music, m.manifest, m.musicUrl);
          if (this.wantTheme) this.startTheme(this.wantTheme, this.wantOpts, true);
        })
        .catch(() => {});
      this.amb = new Ambience(this.core);
      // every phone plays the lighter arrangement (fewer voices at once): the full one was too much for a busy phone's sound
      this.lite = PHONE;
      this.amb.lite = this.lite;
      this.core.lite = this.lite;
      this.applyVolumes(true);
      document.addEventListener('visibilitychange', this.onVisibility);
      this.timer = setInterval(this.tick, TICK_MS);
    }
    if (this.ctx.state !== 'running' && !this.muted && !document.hidden && !this.appAway) {
      if (fromTap) this.wokeAt = performance.now();
      this.ctx.resume().then(this.announce, () => {});
    }
    this.announce();
    // anything asked for before audio was allowed
    if (this.core && this.loops && !this.loops.playing && this.wantTheme) this.startTheme(this.wantTheme, this.wantOpts, true);
    if (this.core && this.wantAmbient && this.amb && !this.amb.type) this.amb.start(this.wantAmbient);
  }

  private stingsWarm = false;
  /** fetch, once, the recordings the story's stings play, so the first one is not played by the stand-in voices (the cue pieces have usually loaded most of them) */
  warmStoryStings() {
    const core = this.core;
    if (!core || this.stingsWarm) return;
    this.stingsWarm = true;
    void import('./orchLoader.ts')
      .then((m) => {
        const need = new Set<string>();
        for (const n of STORY_STING_NAMES) for (const v of stingVoices(n)) for (const g of m.VOICE_GROUPS[v] ?? []) if (!core.orch.has(g)) need.add(g);
        return need.size ? m.loadOrch(core, need) : undefined;
      })
      .catch(() => {});
  }

  private appAway = false;
  private onVisibility = () => {
    if (!this.ctx) return;
    if (document.hidden || this.appAway) this.ctx.suspend().catch(() => {});
    else if (!this.muted) this.ctx.resume().catch(() => {});
  };
  private ducked = false;
  /** another app speaks for a moment over the Android app (directions, a notification): play on at a quarter of the volume */
  setDucked(on: boolean) {
    if (on === this.ducked) return;
    this.ducked = on;
    this.applyVolumes(false);
  }
  /** the Android app went to the background or a call came in (its 'pause' event, which can come without the page being hidden), or came back */
  appHidden(away: boolean) {
    this.appAway = away;
    this.onVisibility();
  }

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
    const loops = this.loops;
    if (!loops) return;
    const fade = first ? 0.02 : opts.fade ?? 1.4;
    const rec = id ? recordingFor(loops.manifest, id, opts.seed) : null;
    loops.setIntensity(opts.intensity ?? this.intensity, true);
    loops.setState(this.mstate, true);
    // the piece most likely to come next is decoded while this one plays: once the crossfade is over, so no more than two pieces are
    // ever held at once (the phones' memory: 35 MB playing, 70 at the most)
    loops.prefetch(null);
    if (this.aheadTimer) clearTimeout(this.aheadTimer);
    this.aheadTimer = null;
    void loops.play(rec, fade, !!opts.restart).then(() => {
      if (!opts.form || loops.playing !== rec) return;
      this.aheadTimer = setTimeout(() => {
        if (loops.playing === rec) loops.prefetch(AFTER_STAGE);
      }, (fade + 1) * 1000);
    });
  }

  private aheadTimer: ReturnType<typeof setTimeout> | null = null;
  private effectsWarm = false;
  /** fetch, once, the recordings the game's stingers and cues play (the victory, the boss's arrival, the checkpoint's bells) */
  private warmEffects() {
    const core = this.core;
    if (!core || this.effectsWarm) return;
    this.effectsWarm = true;
    void import('./orchLoader.ts')
      .then((m) => {
        const voices = new Set<string>();
        for (const n of Object.keys(STINGS)) for (const v of stingVoices(n)) voices.add(v);
        for (const n of CUE_NAMES) {
          const p = cuePlan(n, DEFAULT_KEY, 0.5);
          for (const x of [...p.notes, ...p.chords, ...p.hits]) voices.add(x.voice);
        }
        const need = new Set<string>();
        for (const v of voices) for (const g of m.VOICE_GROUPS[v] ?? []) need.add(g);
        return m.loadOrch(core, need);
      })
      .catch(() => {});
  }

  get scene() {
    return this.wantTheme;
  }

  setIntensity(v: number) {
    this.intensity = Math.max(0, Math.min(1, v));
    this.loops?.setIntensity(this.intensity);
  }

  /**
   * What is happening in the stage, for the music to follow (adaptive.ts): danger, dark, the exit, a puzzle room, a boss's phase, a story
   * beat's mood. Only the fields given change; the music answers on its next bar line, with fades.
   */
  setMusicState(s: Partial<MusicState>) {
    this.mstate = { ...this.mstate, ...s };
    this.loops?.setState(s);
  }

  get musicState(): MusicState {
    return this.mstate;
  }

  /** an in-key stinger over the music (cues.ts), placed on the music's next eighth note; the music dips a little under it */
  cue(name: CueName) {
    const core = this.core;
    if (!core || this.muted || core.ctx.state !== 'running') return 0;
    const now = core.ctx.currentTime + 0.03;
    const lp = this.loops;
    const t = lp ? lp.gridAfter(now) : now;
    const dur = playCue(core, name, this.key(), t, lp?.beatDur ?? 0.5);
    this.duck(CUE_DUCK[name], Math.max(0.2, dur * 0.6), 0.8);
    return dur;
  }

  /**
   * Speed the music up or down (1 = as written). The music is recorded at its written speed, so this does nothing now (a recording
   * played faster rises in pitch); kept so the game's calls stay as they were.
   */
  setTempo(_scale: number) {}

  /** the key of the music right now (sound effects play in it) */
  key(): KeyInfo {
    return this.loops?.key() ?? DEFAULT_KEY;
  }

  /**
   * The story's hand on the music under a picture (storyDirect.ts): `silence` fades it right out (about a second), `under` to half,
   * `keep` and `swell` back to full (a swell also lifts the piece a step fuller). Any other screen puts it back to full.
   */
  storyMusic(move: 'keep' | 'under' | 'silence' | 'swell') {
    const core = this.core;
    if (!core) return;
    const g = core.storyLevel.gain;
    const t = core.ctx.currentTime;
    const to = move === 'silence' ? 0 : move === 'under' ? 0.5 : 1;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    // (out over about a second; back in a little slower, so the music finds its way back rather than snapping on)
    g.setTargetAtTime(to, t, to < g.value ? 0.35 : 0.6);
    if (move === 'swell') this.setIntensity(this.intensity + 0.2);
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

  /** what he is walking on (the footsteps): set by the game per world, and to water while he wades */
  surface: Surface = 'moss';

  /** a puzzle kit's action, by its sound's kind (sfxGame.ts PUZZLE_SOUNDS): the recorded set's sound for it */
  puzzleFx(kind: string) {
    const core = this.core;
    if (!core || this.muted || !core.ctx || core.ctx.state !== 'running') return;
    playRec(core, recForPuzzle(kind));
  }

  fx(name: string, arg?: number) {
    const core = this.core;
    if (!core || this.muted || !core.ctx || core.ctx.state !== 'running') return;
    // the recorded set (sfxRec.ts) plays everything it covers, with its own takes, gaps and caps
    const rec = recFor(name, arg, this.surface);
    if (rec) {
      playRec(core, rec);
      return;
    }
    if (!SFX[name]) return;
    const now = core.ctx.currentTime;
    const gap = MIN_GAP[name] ?? 0.02;
    if (now - (this.lastFx.get(name) ?? -1) < gap) return;
    this.lastFx.set(name, now);
    // a voice budget: in a frantic moment, drop the least important sounds first
    this.recentFx = this.recentFx.filter((x) => now - x < 0.12);
    const trivial = name === 'step' || name === 'leaf' || name === 'climb' || name === 'land' || name === 'landing';
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

  /** one of the story's short stings (see STORY_STINGS) as a picture appears: the music dips under it only a little, then comes back */
  storySting(name: string) {
    const core = this.core;
    if (!core || this.muted || core.ctx.state !== 'running') return 0;
    const dur = playSting(core, name, core.ctx.currentTime + 0.05);
    if (dur > 0) this.duck(stingDuck(name), Math.max(0.2, dur - 1.4), 1.2);
    return dur;
  }

  /** the voices of a story's speakers, fetched as the story opens (a voice not yet arrived is silent) */
  warmVoices(speakers: Iterable<string>) {
    const core = this.core;
    if (!core) return;
    const slugs = new Set<string>();
    for (const s of speakers) {
      const v = voiceOf(s);
      if (v) slugs.add(v.slug);
    }
    void import('./voice.ts').then((m) => m.loadVoices(core, slugs)).catch(() => {});
  }

  private speech = new Speech();
  /** letter `index` of a story line has just appeared: its speaker's voice says a syllable if one is due (voiceLine.ts) */
  speak(speaker: string, text: string, index: number, tone?: Tone) {
    const core = this.core;
    if (!core || this.muted || core.ctx.state !== 'running') return;
    const v = voiceOf(speaker);
    if (!v) return;
    if (!voiceReady(v.slug)) void import('./voice.ts').then((m) => m.loadVoices(core, [v.slug])).catch(() => {});
    const now = core.ctx.currentTime;
    const due = this.speech.next(speaker, text, index, now, tone);
    if (due && playSyllable(core, due.slug, due.syl) > 0) {
      this.speech.played(text, index, now);
      this.speechDip();
    }
  }

  /** a soft chirp from Dot as her bubble opens, once per line (SN-7: her lines in play had no sound at all): two of her syllables, "chirrup" */
  dotChirp() {
    const core = this.core;
    if (!core || this.muted || core.ctx.state !== 'running') return;
    if (!voiceReady('dot')) void import('./voice.ts').then((m) => m.loadVoices(core, ['dot'])).catch(() => {});
    if (playSyllable(core, 'dot', { take: 0, semis: 0, db: -3 }) > 0) {
      window.setTimeout(() => this.core && playSyllable(this.core, 'dot', { take: 2, semis: 2, db: -4 }), 80);
      this.speechDip(0.5);
    }
  }

  /**
   * The music dips under speech (SN-7): SPEECH_DUCK, in 80 ms, held while the letters come (each blip holds it), back up over 400 ms
   * `hold` s after the last one.
   */
  private speechDip(hold = 0.25) {
    const core = this.core;
    if (!core) return;
    const g = core.speechDuck.gain;
    const t = core.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setTargetAtTime(SPEECH_DUCK, t, SPEECH_ATTACK / 3);
    g.setTargetAtTime(1, t + hold, SPEECH_RELEASE / 3);
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
    // (the world's tune goes on under the pause menu at 45%, muffled: SN-6)
    core.musicDuck.gain.cancelScheduledValues(t);
    core.musicDuck.gain.setTargetAtTime(p ? PAUSED_MUSIC : 1, t, p ? 0.05 : 0.12);
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
    else if (!document.hidden && !this.appAway) ctx.resume().catch(() => {});
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
    set(core.master.gain, this.muted ? 0 : this.ducked ? 0.25 : 1);
    set(core.music.gain, MUSIC_LEVEL * this.musicVol);
    set(core.sfx.gain, SFX_BUS * this.sfxVol);
    set(core.amb.gain, (this.paused ? 0.18 : 0.6) * this.sfxVol);
    // the reverb and echo tails follow the same volumes as the dry sound
    set(core.sends.music.gain, this.musicVol);
    set(core.musicEchoSend.gain, this.musicVol);
    set(core.sends.sfx.gain, this.sfxVol);
    set(core.sends.amb.gain, (this.paused ? 0.3 : 1) * this.sfxVol);
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
      playing: this.loops?.playing ?? null,
      section: '',
      musicState: this.mstate,
      seed: this.wantOpts.seed ?? null,
      tempo: this.loops?.playing ? 1 : null,
      ambient: this.amb?.type ?? null,
      intensity: this.intensity,
      muted: this.muted,
      lite: this.lite,
      rms,
      peak,
    };
  }

  // ------------------------------------------------------------------------------------------- the clock

  /**
   * how much the sound clock fell behind real time since the last report (ms): the audio hardware running dry, heard as a crackle or a
   * gap. The control test logs it with the frame rate (engine.ts).
   */
  private lagMs = 0;
  /** ticks since the last report, and how many of them found the final output silent while music was meant to be playing: a mix that cuts
   *  out between effects (heard on an iPhone, 2026-10-28) shows here even when the sound clock keeps time */
  private heardTicks = 0;
  private silentTicks = 0;
  private meterBuf: Float32Array<ArrayBuffer> | null = null;
  private lastTickReal = 0;
  private lastTickAudio = 0;
  private ticks = 0;
  /** a short line for the control test's recording: light or full sound, the buffer, and the sound lost since the last call */
  report(): string {
    const ctx = this.ctx;
    if (!ctx) return 'no sound';
    const lag = Math.max(0, Math.round(this.lagMs));
    this.lagMs = 0;
    const silent = this.heardTicks ? Math.round((100 * this.silentTicks) / this.heardTicks) : 0;
    this.heardTicks = this.silentTicks = 0;
    return `${this.lite ? 'lite' : 'full'} ${ctx.state} buf${Math.round((ctx.baseLatency ?? 0) * 1000)}ms lag${lag}ms silent${silent}%`;
  }

  private tick = () => {
    const core = this.core;
    if (!core || core.ctx.state !== 'running') {
      this.lastTickReal = 0;
      return;
    }
    const now = core.ctx.currentTime;
    const real = performance.now();
    if (this.lastTickReal && real - this.lastTickReal < 1000) {
      // the sound clock should move with real time: when it moves less, the hardware went without sound for that long
      // (the sound clock moves in steps of a buffer, so a tick can be a little behind and the next a little ahead: add both, and only
      // a real loss of sound adds up)
      this.lagMs += real - this.lastTickReal - (now - this.lastTickAudio) * 1000;
    }
    this.lastTickReal = real;
    this.lastTickAudio = now;
    // (every other tick: the meter's read is the costliest thing the tick does)
    if (this.loops?.playing && !this.paused && !this.muted && (this.ticks++ & 1) === 0) {
      // the meter holds the last ~40 ms of the final output: music that is playing is never that quiet
      const buf = (this.meterBuf ??= new Float32Array(new ArrayBuffer(core.meter.fftSize * 4)));
      core.meter.getFloatTimeDomainData(buf);
      let peak = 0;
      for (let i = 0; i < buf.length; i += 4) peak = Math.max(peak, Math.abs(buf[i]));
      this.heardTicks++;
      if (peak < 0.0005) this.silentTicks++;
    }
    this.amb?.update(now + LOOKAHEAD);
    if (this.lowHealth && !this.paused && !this.muted && now >= this.nextHeartbeat) {
      this.nextHeartbeat = now + 1.15;
      SFX.heartbeat(core, this.key());
    }
  };
}
