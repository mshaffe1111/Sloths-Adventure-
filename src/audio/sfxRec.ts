/**
 * The recorded effect set (polish-sfx, Matt 2026-10-29: "pings everywhere... like pinball"): every effect is a set of real CC0 recordings
 * (src/assets/sfxrec/<effect>_<n>.mp3; their Freesound sources in reference/audio-previews/sfx-v1/LICENCES.md, built by
 * tools/audio/sfxv1/build.py). It replaces the synthesized effects outright.
 *
 * How a frequent effect avoids sounding like a machine gun:
 *   - several takes, played from a shuffle bag (every take once before any repeats, never the same one twice in a row);
 *   - a little pitch and gain jitter on each;
 *   - a shortest gap between two of the same, and a cap on how many may start together (the rest are dropped, not stacked);
 *   - each take's level from calib.py (TAKE_DB), so they sit where the loudness plan (SN-2) put the old ones.
 *
 * recFor() turns the game's old effect names (Conductor.fx) into the new ones; it is pure, so the tests check the mapping.
 */
import type { AudioCore } from './core.ts';
import { ENEMY_ORDER, unpackHit } from './combat.ts';
import { TAKE_DB } from './sfxRecLevels.ts';

/** what he is walking on: each has its own footsteps */
export type Surface = 'moss' | 'wood' | 'stone' | 'water';

/** each world's ground (World 6's mangrove boardwalks and World 8's treetop branches are wood; the caves, cliffs, ruins and fortress stone) */
export const WORLD_SURFACE: Readonly<Record<number, Surface>> = { 1: 'moss', 2: 'moss', 3: 'stone', 4: 'stone', 5: 'moss', 6: 'wood', 7: 'stone', 8: 'wood', 9: 'stone', 10: 'stone' };

export interface Rule {
  /** shortest gap between two (s) */
  gap: number;
  /** at most this many may start within 0.3 s; later ones are dropped */
  cap: number;
  /** pitch jitter, as a playback-rate fraction (+-) */
  pitch: number;
  /** gain jitter (+- dB) */
  gain: number;
}

const BASE: Rule = { gap: 0.03, cap: 3, pitch: 0.03, gain: 1 };
/** the effects that fire often get firmer rules; rewards are tuned, so they get almost no pitch jitter */
export const RULES: Readonly<Record<string, Partial<Rule>>> = {
  rock: { gap: 0.12, cap: 3, pitch: 0.05, gain: 1.5 },
  rockWarn: { gap: 0.8, cap: 1, pitch: 0.04 },
  flower: { gap: 0.09, cap: 3, pitch: 0.004, gain: 1.5 },
  stepMoss: { gap: 0.17, cap: 2, pitch: 0.04, gain: 1.5 },
  stepWood: { gap: 0.17, cap: 2, pitch: 0.04, gain: 1.5 },
  stepStone: { gap: 0.17, cap: 2, pitch: 0.04, gain: 1.5 },
  stepWater: { gap: 0.17, cap: 2, pitch: 0.04, gain: 1.5 },
  jump: { gap: 0.06, cap: 2, pitch: 0.04, gain: 1.5 },
  doubleJump: { gap: 0.06, cap: 2, pitch: 0.04, gain: 1.5 },
  swish: { gap: 0.07, cap: 2, pitch: 0.05, gain: 1.5 },
  landing: { gap: 0.08, cap: 2, pitch: 0.04, gain: 1.5 },
  vine: { gap: 0.1, cap: 2, pitch: 0.04, gain: 1.5 },
  climb: { gap: 0.3, cap: 1, pitch: 0.05, gain: 1.5 },
  windChime: { gap: 1.4, cap: 1, pitch: 0.03, gain: 1.5 },
  leaf: { gap: 0.04, cap: 3, pitch: 0.04, gain: 1.5 },
  fruit: { gap: 0.05, cap: 3, pitch: 0.004 },
  checkpoint: { gap: 0.5, cap: 1, pitch: 0 },
  splash: { gap: 0.3, cap: 1, pitch: 0.03 },
  uiTap: { gap: 0.04, cap: 2, pitch: 0.02 },
  star: { pitch: 0, gain: 0 },
  power: { pitch: 0, gain: 0 },
  superHeart: { pitch: 0, gain: 0 },
  relic: { pitch: 0, gain: 0 },
  oneUp: { pitch: 0, gain: 0 },
  bossSlam: { gap: 1, cap: 1, pitch: 0, gain: 0 },
};
/**
 * The mix on top of each take's level (dB): the sounds that fire all the time (footsteps, landings, jumps, petals: 150-200 a minute in a
 * busy run) add up, so they sit lower than one of them alone would. Measured in real play (tools/audio/sfxv1/capture.cjs, 1-2): with
 * them at calib's level the effects bus ran 4.7 LU over the music, at these about 1-2 LU under it; the rule is effects under the music
 * (SN-2, SN-7).
 */
export const MIX_DB: Readonly<Record<string, number>> = {
  stepMoss: -6, stepWood: -6, stepStone: -6, stepWater: -6, landing: -5, jump: -5, doubleJump: -3, flower: -4, swish: -3,
};

export const ruleFor = (fx: string): Rule => ({ ...BASE, ...(RULES[fx] ?? (fx.startsWith('hit_') ? { gap: 0.04 } : fx.startsWith('ko_') ? { gap: 0.1, cap: 2 } : {})) });

/** one recorded effect to play: which effect, and which of its takes it may use (all when left out) */
export interface RecCall {
  fx: string;
  takes?: number[];
}

const PUZZLE: Readonly<Record<string, string>> = { gate: 'gate', chime: 'windChime' };

/**
 * The game's old effect name and argument (as Conductor.fx receives them) -> the recorded effect, or null for the few the recorded set
 * does not cover (the predator calls, the boss roars (SN-4, Build 1), the level start and the low-health heartbeat), which keep their
 * synthesized versions.
 */
export function recFor(name: string, arg: number | undefined, surface: Surface = 'moss'): RecCall | null {
  const a = arg ?? 0;
  switch (name) {
    case 'jump':
    case 'doubleJump':
    case 'megaPunch':
    case 'flower':
    case 'leaf':
    case 'fruit':
    case 'heart':
    case 'superHeart':
    case 'relic':
    case 'critter':
    case 'hurt':
    case 'eagle':
    case 'climb':
    case 'checkpoint':
    case 'oneUp':
    case 'uiTap':
    case 'uiConfirm':
    case 'uiBack':
    case 'pauseIn':
    case 'pauseOut':
    case 'respawn':
    case 'vine':
    case 'rock':
    case 'rockWarn':
    case 'windChime':
    case 'bounce':
    case 'log':
    case 'crumble':
    case 'thorns':
    case 'gate':
    case 'bossSlam':
      return { fx: name };
    case 'punch':
    case 'kick':
    case 'whoosh':
      return { fx: 'swish' };
    case 'shrine':
      return { fx: 'pz_solved' };
    case 'bossAppear':
      return { fx: 'bossSlam' };
    case 'glide':
      return { fx: 'glide', takes: Math.round(a) === 0 ? [0] : Math.round(a) === 2 ? [4] : [1, 2, 3] };
    case 'power':
      return { fx: 'power', takes: [Math.max(0, Math.min(2, Math.round(a)))] };
    case 'star':
      return { fx: 'star', takes: [Math.max(0, Math.min(2, Math.round(a)))] };
    case 'land':
    case 'landing': {
      const s = arg ?? 0.4;
      return { fx: 'landing', takes: s < 0.35 ? [0, 1] : s < 0.7 ? [2, 3] : [4, 5] };
    }
    case 'splash': {
      const v = Math.max(0, Math.min(2, Math.round(a)));
      return { fx: 'splash', takes: [[0, 1], [2, 3], [4, 5]][v] };
    }
    case 'step':
      return { fx: { moss: 'stepMoss', wood: 'stepWood', stone: 'stepStone', water: 'stepWater' }[surface] };
    case 'hit': {
      const { heavy, material } = unpackHit(a);
      return { fx: `hit_${material}`, takes: heavy ? [3, 4, 5] : [0, 1, 2] };
    }
    case 'defeat': {
      const kind = ENEMY_ORDER[Math.round(a)] as string | undefined;
      if (!kind) return { fx: 'hit_generic', takes: [3, 4, 5] };
      return { fx: `ko_${kind === 'ant_hazard' ? 'ant' : kind}` };
    }
    case 'puzzle':
      return null; // (resolved by name in recForPuzzle: the kits pass their event's kind)
    default:
      return null;
  }
}

/** a puzzle kit's sound (sfxGame.ts PUZZLE_SOUNDS kind) -> its recorded effect */
export function recForPuzzle(kind: string): RecCall {
  return { fx: PUZZLE[kind] ?? `pz_${kind}` };
}

/** a shuffle bag: every take once before any repeats, never the same twice in a row (also across refills) */
export class Bags {
  private bags = new Map<string, number[]>();
  private last = new Map<string, number>();
  constructor(private rnd: () => number = Math.random) {}
  next(key: string, takes: number[]): number {
    let bag = this.bags.get(key);
    if (!bag || bag.length === 0) {
      bag = [...takes];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(this.rnd() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      // the next one drawn (the end) must not be the one just played
      if (bag.length > 1 && bag[bag.length - 1] === this.last.get(key)) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
      this.bags.set(key, bag);
    }
    const k = bag.pop()!;
    this.last.set(key, k);
    return k;
  }
}

/** the gap and burst rules: may an effect start at time t? (and record it if so) */
export class Gate {
  private lastAt = new Map<string, number>();
  private recent = new Map<string, number[]>();
  allow(fx: string, t: number): boolean {
    const r = ruleFor(fx);
    if (t - (this.lastAt.get(fx) ?? -1e9) < r.gap) return false;
    const rec = (this.recent.get(fx) ?? []).filter((x) => t - x < 0.3);
    if (rec.length >= r.cap) {
      this.recent.set(fx, rec);
      return false;
    }
    rec.push(t);
    this.recent.set(fx, rec);
    this.lastAt.set(fx, t);
    return true;
  }
}

/** the recorded takes, decoded: effect -> its takes in order (filled by sfxRecLoader.ts; empty in tests and until it has run) */
export const recBank = new Map<string, AudioBuffer[]>();

const bags = new Bags();
const gate = new Gate();

/** play a recorded effect now; false when it is gated (too soon, too many) or not loaded yet */
export function playRec(core: AudioCore, call: RecCall, opts: { pan?: number; db?: number } = {}): boolean {
  const list = recBank.get(call.fx);
  if (!list || list.length === 0) return false;
  const c = core.ctx;
  const t = c.currentTime;
  if (!gate.allow(call.fx, t)) return false;
  const all = list.map((_, i) => i);
  const takes = (call.takes ?? all).filter((i) => i < list.length);
  const k = bags.next(`${call.fx}:${takes.join(',')}`, takes.length ? takes : all);
  const r = ruleFor(call.fx);
  const src = c.createBufferSource();
  src.buffer = list[k];
  src.playbackRate.value = 1 + (Math.random() * 2 - 1) * r.pitch;
  const g = c.createGain();
  const db = (TAKE_DB[call.fx]?.[k] ?? 0) + (MIX_DB[call.fx] ?? 0) + (opts.db ?? 0) + (Math.random() * 2 - 1) * r.gain;
  g.gain.value = Math.pow(10, db / 20);
  src.connect(g);
  let node: AudioNode = g;
  if (opts.pan && 'createStereoPanner' in c) {
    const p = c.createStereoPanner();
    p.pan.value = opts.pan;
    g.connect(p);
    node = p;
  }
  node.connect(core.sfx);
  src.start(t);
  return true;
}
