/**
 * polish-sfx previews: renders a timeline of effects offline (OfflineAudioContext, through the game's whole master chain, the phone's light
 * room) so old and new can be heard side by side. Driven by tools/audio/sfxv1/render.mjs. Not part of the game.
 *
 *   old events {t, fx, arg}: played by the game's own effect code (runFx, or the game set where that exists), with the conductor's rules
 *   (MIN_GAP, the voice budget, a new variant each time, the hit streak), copied from conductor.ts
 *   new events {t, buf, gain, rate}: one decoded recording, played as the new effect player will play it
 *   amb: the old synthesized ambience of that type; bed: a recorded bed (buffer index) under everything
 */
import { AudioCore } from '../../../../src/audio/core.ts';
import { runFx } from '../../../../src/audio/sfx.ts';
import { Ambience, type AmbientType } from '../../../../src/audio/ambience.ts';
import { bytesOf } from '../../../../src/audio/sampleLoader.ts';

const files = import.meta.glob('../../../../src/assets/sfx/*.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
// the game set exists only on branches that have it (polish-audio): optional
const gameMods = import.meta.glob('../../../../src/audio/sfxGame.ts', { eager: true }) as Record<string, { playGameFx?: (n: string, c: AudioCore, k: unknown, a?: number) => boolean }>;
const playGameFx = Object.values(gameMods)[0]?.playGameFx;
const KEY = { tonic: 60, scale: [0, 2, 4, 5, 7, 9, 11] };
const SR = 48000;
const MIN_GAP: Record<string, number> = { step: 0.17, flower: 0.035, leaf: 0.04, fruit: 0.05, whoosh: 0.07, jump: 0.06, hit: 0.04, climb: 0.3, land: 0.08, landing: 0.08, uiTap: 0.04, glide: 0.03 };

interface Ev { t: number; fx?: string; arg?: number; buf?: number; gain?: number; rate?: number; pan?: number }

function b64(d: Float32Array): string {
  const u8 = new Uint8Array(d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength));
  let s = '';
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return btoa(s);
}
function unb64(s: string): ArrayBuffer {
  const bin = atob(s);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u.buffer;
}

(window as unknown as Record<string, unknown>).renderMix = async (o: { events: Ev[]; dur: number; amb?: AmbientType; bufs?: string[]; bed?: { buf: number; gain: number } }) => {
  const ctx = new OfflineAudioContext(2, Math.ceil(SR * o.dur), SR);
  const core = new AudioCore(ctx, { lightRoom: true });
  core.sfx.gain.value = 0.9;
  core.amb.gain.value = 0.6;
  for (const [path, url] of Object.entries(files)) {
    const m = /\/([A-Za-z]+)_(\d+)\.mp3$/.exec(path);
    if (!m) continue;
    const buf = await ctx.decodeAudioData(await bytesOf(url));
    const list = core.samples.get(m[1]) ?? [];
    list[Number(m[2])] = buf;
    core.samples.set(m[1], list);
  }
  for (const [g, list] of core.samples) core.samples.set(g, list.filter(Boolean));
  const bufs: AudioBuffer[] = [];
  for (const s of o.bufs ?? []) bufs.push(await ctx.decodeAudioData(unb64(s)));
  if (o.amb) {
    const a = new Ambience(core);
    a.start(o.amb, 0.05);
    a.update(o.dur);
  }
  if (o.bed) {
    const src = ctx.createBufferSource();
    src.buffer = bufs[o.bed.buf];
    src.loop = true;
    const g = ctx.createGain();
    g.gain.value = o.bed.gain;
    src.connect(g);
    g.connect(core.amb);
    src.start(0);
  }
  // the old conductor's rules
  const last = new Map<string, number>();
  const lastVar = new Map<string, number>();
  let recent: number[] = [];
  let streak = 0;
  let lastHit = -9;
  const played: string[] = [];
  const evs = [...o.events].sort((a, b) => a.t - b.t);
  const fire = (e: Ev) => {
    if (e.buf !== undefined) {
      const src = ctx.createBufferSource();
      src.buffer = bufs[e.buf];
      src.playbackRate.value = e.rate ?? 1;
      const g = ctx.createGain();
      g.gain.value = e.gain ?? 1;
      src.connect(g);
      let n: AudioNode = g;
      if (e.pan) {
        const p = ctx.createStereoPanner();
        p.pan.value = e.pan;
        g.connect(p);
        n = p;
      }
      n.connect(core.sfx);
      src.start(ctx.currentTime);
      return;
    }
    const name = e.fx!;
    const now = ctx.currentTime;
    if (now - (last.get(name) ?? -1) < (MIN_GAP[name] ?? 0.02)) return;
    last.set(name, now);
    recent = recent.filter((x) => now - x < 0.12);
    const trivial = name === 'step' || name === 'leaf' || name === 'climb' || name === 'land' || name === 'landing';
    if (recent.length > (trivial ? 5 : 12)) return;
    recent.push(now);
    let v = Math.floor(Math.random() * 4);
    if (v === lastVar.get(name)) v = (v + 1 + Math.floor(Math.random() * 3)) % 4;
    lastVar.set(name, v);
    if (name === 'hit') {
      streak = now - lastHit < 1.1 ? streak + 1 : 1;
      lastHit = now;
    }
    played.push(name);
    if (!(playGameFx && playGameFx(name, core, KEY, e.arg))) runFx(name, core, KEY as never, e.arg, { variant: v, streak });
  };
  // group events on the render quantum and suspend there
  const q = 128 / SR;
  const groups = new Map<number, Ev[]>();
  for (const e of evs) {
    const k = Math.max(1, Math.round(e.t / q));
    if (k * q >= o.dur) continue;
    (groups.get(k) ?? groups.set(k, []).get(k)!).push(e);
  }
  for (const [k, es] of groups) {
    ctx.suspend(k * q).then(() => {
      for (const e of es) fire(e);
      ctx.resume();
    });
  }
  const out = await ctx.startRendering();
  return { l: b64(out.getChannelData(0)), r: b64(out.getChannelData(1)), played: played.length };
};
(window as unknown as Record<string, unknown>).ready = true;
